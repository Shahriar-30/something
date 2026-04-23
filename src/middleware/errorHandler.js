/**
 * Error Handling Middleware
 *
 * This module provides comprehensive error handling for the SaaS application.
 * It includes global error handling, response time tracking, and security-focused
 * error responses that don't expose sensitive information to end users.
 *
 * Key Features:
 * - Global error catching and processing
 * - Database-specific error handling (MongoDB/Mongoose)
 * - Authentication error handling (JWT)
 * - Response time monitoring
 * - Security-focused error responses
 * - Detailed developer logging
 */

import { logger } from "../config/logger.js";
import { sendError } from "../utils/response/error.js";

/**
 * Global Error Handler Middleware
 *
 * Catches and processes all unhandled errors in the application.
 * Provides appropriate HTTP status codes and user-friendly error messages
 * while logging detailed error information for developers.
 *
 * Error Types Handled:
 * - ValidationError: Mongoose validation errors (400)
 * - CastError: Invalid data type casting (400)
 * - Duplicate Key Error (11000): Database constraint violations (409)
 * - JsonWebTokenError: Invalid JWT tokens (401)
 * - TokenExpiredError: Expired JWT tokens (401)
 * - Generic errors: Internal server errors (500)
 *
 * @param {Error} err - The error object thrown/caught
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function (unused in error handlers)
 */
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = 500; // Default to internal server error
  let message = "Internal Server Error"; // Default user-friendly message

  // Handle specific error types with appropriate status codes and messages
  if (err.name === "ValidationError") {
    // Mongoose validation errors (missing required fields, invalid data types)
    statusCode = 400;
    message = "Validation Error";
  } else if (err.name === "CastError") {
    // Invalid ObjectId or data type casting errors
    statusCode = 400;
    message = "Invalid data format";
  } else if (err.code === 11000) {
    // MongoDB duplicate key error (unique constraint violations)
    statusCode = 409;
    message = "Duplicate field value";
  } else if (err.name === "JsonWebTokenError") {
    // JWT token is malformed or invalid
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    // JWT token has expired
    statusCode = 401;
    message = "Token expired";
  }

  // Log detailed error information for developers
  // This includes stack traces and full error details for debugging
  if (logger) {
    logger.error("Global error handler", {
      error: err.message,
      stack: err.stack, // Full stack trace for debugging
      url: req.url, // Request URL where error occurred
      method: req.method, // HTTP method (GET, POST, etc.)
      statusCode, // HTTP status code being returned
      userAgent: req.get("User-Agent"), // Client information
      ip: req.ip, // Client IP address
    });
  }

  // Return sanitized error response to user
  // The sendError function handles environment-aware error details
  return sendError(res, message, statusCode, err);
};

/**
 * Response Time Tracking Middleware
 *
 * Measures and logs the time taken to process each request.
 * Useful for performance monitoring and identifying slow endpoints.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const responseTimeMiddleware = (req, res, next) => {
  const start = Date.now(); // Record request start time

  // Listen for response finish event to calculate total time
  res.on("finish", () => {
    const duration = Date.now() - start; // Calculate response time

    // Log response time for monitoring and performance analysis
    if (logger) {
      logger.info(`Request completed`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`, // Response time in milliseconds
        userAgent: req.get("User-Agent"),
        ip: req.ip,
      });
    }
  });

  next(); // Continue to next middleware/route handler
};
