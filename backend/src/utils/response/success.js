import { logger } from "../../config/logger.js";

/**
 * Standard response format
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether the request was successful
 * @property {string} message - Response message
 * @property {Object|null} data - Response data (null for errors)
 * @property {Object|null} error - Error details (null for success)
 * @property {Object} meta - Additional metadata
 */

/**
 * Creates a standardized success response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object|null} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata
 * @returns {Object} Standardized response object
 */
export const sendSuccess = (
  res,
  message = "Success",
  data = null,
  statusCode = 200,
  meta = {}
) => {
  const response = {
    success: true,
    message,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  // Log successful responses (optional, based on your logging setup)
  if (logger) {
    logger.info(`Success response: ${message}`, {
      statusCode,
      data: data ? "present" : "null",
    });
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper for list responses
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 * @returns {Object} Paginated response
 */
export const sendPaginatedSuccess = (
  res,
  data,
  page,
  limit,
  total,
  message = "Data retrieved successfully"
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return sendSuccess(res, message, data, 200, {
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNext,
      hasPrev,
    },
  });
};
