/**
 * Simple logger configuration
 * In production, consider using winston, pino, or similar logging library
 */

const isProduction = process.env.NODE_ENV === "production";

class Logger {
  constructor() {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
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

  error(message, meta = {}) {
    this._log("error", message, meta);
  }

  warn(message, meta = {}) {
    this._log("warn", message, meta);
  }

  info(message, meta = {}) {
    this._log("info", message, meta);
  }

  debug(message, meta = {}) {
    this._log("debug", message, meta);
  }
}

export const logger = new Logger();
