/**
 * Hello World Controller
 *
 * This controller handles greeting-related endpoints for the SaaS application.
 * It demonstrates the basic structure and response format used throughout the app.
 *
 * Controller Pattern:
 * - Each controller handles a specific domain/feature
 * - Uses standardized response utilities for consistency
 * - Includes proper error handling and logging
 * - Follows RESTful conventions
 */

import { sendSuccess } from "../utils/response/index.js";

/**
 * Hello World Handler
 *
 * Returns a friendly greeting response. This is a demonstration endpoint
 * that shows the standard response format and controller structure.
 *
 * Example Response:
 * {
 *   "success": true,
 *   "message": "Hello World!",
 *   "data": { "greeting": "Hello World!" },
 *   "error": null,
 *   "meta": { "timestamp": "2024-01-01T00:00:00.000Z" }
 * }
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Standardized success response
 */
export const helloWorld = (req, res) => {
  return sendSuccess(res, "Hello World!", {
    greeting: "Hello World!",
  });
};
