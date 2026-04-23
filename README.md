# Production-Ready Response Handler

A comprehensive, production-ready response handler utility for Express.js applications with standardized error handling, logging, and response formatting.

## File Structure

```
src/
├── middleware/
│   └── errorHandler.js          # Global error handler & response time middleware
├── utils/
│   └── response/
│       ├── index.js             # Main export file
│       ├── success.js           # Success response utilities
│       ├── error.js             # Error response utilities
│       └── helpers.js           # Helper utilities (asyncHandler, sanitizeInput)
└── config/
    └── logger.js                # Logger configuration
```

## Features

- ✅ Standardized response format for all API responses
- ✅ Comprehensive error handling with proper HTTP status codes
- ✅ Environment-aware error details (no stack traces in production)
- ✅ Built-in logging integration
- ✅ Async route wrapper for automatic error catching
- ✅ Input validation and sanitization helpers
- ✅ Pagination support for list endpoints
- ✅ Response time tracking middleware
- ✅ Global error handler middleware

## Response Format

All responses follow a consistent JSON structure:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": { ... } | null,
  "error": { ... } | null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    ...
  }
}
```

## Usage

### Basic Success Response

```javascript
import { sendSuccess } from "./utils/response/index.js";

app.get("/api/users", (req, res) => {
  const users = [{ id: 1, name: "John" }];
  return sendSuccess(res, "Users retrieved successfully", users);
});
```

### Error Response

```javascript
import { sendError } from "./utils/response/index.js";

app.post("/api/users", (req, res) => {
  if (!req.body.name) {
    return sendError(res, "Name is required", 400);
  }
  // ... create user
});
```

### Async Route Handler

```javascript
import { asyncHandler, sendSuccess } from "./utils/response/index.js";

app.get(
  "/api/users/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new Error("User not found");
    }
    return sendSuccess(res, "User found", user);
  })
);
```

### Validation Errors

```javascript
import { sendValidationError } from "./utils/response/index.js";

app.post("/api/users", (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return sendValidationError(res, errors);
  }
  // ... create user
});
```

### Paginated Response

```javascript
import { sendPaginatedSuccess } from "./utils/response/index.js";

app.get("/api/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const users = await User.find()
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await User.countDocuments();

  return sendPaginatedSuccess(
    res,
    users,
    page,
    limit,
    total,
    "Users retrieved"
  );
});
```

### Specialized Error Responses

```javascript
import {
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendRateLimitExceeded,
} from "./utils/response/index.js";

// 404 Not Found
return sendNotFound(res, "User");

// 401 Unauthorized
return sendUnauthorized(res, "Invalid credentials");

// 403 Forbidden
return sendForbidden(res, "Insufficient permissions");

// 409 Conflict
return sendConflict(res, "User already exists");

// 429 Too Many Requests
return sendRateLimitExceeded(res);
```

## Setup

### 1. Import the utilities

```javascript
import {
  sendSuccess,
  sendError,
  asyncHandler,
  // ... other utilities
} from "./utils/response/index.js";
```

### 2. Add middleware to your Express app

```javascript
import {
  globalErrorHandler,
  responseTimeMiddleware,
} from "./middleware/errorHandler.js";

// Response time tracking (optional)
app.use(responseTimeMiddleware);

// Your routes here...

// Global error handler (must be last)
app.use(globalErrorHandler);
```

### 3. Environment Variables

Set `NODE_ENV=production` in production to hide error details from responses.

## Available Functions

### Response Functions

- `sendSuccess(res, message, data, statusCode, meta)` - Send success response
- `sendError(res, message, statusCode, error, meta)` - Send error response

### Specialized Error Functions

- `sendValidationError(res, errors)` - Send validation errors (400)
- `sendNotFound(res, resource)` - Send not found error (404)
- `sendUnauthorized(res, message)` - Send unauthorized error (401)
- `sendForbidden(res, message)` - Send forbidden error (403)
- `sendConflict(res, message)` - Send conflict error (409)
- `sendRateLimitExceeded(res, message)` - Send rate limit error (429)

### Utility Functions

- `asyncHandler(fn)` - Wrap async route handlers
- `sendPaginatedSuccess(res, data, page, limit, total, message)` - Send paginated response
- `sanitizeInput(obj)` - Basic input sanitization

### Middleware

- `globalErrorHandler(err, req, res, next)` - Global error handler
- `responseTimeMiddleware(req, res, next)` - Response time tracking

## Error Handling

The response handler automatically handles common error types:

- **ValidationError**: 400 Bad Request
- **CastError**: 400 Bad Request (invalid data format)
- **11000**: 409 Conflict (duplicate key)
- **JsonWebTokenError**: 401 Unauthorized
- **TokenExpiredError**: 401 Unauthorized

## Logging

The response handler integrates with a logger. Make sure to configure logging in your application:

```javascript
// In production, consider using winston, pino, or similar
import { logger } from "./config/logger.js";
```

## Security Features

- Error details are hidden in production (no stack traces)
- Basic input sanitization to prevent XSS
- Consistent response format prevents information leakage
- Proper HTTP status codes

## Examples

See `src/index.js` for complete examples of how to use the response handler in a real Express application.

## Testing

Test your endpoints to ensure proper response formatting:

```bash
# Success response
curl http://localhost:3000/

# Error response
curl http://localhost:3000/test-async?error=true

# 404 response
curl http://localhost:3000/nonexistent
```
