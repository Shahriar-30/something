# API Documentation (Frontend Guide)

## 1) Base Info

- Base URL (dev): `http://localhost:8080`
- API prefix: `/api/v1`
- Content type: `application/json`
- Protected routes require: `Authorization: Bearer <access_token>`

Example full URL:

`http://localhost:8080/api/v1/auth/login`

---

## 2) Standard Response Shape

Successful response:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-04-29T05:00:00.000Z"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Human readable error message",
  "data": null,
  "error": {
    "name": "ValidationError",
    "message": "Details here"
  },
  "meta": {
    "timestamp": "2026-04-29T05:00:00.000Z"
  }
}
```

---

## 3) Auth + Session Model

This backend uses:

- **Access token (JWT)** for protected API calls
- **Refresh token** returned in response and also set as an **HttpOnly cookie**

When calling refresh in browser clients, use credentials:

- `fetch`: `credentials: "include"`
- axios: `withCredentials: true`

---

## 4) Multi-Business Context

The API is business-aware.

- Access token carries:
  - `userId`
  - `activeBusinessId`
  - `activeRole`
- Invitation and business-member routes use this active business context.
- Frontend does **not** send business ID for:
  - invitation list/create/resend/expire
  - member list/remove
- To change business context, call `POST /api/v1/auth/switch-business/:id`, then store the new returned access token.

---

## 5) Authentication Endpoints

### POST `/api/v1/auth/register`

Create user + first business, and send email verification code.

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "Acme LLC"
}
```

Notes:

- `password` min length is 8.
- User is created with `emailVerified: false`.

---

### POST `/api/v1/auth/verify-email`

Verify code and auto-login.

Body:

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

Returns:

- `token` (access token)
- `refreshToken`
- `user`
- `activeBusiness`
- `businesses`

---

### POST `/api/v1/auth/resend-verification`

Resend verification code.

Body:

```json
{
  "email": "john@example.com"
}
```

---

### POST `/api/v1/auth/login`

Login existing user.

Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Notes:

- Login is blocked if email is not verified.

---

### POST `/api/v1/auth/refresh`

Get new access token.

Body (optional):

```json
{
  "refreshToken": "optional-if-cookie-is-used"
}
```

Notes:

- Works with body token and/or HttpOnly cookie.
- Save returned `token` on frontend.

---

### POST `/api/v1/auth/password-reset/request`

Send password reset OTP code.

Body:

```json
{
  "email": "john@example.com"
}
```

---

### POST `/api/v1/auth/password-reset/confirm`

Verify reset code and set new password.

Body:

