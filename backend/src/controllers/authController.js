import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Business, BusinessMember, Otp } from "../models/index.js";
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
} from "../utils/response/index.js";
import { sendEmail } from "../utils/email/index.js";
import {
  renderEmailVerificationTemplate,
  renderPasswordResetTemplate,
} from "../utils/email/templates.js";
import { asyncHandler } from "../utils/response/helpers.js";
import { logger } from "../config/logger.js";
import { env } from "../config/env.js";

const {
  NODE_ENV,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  EMAIL_VERIFICATION_CODE_TTL_MINUTES,
} = env;

const getCookieMaxAge = (expiresIn) => {
  if (!expiresIn || typeof expiresIn !== "string") {
    return 30 * 24 * 60 * 60 * 1000;
  }

  if (/^\d+$/.test(expiresIn)) {
    return Number(expiresIn) * 1000;
  }

  const match = expiresIn.match(/^(\d+)([smhd])$/i);
  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "strict",
  maxAge: getCookieMaxAge(REFRESH_TOKEN_EXPIRES_IN),
  path: "/",
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    ...refreshTokenCookieOptions,
    maxAge: 0,
  });
};

const getEmailVerificationCodeTtlMinutes = () =>
  parseInt(EMAIL_VERIFICATION_CODE_TTL_MINUTES, 10) || 15;

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

  // Generate verification code and send email
  const verificationCode = await Otp.createOtp({
    userId: user._id,
    type: "emailVerification",
    ttlMinutes: getEmailVerificationCodeTtlMinutes(),
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Verify your email address",
      html: renderEmailVerificationTemplate({
        code: verificationCode,
        expiresInMinutes: getEmailVerificationCodeTtlMinutes(),
      }),
      text: `Your email verification code is ${verificationCode}. It expires in ${getEmailVerificationCodeTtlMinutes()} minutes.`,
    });
  } catch (emailError) {
    logger.error("Email delivery failed on register", {
      error: emailError?.message,
      email: user.email,
    });
    return sendError(
      res,
      "Unable to send verification email. Check email configuration.",
      500,
      emailError
    );
  }

  logger.info("User registered successfully", {
    userId: user._id,
    email: user.email,
    businessId: business._id,
  });

  return sendSuccess(
    res,
    "Registration successful. Verification code sent to your email.",
    {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: false,
      },
      activeBusiness,
      businesses,
    }
  );
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

  if (!user.emailVerified) {
    return sendForbidden(
      res,
      "Email address is not verified. Please verify your email before logging in."
    );
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

  // Set refresh token in an HttpOnly cookie
  setRefreshTokenCookie(res, refreshToken);

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
      emailVerified: user.emailVerified,
    },
    activeBusiness,
    businesses,
  });
});

/**
 * Get current authenticated user profile
 */
export const getMe = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const user = await User.findById(userId).select("-passwordHash -refreshTokenHash");
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const businesses = await getUserBusinesses(userId);
  const activeBusiness = businesses.find(
    (b) => b.id.toString() === user.activeBusiness?.toString()
  );

  return sendSuccess(res, "User profile retrieved successfully", {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
    },
    activeBusiness,
    businesses,
  });
});

