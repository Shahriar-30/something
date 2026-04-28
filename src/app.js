/**
 * Express Application Configuration
 *
 * This file configures the main Express application with security middleware,
 * rate limiting, routing, and error handling. It's designed as a SaaS application
 * with production-ready security measures.
 *
 * Security Features:
 * - Helmet for security headers
 * - Rate limiting to prevent abuse
 * - CORS protection (to be added)
 * - Input sanitization
 *
 * Middleware Stack:
 * 1. Security (helmet)
 * 2. Rate limiting
 * 3. Body parsing (JSON/URL-encoded)
 * 4. Response time tracking
 * 5. Routes
 * 6. 404 handler
 * 7. Global error handler
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { sendError } from "./utils/response/index.js";
import {
  responseTimeMiddleware,
  globalErrorHandler,
} from "./middleware/errorHandler.js";

// Create Express application instance
const app = express();

/**
 * Rate Limiting Configuration
 *
 * Protects against brute force attacks and API abuse by limiting
 * the number of requests per IP address within a time window.
 *
 * Current settings: 100 requests per 15 minutes per IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes time window
  max: 100, // Maximum 100 requests per window per IP
  standardHeaders: true, // Include rate limit info in headers
  legacyHeaders: false, // Disable legacy headers
});

/**
 * Security Middleware Stack
 *
 * 1. Helmet - Sets various HTTP security headers
 * 2. Rate Limiter - Prevents abuse and DoS attacks
 * 3. JSON Parser - Parses JSON request bodies
 * 4. URL-encoded Parser - Parses form data
 * 5. Response Time Tracker - Logs request duration
 */
app.use(helmet()); // Security headers
app.use(limiter); // Rate limiting
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(responseTimeMiddleware); // Track response times

/**
 * Route Imports and Mounting
 *
 * Import and mount all application routes.
 * Each route module handles a specific feature area.
 */
import apiV1Routes from "./routes/api/v1/index.js";

// Mount routes with versioned API base path
app.use("/api/v1", apiV1Routes);

// Handle browser favicon requests gracefully
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

/**
 * 404 Not Found Handler
 *
 * Catches all unmatched routes and returns a standardized 404 response.
 * This middleware runs after all route handlers but before error handlers.
 */
app.use((req, res) => {
  return sendError(res, "Route not found", 404);
});

/**
 * Global Error Handler
 *
 * Final safety net for unhandled errors. This middleware catches any
 * errors that occur during request processing and returns appropriate
 * error responses. Must be the last middleware in the stack.
 */
app.use(globalErrorHandler);

// Export the configured Express application
export default app;
