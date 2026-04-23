import { logger } from "../../config/logger.js";
import { sendError } from "./error.js";

/**
 * Async route wrapper to handle errors automatically
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error
      if (logger) {
        logger.error("Unhandled async error", {
          error: error.message,
          stack: error.stack,
          url: req.url,
          method: req.method,
        });
      }

      // Send generic error response
      return sendError(res, "Something went wrong", 500, error);
    });
  };
};

/**
 * Input sanitization helper
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export const sanitizeInput = (obj) => {
  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // Basic XSS prevention - remove script tags and HTML
      sanitized[key] = value.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ""
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
