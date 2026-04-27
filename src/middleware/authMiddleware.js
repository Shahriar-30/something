import jwt from "jsonwebtoken";
import { User, BusinessMember } from "../models/index.js";
import { sendUnauthorized } from "../utils/response/index.js";
import { logger } from "../config/logger.js";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Authentication middleware
 * Verifies JWT token and attaches user/business context to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      return sendUnauthorized(res, "Access token is required");
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Validate required fields
    if (!decoded.userId || !decoded.activeBusinessId || !decoded.activeRole) {
      return sendUnauthorized(res, "Invalid token structure");
    }

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return sendUnauthorized(res, "User not found");
    }

    // Verify business membership is still active
    const membership = await BusinessMember.findOne({
      businessId: decoded.activeBusinessId,
      userId: decoded.userId,
      status: "active",
    });

    if (!membership) {
      return sendUnauthorized(res, "Business access revoked");
    }

    // Verify role matches
    if (membership.role !== decoded.activeRole) {
      return sendUnauthorized(res, "Role mismatch - please re-authenticate");
    }

    // Attach user and business context to request
    req.user = {
      userId: decoded.userId,
      activeBusinessId: decoded.activeBusinessId,
      activeRole: decoded.activeRole,
    };

    // Attach full user object for convenience
    req.userProfile = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendUnauthorized(res, "Token expired");
    } else if (error.name === "JsonWebTokenError") {
      return sendUnauthorized(res, "Invalid token");
    }

    logger.error("Authentication middleware error", {
      error: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
    });

    return sendUnauthorized(res, "Authentication failed");
  }
};

/**
 * Business scope middleware
 * Ensures all business-scoped operations use the active business ID
 * This middleware should be applied to all routes that operate on business data
 */
export const businessScope = (req, res, next) => {
  // Attach active business ID to request for easy access
  req.businessId = req.user.activeBusinessId;
  next();
};

/**
 * Role-based access control middleware
 * Checks if user has required role(s) for the operation
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const { activeRole } = req.user;

    if (!allowedRoles.includes(activeRole)) {
      return sendUnauthorized(
        res,
        `Access denied. Required role: ${allowedRoles.join(" or ")}`
      );
    }

    next();
  };
};

/**
 * Permission-based access control middleware
 * More granular permissions beyond basic roles
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const { activeRole } = req.user;

    // Define permissions per role
    const rolePermissions = {
      owner: [
        "manage_business",
        "manage_members",
        "manage_invitations",
        "view_all_data",
        "delete_business",
        "manage_billing",
      ],
      admin: [
        "manage_members",
        "manage_invitations",
        "view_all_data",
        "manage_business_settings",
      ],
      staff: ["manage_own_data", "view_team_data"],
      viewer: ["view_business_data", "view_contacts", "view_pipeline"],
    };

    const userPermissions = rolePermissions[activeRole] || [];

    if (!userPermissions.includes(permission)) {
      return sendUnauthorized(
        res,
        `Access denied. Permission required: ${permission}`
      );
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * For routes that work with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (decoded.userId && decoded.activeBusinessId && decoded.activeRole) {
        const user = await User.findById(decoded.userId);
        const membership = await BusinessMember.findOne({
          businessId: decoded.activeBusinessId,
          userId: decoded.userId,
          status: "active",
        });

        if (user && membership && membership.role === decoded.activeRole) {
          req.user = {
            userId: decoded.userId,
            activeBusinessId: decoded.activeBusinessId,
            activeRole: decoded.activeRole,
          };
          req.userProfile = user;
          req.businessId = decoded.activeBusinessId;
        }
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth - continue without user context
    next();
  }
};