/**
 * Change user password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.validated.body;

  const user = await User.findById(userId);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  const isValidPassword = await user.comparePassword(currentPassword);
  if (!isValidPassword) {
    return sendError(res, "Invalid current password", 400);
  }

  await user.setPassword(newPassword);
  await user.save();

  logger.info("User changed password", { userId });

  return sendSuccess(res, "Password changed successfully");
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
  const refreshToken =
    req.validated.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    return sendUnauthorized(res, "Refresh token is required");
  }

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

    // Rotate refresh token and persist new hash
    const newRefreshToken = generateRefreshToken(user._id);
    await user.setRefreshToken(newRefreshToken);
    await user.save();
    setRefreshTokenCookie(res, newRefreshToken);

    return sendSuccess(res, "Token refreshed successfully", {
      token,
      refreshToken: newRefreshToken,
      activeBusiness,
    });
  } catch (error) {
    return sendUnauthorized(res, "Invalid refresh token");
  }
});

/**
 * Verify email and auto-login the user
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, code } = req.validated.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return sendUnauthorized(res, "Invalid verification credentials");
  }

  if (user.emailVerified) {
    return sendError(res, "Email is already verified", 409);
  }

  const isValidCode = await Otp.verifyOtp({
    userId: user._id,
    type: "emailVerification",
    code,
  });

  if (!isValidCode) {
    return sendUnauthorized(res, "Invalid or expired verification code");
  }

  user.emailVerified = true;
  await user.save();

  const businesses = await getUserBusinesses(user._id);
  if (businesses.length === 0) {
    return sendError(res, "No active business memberships found", 403);
  }

  let activeBusiness = businesses.find(
    (b) => b.id.toString() === user.activeBusiness?.toString()
  );
  if (!activeBusiness) {
    activeBusiness = businesses[0];
    user.activeBusiness = activeBusiness.id;
    await user.save();
  }

  const token = generateToken(user._id, activeBusiness.id, activeBusiness.role);
  const refreshToken = generateRefreshToken(user._id);
  await user.setRefreshToken(refreshToken);
  await user.save();
  setRefreshTokenCookie(res, refreshToken);

  logger.info("User email verified and auto-logged in", {
    userId: user._id,
    email: user.email,
  });

  return sendSuccess(res, "Email verified successfully", {
    token,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: true,
    },
    activeBusiness,
    businesses,
  });
});

/**
 * Resend email verification code
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return sendError(res, "User with this email does not exist", 404);
  }

  if (user.emailVerified) {
    return sendError(res, "Email is already verified", 409);
  }

  const verificationCode = await Otp.createOtp({
    userId: user._id,
    type: "emailVerification",
    ttlMinutes: getEmailVerificationCodeTtlMinutes(),
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Your email verification code",
      html: renderEmailVerificationTemplate({
        code: verificationCode,
        expiresInMinutes: getEmailVerificationCodeTtlMinutes(),
      }),
      text: `Your email verification code is ${verificationCode}. It expires in ${getEmailVerificationCodeTtlMinutes()} minutes.`,
    });
  } catch (emailError) {
    logger.error("Email delivery failed on resend verification", {
      error: emailError?.message,
      email: user.email,
      stack: emailError?.stack,
    });

    const errorMessage = `Unable to send verification email. ${
      emailError?.message || "Unknown error"
    }`;

    return sendError(res, errorMessage, 500, emailError);
  }

  return sendSuccess(res, "Verification code resent successfully");
});

/**
 * Request password reset OTP via email
 */
export const passwordResetRequest = asyncHandler(async (req, res) => {
  const { email } = req.validated.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return sendError(res, "User with this email does not exist", 404);
  }

  const resetCode = await Otp.createOtp({
    userId: user._id,
    type: "passwordReset",
    ttlMinutes: getEmailVerificationCodeTtlMinutes(),
  });

  try {
    await sendEmail({
      to: user.email,
      subject: "Password reset code",
      html: renderPasswordResetTemplate({
        code: resetCode,
        expiresInMinutes: getEmailVerificationCodeTtlMinutes(),
      }),
      text: `Your password reset code is ${resetCode}. It expires in ${getEmailVerificationCodeTtlMinutes()} minutes.`,
    });
  } catch (emailError) {
    logger.error("Email delivery failed on password reset request", {
      error: emailError?.message,
      email: user.email,
    });
    return sendError(
      res,
      "Unable to send password reset email. Check email configuration.",
      500,
      emailError
    );
  }

  return sendSuccess(res, "Password reset code sent successfully");
});

/**
 * Confirm password reset using OTP and set a new password
 */
export const passwordResetConfirm = asyncHandler(async (req, res) => {
  const { email, code, password } = req.validated.body;

  const user = await User.findByEmail(email);
  if (!user) {
    return sendUnauthorized(res, "Invalid password reset credentials");
  }

  const isValidCode = await Otp.verifyOtp({
    userId: user._id,
    type: "passwordReset",
    code,
  });

  if (!isValidCode) {
    return sendUnauthorized(res, "Invalid or expired password reset code");
  }

  await user.setPassword(password);
  user.refreshTokenHash = null;
  await user.save();

  logger.info("User password reset successfully", {
    userId: user._id,
    email: user.email,
  });

  return sendSuccess(res, "Password reset successfully");
});

/**
 * Logout user (invalidate refresh token)
 */
export const logout = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  // Clear refresh token hash
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });

  // Clear the refresh token cookie
  clearRefreshTokenCookie(res);

  logger.info("User logged out", { userId });

  return sendSuccess(res, "Logged out successfully");
});
