/**
 * Application Logger Configuration
 *
 * This module provides structured logging for the SaaS application.
 * It supports different log levels and formats output based on environment.
 *
 * Features:
 * - Environment-aware formatting (development vs production)
 * - Structured logging with metadata
 * - Color-coded console output in development
 * - JSON formatting for production log aggregation
 * - Configurable log levels
 *
 * Log Levels (in order of severity):
 * - error: Critical errors requiring immediate attention
 * - warn: Warnings about potential issues
 * - info: General information about application flow
 * - debug: Detailed debugging information (development only)
 *
 * Production Upgrade Path:
 * Consider using winston, pino, or similar enterprise logging libraries
 * for advanced features like log rotation, multiple transports, and cloud integration.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Logger Class
 *
 * Provides structured logging with environment-specific formatting.
 * Automatically adjusts verbosity based on NODE_ENV.
 */
class Logger {
  constructor() {
    // Define log levels with numeric priorities (higher number = more verbose)
    this.levels = {
      error: 0, // Most critical - always log
      warn: 1, // Important warnings
      info: 2, // General information
      debug: 3, // Detailed debugging (development only)
    };

    // Set current log level based on environment
    // Production: info and above (error, warn, info)
    // Development: debug and above (all levels)
    this.currentLevel = isProduction ? this.levels.info : this.levels.debug;
  }

  _log(level, message, meta = {}) {
    if (this.levels[level] > this.currentLevel) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (isProduction) {
      // In production, you might want to use a proper logging service
      console.log(JSON.stringify(logEntry));
    } else {
      // In development, use colored console output
      const colors = {
        error: "\x1b[31m", // Red
        warn: "\x1b[33m", // Yellow
        info: "\x1b[36m", // Cyan
        debug: "\x1b[35m", // Magenta
      };
      const reset = "\x1b[0m";

      console.log(
        `${colors[level]}[${level.toUpperCase()}]${reset} ${timestamp}: ${message}`
      );
      if (Object.keys(meta).length > 0) {
        console.log(`${colors[level]}${JSON.stringify(meta, null, 2)}${reset}`);
      }
    }
  }

  /**
   * Log error messages
   *
   * Used for critical errors that require immediate attention.
   * Always logged regardless of log level setting.
   *
   * @param {string} message - Error message
   * @param {Object} meta - Additional error context
   */
  error(message, meta = {}) {
    this._log("error", message, meta);
  }

  /**
   * Log warning messages
   *
   * Used for potential issues that should be monitored.
   *
   * @param {string} message - Warning message
   * @param {Object} meta - Additional warning context
   */
  warn(message, meta = {}) {
    this._log("warn", message, meta);
  }

  /**
   * Log informational messages
   *
   * Used for general application flow information.
   *
   * @param {string} message - Info message
   * @param {Object} meta - Additional context
   */
  info(message, meta = {}) {
    this._log("info", message, meta);
  }

  /**
   * Log debug messages
   *
   * Used for detailed debugging information.
   * Only shown in development environment.
   *
   * @param {string} message - Debug message
   * @param {Object} meta - Additional debug context
   */
  debug(message, meta = {}) {
    this._log("debug", message, meta);
  }
}

// Export singleton logger instance
export const logger = new Logger();
