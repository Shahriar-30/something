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

- `src/routes/api/v1/auth.js` - auth and business switching
- `src/routes/api/v1/invitations.js` - member invitation flow
- `src/routes/api/v1/hello.js` - sample health/demo route

---

## Authentication

### Register

- `POST /api/v1/auth/register`
- Description: Register a new user and create the first business
- Body:
  - `name` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `businessName` (string, required)
- Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "...",
    "refreshToken": "...",
    "user": { "id": "...", "name": "...", "email": "..." },
    "activeBusiness": { "id": "...", "name": "...", "role": "owner" },
    "businesses": [ ... ]
  }
}
```

### Login

- `POST /api/v1/auth/login`
- Description: Login with email/password
- Body:
  - `email` (string, required)
  - `password` (string, required)
- Response: same structure as register

### Refresh token

- `POST /api/v1/auth/refresh`
- Description: Exchange refresh token for a new access token
- Body:
  - `refreshToken` (string, required)
- Response:

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": { "token": "...", "activeBusiness": { ... } }
}
```

### Logout

- `POST /api/v1/auth/logout`
- Description: Invalidate the stored refresh token
- Headers:
  - `Authorization: Bearer <token>`
- Response:

```json
{ "success": true, "message": "Logged out successfully" }
```

### Switch business

- `PATCH /api/v1/auth/switch-business/:id`
- Description: Switch the active business context for the signed-in user
- Headers:
  - `Authorization: Bearer <token>`
- Response:

```json
{
  "success": true,
  "message": "Business switched successfully",
  "data": {
    "token": "...",
    "activeBusiness": { "id": "...", "name": "...", "role": "..." },
    "businesses": [ ... ]
  }
}
```

---

## Invitations

### Send invitation

- `POST /api/v1/invitations`
- Description: Owner/Admin invite a user to join the current business
- Headers:
  - `Authorization: Bearer <token>`
- Body:
  - `email` (string, required)
  - `role` (one of `owner`, `admin`, `staff`, `viewer`)
- Response:

```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "data": { "invitationId": "...", "email": "...", "role": "..." }
}
```

### List invitations

- `GET /api/v1/invitations`
- Description: Get all invitations for the current business
- Headers:
  - `Authorization: Bearer <token>`
- Response:

```json
{ "success": true, "data": { "invitations": [ ... ] } }
```

### Resend invitation

- `POST /api/v1/invitations/:id/resend`
- Description: Resend an existing pending invitation
- Headers:
  - `Authorization: Bearer <token>`
- Response:

```json
{ "success": true, "message": "Invitation resent successfully" }
```

### Expire invitation

- `PATCH /api/v1/invitations/:id/expire`
- Description: Manually expire a pending invitation
- Headers:
  - `Authorization: Bearer <token>`
- Response:

```json
{ "success": true, "message": "Invitation expired successfully" }
```

### Accept invitation

- `POST /api/v1/invitations/accept/:token`
- Description: Accept an invitation using the invite token and OTP
- Body:
  - `otp` (string, required)
  - `name` (string, required if user does not exist)
  - `password` (string, required if user does not exist)
- Response:

```json
{ "success": true, "message": "Invitation accepted successfully", "data": { "business": { ... }, "role": "...", "user": { ... } } }
```

---

## Sample Hello route

### Get hello world

- `GET /api/v1/hello`
- Description: Simple health/demo endpoint
- Response:

```json
{ "success": true, "message": "Hello world!" }
```

---

## Headers

- `Content-Type: application/json`
- `Authorization: Bearer <token>` for protected routes

---

## Notes for frontend developers

- Use `/api/v1` as the base route for all endpoints.
- The access token contains `userId`, `activeBusinessId`, and `activeRole`.
- After switching business, always replace the current access token with the returned token.
- Invitations are scoped to the active business.
- Roles are enforced on the server and the frontend should respect them:
  - `owner` can manage invitations and business membership
  - `admin` can manage invitations and business membership
  - `staff` can only access assigned business data
  - `viewer` is read-only

---

## Performance and database design

- The `users` collection is indexed by `email`.
- `business_members` has a unique compound index on `{ businessId, userId }`.
- `invitations` is indexed by `{ businessId, email, status }`.
- `businesses` is indexed by `{ createdBy }` and `{ name }`.
- The backend uses aggregation pipelines for business membership lookup to reduce joins and improve response speed.

---

## Where to find files

- Route definitions: `src/routes/api/v1`
- Authentication controllers: `src/controllers/authController.js`
- Invitation controllers: `src/controllers/invitationController.js`
- Authentication middleware: `src/middleware/authMiddleware.js`
- Models: `src/models`
