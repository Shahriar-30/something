import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Business, BusinessMember } from "../models/index.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
} from "../utils/response/index.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

/**
 * Generate JWT token with user and business context
 */
const generateToken = (userId, activeBusinessId, activeRole) => {
  return jwt.sign(
    {
      userId,
      activeBusinessId,
      activeRole,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Get user's businesses with roles
 */
const getUserBusinesses = async (userId) => {
  const pipeline = [
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "active",
      },
    },
    {
      $lookup: {
        from: "businesses",
        localField: "businessId",
        foreignField: "_id",
        as: "business",
      },
    },
    { $unwind: "$business" },
    {
      $project: {
        id: "$business._id",
        name: "$business.name",
        role: "$role",
      },
    },
  ];

  return BusinessMember.aggregate(pipeline);
};

/**
 * Register new user and create first business
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, businessName } = req.validated.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return sendError(res, "User with this email already exists", 409);
  }

  // Create user
  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
  });

  await user.setPassword(password);
  await user.save();

  // Create business
  const business = new Business({
    name: businessName.trim(),
    createdBy: user._id,
  });
  await business.save();

  // Create business membership as owner
  const membership = new BusinessMember({
    businessId: business._id,
    userId: user._id,
    role: "owner",
  });
  await membership.save();

  // Set active business
  user.activeBusiness = business._id;
  await user.save();

  // Get businesses for response
  const businesses = await getUserBusinesses(user._id);
  const activeBusiness = businesses.find(
    (b) => b.id.toString() === business._id.toString()
  );

  // Generate tokens
  const token = generateToken(user._id, business._id, "owner");
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token hash
  await user.setRefreshToken(refreshToken);
  await user.save();

  logger.info("User registered successfully", {
    userId: user._id,
    email: user.email,
    businessId: business._id,
  });

  return sendSuccess(res, "Registration successful", {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    activeBusiness,
    businesses,
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    return sendUnauthorized(res, "Invalid credentials");
  }

  // Verify password
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return sendUnauthorized(res, "Invalid credentials");
  }

  // Get user's businesses
  const businesses = await getUserBusinesses(user._id);
  if (businesses.length === 0) {
    return sendError(res, "No active business memberships found", 403);
  }

  // Determine active business (use user's activeBusiness or first business)
  let activeBusiness = businesses.find(
    (b) => b.id.toString() === user.activeBusiness?.toString()
  );
  if (!activeBusiness) {
    activeBusiness = businesses[0];
    user.activeBusiness = activeBusiness.id;
    await user.save();
  }

  // Generate tokens
  const token = generateToken(user._id, activeBusiness.id, activeBusiness.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token hash
  await user.setRefreshToken(refreshToken);
  await user.save();

  logger.info("User logged in successfully", {
    userId: user._id,
    email: user.email,
    activeBusinessId: activeBusiness.id,
  });

  return sendSuccess(res, "Login successful", {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    activeBusiness,
    businesses,
  });
});

/**
 * Switch active business
 */
export const switchBusiness = asyncHandler(async (req, res) => {
  const { id: businessId } = req.validated.params;
  const { userId } = req.user;

  // Verify user has access to this business
  const membership = await BusinessMember.findOne({
    businessId,
    userId,
    status: "active",
  });

  if (!membership) {
    return sendForbidden(res, "Access denied to this business");
  }

  // Update user's active business
  await User.findByIdAndUpdate(userId, { activeBusiness: businessId });

  // Get updated business info
  const businesses = await getUserBusinesses(userId);
  const activeBusiness = businesses.find((b) => b.id.toString() === businessId);

  // Generate new token with updated business context
  const token = generateToken(userId, businessId, membership.role);

  logger.info("User switched business", {
    userId,
    fromBusinessId: req.user.activeBusinessId,
    toBusinessId: businessId,
    role: membership.role,
  });

  return sendSuccess(res, "Business switched successfully", {
    token,
    activeBusiness,
    businesses,
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendUnauthorized(res, "Invalid refresh token");
    }

    // Verify refresh token hash
    const isValidRefreshToken = await user.compareRefreshToken(refreshToken);
    if (!isValidRefreshToken) {
      return sendUnauthorized(res, "Invalid refresh token");
    }

    // Get user's businesses
    const businesses = await getUserBusinesses(user._id);
    if (businesses.length === 0) {
      return sendError(res, "No active business memberships found", 403);
    }

    // Determine active business
    let activeBusiness = businesses.find(
      (b) => b.id.toString() === user.activeBusiness?.toString()
    );
    if (!activeBusiness) {
      activeBusiness = businesses[0];
    }

    // Generate new access token
    const token = generateToken(
      user._id,
      activeBusiness.id,
      activeBusiness.role
    );

    return sendSuccess(res, "Token refreshed successfully", {
      token,
      activeBusiness,
    });
  } catch (error) {
    return sendUnauthorized(res, "Invalid refresh token");
  }
});

/**
 * Logout user (invalidate refresh token)
 */
export const logout = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Clear refresh token hash
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });

  logger.info("User logged out", { userId });

  return sendSuccess(res, "Logged out successfully");
});
