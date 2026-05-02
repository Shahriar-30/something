/**
 * Express Application Configuration
 *
 * This file configures the main Express application with security middleware,
 * routing, and error handling. It's designed as a SaaS application
 * with production-ready security measures.
 *
 * Security Features:
 * - Helmet for security headers
 * - CORS protection
 * - Input sanitization
 *
 * Middleware Stack:
 * 1. Security (helmet)
 * 2. Body parsing (JSON/URL-encoded)
 * 3. Response time tracking
 * 4. Routes
 * 5. 404 handler
 * 6. Global error handler
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import { sendError } from "./utils/response/index.js";
import {
  responseTimeMiddleware,
  globalErrorHandler,
} from "./middleware/errorHandler.js";

// Create Express application instance
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Security Middleware Stack
 *
 * 1. CORS - Cross-Origin Resource Sharing (Must be first to handle preflight)
 * 2. Helmet - Sets various HTTP security headers
 * 3. JSON Parser - Parses JSON request bodies
 */

// Enable CORS with specific options for preflight and credentials
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow localhost. In production, you would add your domain.
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
      ];

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

app.use(helmet()); // Security headers

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies
app.use(responseTimeMiddleware); // Track response times
app.use("/crm", express.static(path.join(__dirname, "public")));

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
