# API Documentation

## Overview

This project exposes a versioned REST API under the base path `/api/v1`.
The frontend developer should use the versioned routes to keep compatibility as the API evolves.

### Base URL

- Development: `http://localhost:8080`
- API base path: `/api/v1`

### API versioning

- All routes are mounted under `/api/v1`
- Example: `/api/v1/auth/login`

### Route files

- `src/routes/api/v1/auth.js` - auth, email verification, refresh, business switching
- `src/routes/api/v1/invitations.js` - member invitation flow
- `src/routes/api/v1/hello.js` - sample health/demo route

---

## Standard response format

All successful responses follow this shape:

```json
{
  "success": true,
  "message": "...",
  "data": { ... },
  "error": null,
  "meta": { "timestamp": "..." }
}
```

All errors follow this shape:

```json
{
  "success": false,
  "message": "...",
  "data": null,
  "error": { "name": "...", "message": "..." },
  "meta": { "timestamp": "..." }
}
```

---

## Authentication

### Register

- `POST /api/v1/auth/register`
- Description: Register a new user and create the first business.
- Body:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `businessName` (string, required)
- Behavior:
  - creates a user and business
  - generates and emails a 6-digit verification code
  - does not issue login tokens until email is verified
- Example response:

```json
{
  "success": true,
  "message": "Registration successful. Verification code sent to your email.",
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "emailVerified": false
    },
    "activeBusiness": {
      "id": "...",
      "name": "...",
      "role": "owner"
    },
    "businesses": [ ... ]
  }
}
```

### Verify email and auto-login

- `POST /api/v1/auth/verify-email`
- Description: Verify the registration code and automatically log the user in.
- Body:
  - `email` (string, required)
  - `code` (string, required, 6 digits)
- Behavior:
  - verifies the code
  - marks `emailVerified` true
  - issues an access token and refresh token
  - sets the refresh token in an `HttpOnly` cookie
- Example response:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "emailVerified": true
    },
    "activeBusiness": {
      "id": "...",
      "name": "...",
      "role": "owner"
    },
    "businesses": [ ... ]
  }
}
```

### Resend verification code

- `POST /api/v1/auth/resend-verification`
- Description: Send a fresh email verification code to an unverified user.
- Body:
  - `email` (string, required)
- Example response:

```json
{
  "success": true,
  "message": "Verification code resent successfully",
  "data": null
}
```

### Password reset request

- `POST /api/v1/auth/password-reset/request`
- Description: Send a password reset code to the user's email.
- Body:
  - `email` (string, required)
- Example response:

```json
{
  "success": true,
  "message": "Password reset code sent successfully",
  "data": null
}
```

### Password reset confirm

- `POST /api/v1/auth/password-reset/confirm`
- Description: Verify the password reset code and set a new password.
- Body:
  - `email` (string, required)
  - `code` (string, required, 6 digits)
  - `password` (string, required)
- Example response:

```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": null
}
```

### Login

- `POST /api/v1/auth/login`
- Description: Authenticate an existing user.
- Body:
  - `email` (string, required)
  - `password` (string, required)
- Notes:
  - login is blocked until the user's `emailVerified` is true
  - refresh token is also set in an `HttpOnly` cookie
- Example response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "..."
    },
    "activeBusiness": {
      "id": "...",
      "name": "...",
      "role": "..."
    },
    "businesses": [ ... ]
  }
}
```

### Create business

- `POST /api/v1/auth/businesses`
- Description: Create an additional business and switch the user's active business to it.
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `name` (string, required)
- Example response:

```json
{
  "success": true,
  "message": "Business created successfully",
  "data": {
    "token": "...",
    "activeBusiness": {
      "id": "...",
      "name": "...",
      "role": "owner"
    },
    "businesses": [ ... ]
  }
}
```

    "refreshToken": "...",
    "activeBusiness": { ... }

}
}

````

### Logout

- `POST /api/v1/auth/logout`
- Description: Invalidate the refresh token on the server.
- Headers:
  - `Authorization: Bearer <token>`
- Example response:

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
````

### Switch business

- `PATCH /api/v1/auth/switch-business/:id`
- Description: Change the active business context for the current user.
- Headers:
  - `Authorization: Bearer <token>`
- Params:
  - `id` = business ID
- Example response:

```json
{
  "success": true,
  "message": "Business switched successfully",
  "data": {
    "token": "...",
    "activeBusiness": {
      "id": "...",
      "name": "...",
      "role": "..."
    },
    "businesses": [ ... ]
  }
}
```

---

## Invitations

### Create invitation

- `POST /api/v1/invitations`
- Description: Invite a new member to the current business.
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `email` (string, required)
  - `role` (string, required)
- Example response:

```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": {
    "invitationId": "...",
    "email": "...",
    "role": "..."
  }
}
```

### List invitations

- `GET /api/v1/invitations`
- Description: Retrieve invitations for the current business.
- Headers:
  - `Authorization: Bearer <token>`
- Example response:

```json
{
  "success": true,
  "message": "Invitations retrieved successfully",
  "data": {
    "invitations": [ ... ]
  }
}
```

### Resend invitation

- `POST /api/v1/invitations/:id/resend`
- Description: Resend a pending invitation email.
- Headers:
  - `Authorization: Bearer <token>`
- Example response:

```json
{
  "success": true,
  "message": "Invitation resent successfully",
  "data": null
}
```

### Expire invitation

- `PATCH /api/v1/invitations/:id/expire`
- Description: Expire a pending invitation.
- Headers:
  - `Authorization: Bearer <token>`
- Example response:

```json
{
  "success": true,
  "message": "Invitation expired successfully",
  "data": null
}
```

### Accept invitation

- `POST /api/v1/invitations/accept/:token`
- Description: Accept an invitation with token and OTP.
- Body:
  - `otp` (string, required)
  - `name` (string, required if user does not exist)
  - `password` (string, required if user does not exist)
- Example response:

```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "data": { ... }
}
```

---

## Hello route

### Get hello world

- `GET /api/v1/hello`
- Description: Simple health/demo endpoint.
- Example response:

```json
{
  "success": true,
  "message": "Hello world!",
  "data": null
}
```

---

## Headers and auth

- `Content-Type: application/json`
- `Authorization: Bearer <token>` for protected routes
- `credentials: 'include'` / same-origin is recommended when using refresh token cookies in browser clients

---

## Frontend notes

- Use `/api/v1` as the API base path.
- Call `register` first, then `verify-email` with the emailed 6-digit code.
- The `verify-email` endpoint auto-logs the user in and returns access/refresh tokens.
- Keep the returned `token` for authenticated requests, and use the refresh cookie for token renewal.
- On `refresh`, update the stored access token with the returned `token`.
- After `switch-business`, update the stored access token with the returned token.
- `businesses` in auth responses can be used to render available business contexts.
- Login is blocked until the email verification step completes.
- Protect routes with `Authorization` on the frontend and include token state in UI access control.

---

## Source reference

- Auth routes: `src/routes/api/v1/auth.js`
- Auth controller: `src/controllers/authController.js`
- Invitation routes: `src/routes/api/v1/invitations.js`
- Invitation controller: `src/controllers/invitationController.js`
- Validation middleware: `src/middleware/validateRequest.js`