```json
{
  "email": "john@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

---

### POST `/api/v1/auth/switch-business/:id` (Protected)

Switch active business context.

Params:

- `id` = business ID

Notes:

- Returns a **new token** with updated `activeBusinessId` and role.
- Frontend must replace old token immediately.

---

### POST `/api/v1/auth/logout` (Protected)

Invalidate refresh token on server.

---

## 6) Business Endpoints

### POST `/api/v1/businesses` (Protected)

Create additional business and set it as active.

Body:

```json
{
  "name": "Second Business",
  "logoUrl": null,
  "currency": "USD",
  "location": {
    "street": null,
    "city": null,
    "state": null,
    "zip": null,
    "country": null
  },
  "phoneNumber": null,
  "phoneCountry": null
}
```

Notes:

- Only `name` is required.
- `currency` must be 3 chars if provided.
- Returns updated `token`, `activeBusiness`, and `businesses`.

---

### GET `/api/v1/businesses` (Protected)

Get all active businesses for current user.

---

### GET `/api/v1/businesses/:id` (Protected)

Get business details if user is an active member.

Params:

- `id` = business ID (ObjectId format)

---

### PATCH `/api/v1/businesses/:id` (Protected)

Update business fields.

Params:

- `id` = business ID (ObjectId format)

Body:

- Any subset of:
  - `name`
  - `logoUrl`
  - `currency`
  - `location.street`
  - `location.city`
  - `location.state`
  - `location.zip`
  - `location.country`
  - `phoneNumber`
  - `phoneCountry`

Rules:

- At least one field is required.
- Allowed roles: `owner`, `admin`.

---

### DELETE `/api/v1/businesses/:id` (Protected)

Soft delete business.

Rules:

- Only `owner`.

Side effects:

- Marks business deleted.
- Removes active memberships in that business.
- Reassigns users' `activeBusiness` to another active business if available.

---

## 7) Business Member Endpoints

All endpoints below are business-scoped using token active business.

Allowed roles:

- `owner`, `admin`

### GET `/api/v1/business-members` (Protected + business scope)

List active members in current business.

Response data includes:

- membership id
- role
- status
- joinedAt
- user info (`id`, `name`, `email`, `activeBusiness`)

---

### PATCH `/api/v1/business-members/:userId/remove` (Protected + business scope)

Remove a member from current business by setting membership status to `removed`.

Params:

- `userId` = target user ID (ObjectId format)

Safety rules:

- cannot remove yourself
- admin cannot remove owner
- cannot remove the last owner
- user record remains (not deleted)
- if removed user had this business as `activeBusiness`, fallback active business is assigned if available, else `null`

---

## 8) Invitation Endpoints

All business-scoped invitation operations use the active business from token.

Roles allowed for management endpoints:

- `owner`, `admin`

### POST `/api/v1/invitations` (Protected + business scope)

Create invitation for active business.

Body:

```json
{
  "email": "member@example.com",
  "role": "staff"
}
```

Role enum:

- `owner`, `admin`, `staff`, `viewer`

Behavior:

- Rejects if user is already active member in that business.
- Rejects if pending invite already exists for same email in that business.

---

### GET `/api/v1/invitations` (Protected + business scope)

List invitations for current active business.

No `businessId` is passed by frontend.

Business is inferred from token context.

---

### POST `/api/v1/invitations/:id/resend` (Protected + business scope)

Resend pending invitation email.

Params:

- `id` = invitation ID (ObjectId format)

---

### PATCH `/api/v1/invitations/:id/expire` (Protected + business scope)

Expire pending invitation.

Params:

- `id` = invitation ID (ObjectId format)

---

### GET `/api/v1/invitations/accept/:token` (Public)

Get invitation details for invite-accept page.

Params:

- `token` = invitation token

Returns:

- invited `email`
- invited `role`
- business name/id
- inviter name

---

### POST `/api/v1/invitations/accept/:token` (Public)

Accept invitation using OTP and registration fields.

Params:

- `token` = invitation token

Body:

```json
{
  "email": "member@example.com",
  "role": "staff",
  "otp": "123456",
  "name": "New Member",
  "password": "password123"
}
```

Rules:

- `email` must match invited email.
- `role` must match invited role.
- `otp` must be 6 chars.
- If user already exists, membership is added to business.
- If user does not exist, user is created then membership is added.

---

## 9) Health/Demo Endpoint

### GET `/api/v1/hello`

Simple hello response.

---

## 10) Common Frontend Flow

1. Register user (`/auth/register`)
2. Verify email (`/auth/verify-email`) and store returned access token
3. Call protected APIs with `Authorization: Bearer <token>`
4. On 401/expired token, call `/auth/refresh`, replace token, retry
5. If user changes business, call `/auth/switch-business/:id`, replace token
6. Use invitation/member endpoints without passing business ID (business comes from token context)

---

## 11) Route Source of Truth

- Auth routes: `src/routes/api/v1/auth.js`
- Business routes: `src/routes/api/v1/businesses.js`
- Business member routes: `src/routes/api/v1/businessMembers.js`
- Invitation routes: `src/routes/api/v1/invitations.js`
- Hello route: `src/routes/api/v1/hello.js`
- Auth validation: `src/validators/authValidator.js`
- Business validation: `src/validators/businessValidator.js`
- Business member validation: `src/validators/businessMemberValidator.js`
- Invitation validation: `src/validators/invitationValidator.js`
# API Documentation (Frontend Guide)

## 1) Base Info

- Base URL (dev): `http://localhost:8080`
- API prefix: `/api/v1`
- Content type: `application/json`
- Protected routes require: `Authorization: Bearer <access_token>`

Example full URL:

`http://localhost:8080/api/v1/auth/login`

---

## 2) Standard Response Shape

Successful response:

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-04-29T05:00:00.000Z"
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Human readable error message",
  "data": null,
  "error": {
    "name": "ValidationError",
    "message": "Details here"
  },
  "meta": {
    "timestamp": "2026-04-29T05:00:00.000Z"
  }
}
```

---

## 3) Auth + Session Model (Important)

This backend uses:

- **Access token (JWT)** for protected API calls.
- **Refresh token** returned in response and also set as an **HttpOnly cookie**.

When calling refresh in browser clients, use credentials:

- `fetch`: `credentials: "include"`
- axios: `withCredentials: true`

---

## 4) Multi-Business Context (Important)

The API is business-aware.

- Access token carries:
  - `userId`
  - `activeBusinessId`
  - `activeRole`
- Invitation routes (`/invitations`) use this active business context.
- Frontend does **not** send business ID for invitation list/create/resend/expire.
- To change business context, call `POST /api/v1/auth/switch-business/:id`, then store the **new returned access token**.

---

## 5) Authentication Endpoints

### POST `/api/v1/auth/register`

Create user + first business, and send email verification code.

Body:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "Acme LLC"
}
```

