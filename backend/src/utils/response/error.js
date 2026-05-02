import { logger } from "../../config/logger.js";

/**
 * Creates a standardized error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Error|null} error - Error object for logging
 * @param {Object} meta - Additional metadata
 * @returns {Object} Standardized response object
 */
export const sendError = (
  res,
  message = "Internal Server Error",
  statusCode = 500,
  error = null,
  meta = {}
) => {
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    success: false,
    message,
    data: null,
    error: isProduction
      ? null
      : {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
        },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  // Log errors with full details
  if (logger) {
    logger.error(`Error response: ${message}`, {
      statusCode,
      error: error?.message,
      stack: isProduction ? undefined : error?.stack,
    });
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation error handler
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors array
 * @returns {Object} Standardized validation error response
 */
export const sendValidationError = (res, errors) => {
  const formattedErrors = errors.map((err) => ({
    field: err.field || err.path,
    message: err.message,
    value: err.value,
  }));

  return sendError(res, "Validation failed", 400, null, {
    validationErrors: formattedErrors,
  });
};

/**
 * Not found error handler
 * @param {Object} res - Express response object
 * @param {string} resource - Resource type that was not found
 * @returns {Object} Standardized not found response
 */
export const sendNotFound = (res, resource = "Resource") => {
  return sendError(res, `${resource} not found`, 404);
};

/**
 * Unauthorized error handler
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} Standardized unauthorized response
 */
export const sendUnauthorized = (res, message = "Unauthorized access") => {
  return sendError(res, message, 401);
};

/**
 * Forbidden error handler
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} Standardized forbidden response
 */
export const sendForbidden = (res, message = "Access forbidden") => {
  return sendError(res, message, 403);
};

/**
 * Conflict error handler (for duplicate resources, etc.)
 * @param {Object} res - Express response object
 * @param {string} message - Custom message
 * @returns {Object} Standardized conflict response
 */
export const sendConflict = (res, message = "Resource conflict") => {
  return sendError(res, message, 409);
};

/**
 * Rate limit exceeded handler
 * @param {Object} res - Express response object
 * @param {string} message - Custom message (optional)
 * @returns {Object} Standardized rate limit response
 */
export const sendRateLimitExceeded = (res, message = "Too many requests") => {
  return sendError(res, message, 429);
};
