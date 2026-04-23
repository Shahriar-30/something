/**
 * Hello Routes Module
 *
 * This module defines all routes related to greeting functionality.
 * It follows the Express Router pattern for modular route organization.
 *
 * Route Organization:
 * - Each feature/domain gets its own route file
 * - Routes are mounted with descriptive base paths (e.g., /hello)
 * - Controllers handle the actual business logic
 * - Middleware can be applied at route level
 *
 * Available Endpoints:
 * - GET /hello - Returns a greeting message
 */

import express from "express";
import { helloWorld } from "../controllers/helloController.js";

// Create Express router instance for this module
const router = express.Router();

/**
 * Hello World Route
 *
 * GET /hello
 *
 * Returns a friendly greeting. This is a demonstration endpoint
 * that shows the basic API structure and response format.
 *
 * Example: GET /hello
 * Response: { "success": true, "message": "Hello World!", ... }
 */
router.get("/", helloWorld);

// Export the router for mounting in the main application
export default router;