Notes:

- `password` min length is 8.
- User is created with `emailVerified: false`.

---

### POST `/api/v1/auth/verify-email`

Verify code and auto-login.

Body:

```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

Returns:

- `token` (access token)
- `refreshToken`
- `user`
- `activeBusiness`
- `businesses`

---

### POST `/api/v1/auth/resend-verification`

Resend verification code.

Body:

```json
{
  "email": "john@example.com"
}
```

---

### POST `/api/v1/auth/login`

Login existing user.

Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Notes:

- Login is blocked if email is not verified.

---

### POST `/api/v1/auth/refresh`

Get new access token.

Body (optional):

```json
{
  "refreshToken": "optional-if-cookie-is-used"
}
```

Notes:

- Works with body token and/or HttpOnly cookie.
- Save returned `token` on frontend.

---

### POST `/api/v1/auth/password-reset/request`

Send password reset OTP code.

Body:

```json
{
  "email": "john@example.com"
}
```

---

### POST `/api/v1/auth/password-reset/confirm`

Verify reset code and set new password.

Body:

```json
{
  "email": "john@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

---

### POST `/api/v1/auth/switch-business/:id` (Protected)

Switch active business context.

Params:

- `id` = business ID

Notes:

- Returns a **new token** with updated `activeBusinessId` and role.
- Frontend must replace old token immediately.

---

### POST `/api/v1/auth/logout` (Protected)

Invalidate refresh token on server.

---

## 6) Business Endpoints

### POST `/api/v1/businesses` (Protected)

Create additional business and set it as active.

Body:

```json
{
  "name": "Second Business",
  "logoUrl": null,
  "currency": "USD",
  "location": {
    "street": null,
    "city": null,
    "state": null,
    "zip": null,
    "country": null
  },
  "phoneNumber": null,
  "phoneCountry": null
}
```

Notes:

- Only `name` is required.
- `currency` must be 3 chars if provided.
- Returns updated `token`, `activeBusiness`, and `businesses`.

---

### GET `/api/v1/businesses` (Protected)

Get all active businesses for current user.

---

### GET `/api/v1/businesses/:id` (Protected)

Get business details if user is an active member.

Params:

- `id` = business ID (ObjectId format)

---

### PATCH `/api/v1/businesses/:id` (Protected)

Update business fields.

Params:

- `id` = business ID (ObjectId format)

Body:

- Any subset of:
  - `name`
  - `logoUrl`
  - `currency`
  - `location.street`
  - `location.city`
  - `location.state`
  - `location.zip`
  - `location.country`
  - `phoneNumber`
  - `phoneCountry`

Rules:

- At least one field is required.
- Allowed roles: `owner`, `admin`.

---

### DELETE `/api/v1/businesses/:id` (Protected)

Soft delete business.

Rules:

- Only `owner`.

Side effects:

- Marks business deleted.
- Removes active memberships in that business.
- Reassigns users' `activeBusiness` to another active business if available.

---

## 7) Invitation Endpoints

All business-scoped invitation operations use the active business from token.

Roles allowed for management endpoints:

- `owner`, `admin`

### POST `/api/v1/invitations` (Protected + business scope)

Create invitation for active business.

Body:

```json
{
  "email": "member@example.com",
  "role": "staff"
}
```

Role enum:

- `owner`, `admin`, `staff`, `viewer`

Behavior:

- Rejects if user is already active member in that business.
- Rejects if pending invite already exists for same email in that business.

---

### GET `/api/v1/invitations` (Protected + business scope)

List invitations for current active business.

No `businessId` is passed by frontend.

Business is inferred from token context.

---

### POST `/api/v1/invitations/:id/resend` (Protected + business scope)

Resend pending invitation email.

Params:

- `id` = invitation ID (ObjectId format)

---

### PATCH `/api/v1/invitations/:id/expire` (Protected + business scope)

Expire pending invitation.

Params:

- `id` = invitation ID (ObjectId format)

---

### GET `/api/v1/invitations/accept/:token` (Public)

Get invitation details for invite-accept page.

Params:

- `token` = invitation token

Returns:

- invited `email`
- invited `role`
- business name/id
- inviter name

---

### POST `/api/v1/invitations/accept/:token` (Public)

Accept invitation using OTP and registration fields.

Params:

- `token` = invitation token

Body:

```json
{
  "email": "member@example.com",
  "role": "staff",
  "otp": "123456",
  "name": "New Member",
  "password": "password123"
}
```

Rules:

- `email` must match invited email.
- `role` must match invited role.
- `otp` must be 6 chars.
- If user already exists, membership is added to business.
- If user does not exist, user is created then membership is added.

---

## 8) Health/Demo Endpoint

### GET `/api/v1/hello`

Simple hello response.

---

## 9) Common Frontend Flow

1. Register user (`/auth/register`)
2. Verify email (`/auth/verify-email`) and store returned access token
3. Call protected APIs with `Authorization: Bearer <token>`
4. On 401/expired token, call `/auth/refresh`, replace token, retry
5. If user changes business, call `/auth/switch-business/:id`, replace token
6. Use invitation endpoints without passing business ID (business comes from token context)

---

## 10) Route Source of Truth

- Auth routes: `src/routes/api/v1/auth.js`
- Business routes: `src/routes/api/v1/businesses.js`
- Invitation routes: `src/routes/api/v1/invitations.js`
- Hello route: `src/routes/api/v1/hello.js`
- Auth validation: `src/validators/authValidator.js`
- Business validation: `src/validators/businessValidator.js`
- Invitation validation: `src/validators/invitationValidator.js`
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
- `src/routes/api/v1/businesses.js` - business management (update, soft delete)
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

- `POST /api/v1/businesses`
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

## Businesses

### List my businesses

- `GET /api/v1/businesses`
- Description: Get all active businesses where the current user is an active member.
- Headers:
  - `Authorization: Bearer <token>`
- Example response:

```json
{
  "success": true,
  "message": "Businesses retrieved successfully",
  "data": {
    "businesses": [
      {
        "id": "...",
        "name": "...",
        "role": "owner"
      }
    ]
  }
}
```

### Get business by ID

- `GET /api/v1/businesses/:id`
- Description: Get details of a single business the current user belongs to.
- Headers:
  - `Authorization: Bearer <token>`
- Params:
  - `id` = business ID
- Example response:

```json
{
  "success": true,
  "message": "Business retrieved successfully",
  "data": {
    "business": {
      "id": "...",
      "name": "...",
      "role": "admin"
    }
  }
}
```

### Update business

- `PATCH /api/v1/businesses/:id`
- Description: Update business profile fields.
- Authorization:
  - `owner` and `admin` can update
- Headers:
  - `Authorization: Bearer <token>`
- Params:
  - `id` = business ID
- Body (all optional, at least one required):
  - `name` (string)
  - `logoUrl` (string or null)
  - `currency` (3-letter string, uppercase)
  - `location` (object with optional `street`, `city`, `state`, `zip`, `country`)
  - `phoneNumber` (string or null)
  - `phoneCountry` (string or null)
- Example response:

```json
{
  "success": true,
  "message": "Business updated successfully",
  "data": {
    "business": {
      "id": "...",
      "name": "...",
      "logoUrl": null,
      "currency": "BDT",
      "location": {
        "street": null,
        "city": null,
        "state": null,
        "zip": null,
        "country": null
      },
      "phoneNumber": null,
      "phoneCountry": null,
      "updatedAt": "..."
    }
  }
}
```

### Soft delete business

- `DELETE /api/v1/businesses/:id`
- Description: Soft delete a business.
- Authorization:
  - only `owner` can soft delete
- Headers:
  - `Authorization: Bearer <token>`
- Params:
  - `id` = business ID
- Behavior:
  - marks business as deleted (`isDeleted: true`)
  - deactivates active business memberships
  - updates affected users' `activeBusiness` to another active business when available, otherwise clears it
- Example response:

```json
{
  "success": true,
  "message": "Business deleted successfully",
  "data": null
}
```

---

## Invitations

### Create invitation

- `POST /api/v1/invitations`
- Description: Invite a new member to the current business.
- Authorization:
  - only `owner` and `admin` can create invitations
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
- Authorization:
  - only `owner` and `admin` can resend invitations
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
- Authorization:
  - only `owner` and `admin` can manually expire invitations
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

### Get invitation details by token

- `GET /api/v1/invitations/accept/:token`
- Description: Get prefilled invitation details for the accept-registration screen.
- Returns:
  - invited `email`
  - invited `role`
  - business details

### Accept invitation

- `POST /api/v1/invitations/accept/:token`
- Description: Accept invitation and create member account from registration form.
- Body:
  - `email` (string, required, must match invited email)
  - `role` (string, required, must match invited role)
  - `otp` (string, required)
  - `name` (string, required)
  - `password` (string, required)
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
- Business routes: `src/routes/api/v1/businesses.js`
- Business controller: `src/controllers/businessController.js`
- Invitation routes: `src/routes/api/v1/invitations.js`
- Invitation controller: `src/controllers/invitationController.js`
- Validation middleware: `src/middleware/validateRequest.js`
