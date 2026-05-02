# API Documentation (Frontend-Friendly)

This document is the single source of truth for frontend integration.

It focuses on:
- what to send,
- which role can call each API,
- what comes back,
- and common implementation mistakes.

---

## 1) Quick Start

- Base URL (dev): `http://localhost:8080`
- API prefix: `/api/v1`
- Full example URL: `http://localhost:8080/api/v1/auth/login`
- Content type: `application/json`

### Required headers

- Public endpoints:
  - `Content-Type: application/json`
- Protected endpoints:
  - `Content-Type: application/json`
  - `Authorization: Bearer <access_token>`

### Token + refresh model

- Access token (JWT) is used for protected API calls.
- Refresh token is returned in response and also set as HttpOnly cookie.
- For refresh in browser:
  - `fetch`: `credentials: "include"`
  - axios: `withCredentials: true`

---

## 2) Business Context (Important)

This is a multi-business CRM.

Your JWT token carries:
- `userId`
- `activeBusinessId`
- `activeRole`

For business-scoped routes (members, invitations, contacts, leads), backend uses `activeBusinessId` from token.

You normally **do not** send `businessId` in body/query for those routes.

To change business context:
- call `POST /api/v1/auth/switch-business/:id`
- replace old access token with returned new token

---

## 3) Roles and Access Summary

### Role meaning

- `owner`: full control
- `admin`: almost full control (cannot delete business, cannot remove owner)
- `staff`: operational actions in CRM (create/update/assign), no delete
- `viewer`: read-only

### Module-level permission summary

- Businesses:
  - Create/List/Get: any authenticated member
  - Update: `owner`, `admin`
  - Delete: `owner`
- Business members:
  - List/Remove: `owner`, `admin`
- Invitations:
  - Send/List/Resend/Expire: `owner`, `admin`
  - Accept flow: public (token + otp based)
- Contacts:
  - Create/Update/Fields: `owner`, `admin`, `staff`
  - Delete: `owner`, `admin`
  - Read: all roles (`owner`, `admin`, `staff`, `viewer`)
- Leads:
  - Create/Update/Assign: `owner`, `admin`, `staff`
  - Delete: `owner`, `admin`
  - Read: all roles
- Imports (CSV / Google Sheet / Sync):
  - `owner`, `admin`, `staff`
- Webhook import endpoint:
  - no JWT required, but must send webhook signature and business context header

---

## 4) Standard Response Format

### Success shape

```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2026-05-01T04:00:00.000Z"
  }
}
```

### Error shape

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
    "timestamp": "2026-05-01T04:00:00.000Z"
  }
}
```

### Common status codes

- `200` success
- `400` validation error / bad request
- `401` unauthorized (missing/invalid token)
- `403` forbidden (role not allowed)
- `404` not found
- `409` conflict (duplicate/business rule conflict)
- `410` gone (expired invitation cases)
- `500` server error

---

## 5) Authentication Endpoints

## `POST /api/v1/auth/register`

- Auth: Public
- Roles: N/A
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "businessName": "Acme LLC"
}
```
- Notes:
  - `password` minimum 8 chars
  - creates first business and owner membership
  - sends 6-digit email verification code

## `POST /api/v1/auth/verify-email`

- Auth: Public
- Body:
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```
- Response highlights:
  - `data.token`
  - `data.refreshToken`
  - `data.activeBusiness`
  - `data.businesses`

## `POST /api/v1/auth/resend-verification`

- Auth: Public
- Body:
```json
{
  "email": "john@example.com"
}
```

## `POST /api/v1/auth/login`

- Auth: Public
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- Notes:
  - blocked until email is verified
  - returns `token`, `refreshToken`, `activeBusiness`, `businesses`

## `POST /api/v1/auth/refresh`

- Auth: Public (uses refresh token)
- Body (optional if cookie exists):
```json
{
  "refreshToken": "optional-if-cookie-present"
}
```
- Frontend action:
  - replace stored access token with returned `data.token`

## `POST /api/v1/auth/password-reset/request`

- Auth: Public
- Body:
```json
{
  "email": "john@example.com"
}
```

## `POST /api/v1/auth/password-reset/confirm`

- Auth: Public
- Body:
```json
{
  "email": "john@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

## `POST /api/v1/auth/switch-business/:id`

- Auth: Protected
- Roles: any authenticated member of target business
- Params:
  - `id` (business id)
- Response highlights:
  - `data.token` (new token with new `activeBusinessId` and role)
  - `data.activeBusiness`
  - `data.businesses`

## `POST /api/v1/auth/logout`

- Auth: Protected
- Roles: any authenticated user
- Body: none

---

## 6) Business Endpoints

## `POST /api/v1/businesses`

- Auth: Protected
- Roles: any authenticated user
- Body:
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
- Required:
  - `name`

## `GET /api/v1/businesses`

- Auth: Protected
- Roles: any authenticated user
- Returns list of businesses where user has active membership.

## `GET /api/v1/businesses/:id`

- Auth: Protected
- Roles: member of that business
- Params:
  - `id` (24-char ObjectId)

## `PATCH /api/v1/businesses/:id`

- Auth: Protected
- Roles: `owner`, `admin`
- Params:
  - `id` (24-char ObjectId)
- Body:
  - any subset of `name`, `logoUrl`, `currency`, `location`, `phoneNumber`, `phoneCountry`
  - at least one field required

## `DELETE /api/v1/businesses/:id`

- Auth: Protected
- Roles: `owner`
- Params:
  - `id` (24-char ObjectId)
- Behavior:
  - soft-deletes business
  - removes active memberships in that business
  - updates affected users `activeBusiness` fallback

---

## 7) Business Member Endpoints

These routes are active-business scoped from token.

## `GET /api/v1/business-members`

- Auth: Protected
- Roles: `owner`, `admin`
- Body: none

## `PATCH /api/v1/business-members/:userId/remove`

- Auth: Protected
- Roles: `owner`, `admin`
- Params:
  - `userId` (24-char ObjectId)
- Safety rules:
  - cannot remove self
  - admin cannot remove owner
  - cannot remove the last owner

---

## 8) Invitation Endpoints

Management endpoints below are active-business scoped from token.

## `POST /api/v1/invitations`

- Auth: Protected
- Roles: `owner`, `admin`
- Body:
```json
{
  "email": "member@example.com",
  "role": "staff"
}
```
- `role` must be one of: `owner`, `admin`, `staff`, `viewer`

## `GET /api/v1/invitations`

- Auth: Protected
- Roles: `owner`, `admin`

## `POST /api/v1/invitations/:id/resend`

- Auth: Protected
- Roles: `owner`, `admin`
- Params:
  - `id` (invitation ObjectId)

## `PATCH /api/v1/invitations/:id/expire`

- Auth: Protected
- Roles: `owner`, `admin`
- Params:
  - `id` (invitation ObjectId)

## `GET /api/v1/invitations/accept/:token`

- Auth: Public
- Params:
  - `token`
- Use case:
  - prefill invitation accept page

## `POST /api/v1/invitations/accept/:token`

- Auth: Public
- Params:
  - `token`
- Body:
```json
{
  "email": "member@example.com",
  "role": "staff",
  "otp": "123456",
  "name": "New Member",
  "password": "password123"
}
```
- Validation notes:
  - `email` must match invited email
  - `role` must match invited role
  - `otp` must be 6 chars

---

## 9) CRM Contacts + Leads

All protected CRM endpoints are active-business scoped from token.

### Contact field schema item

```json
{
  "key": "email",
  "label": "Email",
  "type": "email",
  "required": false,
  "unique": false,
  "options": []
}
```

- `key` must be snake_case (`^[a-z][a-z0-9_]*$`)
- Supported `type`: `text`, `email`, `phone`, `address`, `number`, `date`, `select`

### Assignment config

```json
{
  "mode": "auto",
  "strategy": "round_robin",
  "assigneePool": ["6634b9c2aa4d8bcf33a6f111"]
}
```

- `mode`:
  - `queue`: create leads as `unassigned`
  - `auto`: auto-assign from selected pool
- `strategy`:
  - `round_robin`
  - `least_loaded`
- pool users must be active `staff` members

## Contacts endpoints

## `POST /api/v1/contacts`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "title": "Dhaka Real Estate Leads",
  "description": "Inbound leads for Q2 campaign",
  "fieldSchema": [
    { "key": "name", "label": "Name", "type": "text", "required": true },
    { "key": "email", "label": "Email", "type": "email" },
    { "key": "phone", "label": "Phone", "type": "phone" }
  ],
  "assignmentConfig": {
    "mode": "queue",
    "strategy": "round_robin",
    "assigneePool": ["6634b9c2aa4d8bcf33a6f111"]
  }
}
```

## `GET /api/v1/contacts`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`, `viewer`

## `GET /api/v1/contacts/:id`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`, `viewer`

## `PATCH /api/v1/contacts/:id`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body: any subset of:
  - `title`
  - `description`
  - `assignmentConfig`

## `PATCH /api/v1/contacts/:id/fields`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "fieldSchema": [
    { "key": "name", "label": "Name", "type": "text", "required": true },
    { "key": "email", "label": "Email", "type": "email" }
  ]
}
```

## `DELETE /api/v1/contacts/:id`

- Auth: Protected
- Roles: `owner`, `admin`
- Behavior: soft-delete contact list

## `GET /api/v1/contacts/:id/assignable-members`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`, `viewer`
- Returns staff users and whether each is in current assignee pool.

## Leads endpoints

## `POST /api/v1/contacts/:id/leads`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "values": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "01700000000"
  },
  "status": "new",
  "source": "manual",
  "sourceRef": null
}
```
- Duplicate guard:
  - dedupe by `businessId + contactListId + normalized(email, phone)`

## `GET /api/v1/contacts/:id/leads`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`, `viewer`
- Query params (all optional):
  - `page` (int >= 1)
  - `limit` (int 1..100)
  - `search`
  - `status` (`new|open|won|lost`)
  - `assignmentState` (`unassigned|assigned|reassigned`)
  - `assigneeId`
  - `sortBy` (`createdAt|updatedAt|lastActivityAt`)
  - `sortOrder` (`asc|desc`)

## `PATCH /api/v1/leads/:leadId`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "values": {
    "name": "Jane Updated"
  },
  "status": "open"
}
```

## `DELETE /api/v1/leads/:leadId`

- Auth: Protected
- Roles: `owner`, `admin`

## `POST /api/v1/leads/:leadId/assign`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "assigneeId": "6634b9c2aa4d8bcf33a6f111",
  "reason": "Language match"
}
```
- Rule:
  - assignee must be active `staff` and in that contact list assignee pool

---

## 10) Lead Import Endpoints

## `POST /api/v1/contacts/:id/import/csv`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "csv": "name,email,phone\nJane,jane@example.com,01700000000"
}
```

## `POST /api/v1/contacts/:id/import/gsheet`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/abc123",
  "rows": [
    { "name": "Jane", "email": "jane@example.com", "phone": "01700000000" }
  ]
}
```

## `POST /api/v1/contacts/:id/import/gsheet/sync`

- Auth: Protected
- Roles: `owner`, `admin`, `staff`
- Body:
```json
{
  "rows": [
    { "name": "Jane", "email": "jane@example.com", "phone": "01700000000" }
  ]
}
```

## `POST /api/v1/leads/webhook/contacts/:id`

- Auth: Public-style ingestion route
- Required headers:
  - `x-webhook-signature`
  - `x-business-id` (if no JWT context)
- Body:
```json
{
  "leads": [
    { "name": "Jane", "email": "jane@example.com", "phone": "01700000000" }
  ]
}
```

### Note for frontend import UX

For CSV/Google Sheet import UI, recommended client flow:
1. Parse headers in frontend.
2. Let user map source columns to `fieldSchema` keys.
3. Send mapped rows to import endpoint.

This avoids wrong key names and dropped values.

---

## 11) Hello Endpoint

## `GET /api/v1/hello`

- Auth: Public
- Purpose: basic demo/health check

---

## 12) Frontend Integration Flows

### Signup + login flow

1. `POST /auth/register`
2. `POST /auth/verify-email`
3. store `data.token`
4. call protected APIs with `Authorization: Bearer <token>`

### Refresh + retry flow

1. protected call fails with `401`
2. `POST /auth/refresh` with credentials include
3. replace access token
4. retry original call once

### Business switch flow

1. user selects another business
2. `POST /auth/switch-business/:id`
3. replace token immediately with returned `data.token`
4. reload business-scoped data

### Lead import flow

1. fetch selected contact list and `fieldSchema`
2. preview CSV/Sheet headers
3. map headers -> field keys
4. submit transformed rows to import endpoint
5. show import summary (`createdCount`, `duplicateCount`, `failedCount`)

---

## 13) Common Frontend Mistakes

- Not replacing token after `switch-business`.
- Calling business-scoped routes with stale token.
- Sending fields not defined in contact `fieldSchema` (those values may be ignored).
- Trying to assign lead to non-pool or non-staff user.
- Sending webhook payload without `x-webhook-signature`.
- Forgetting `credentials: "include"` on refresh flow.

---

## 14) Source of Truth (Code References)

- Routes index: `src/routes/api/v1/index.js`
- Auth routes: `src/routes/api/v1/auth.js`
- Business routes: `src/routes/api/v1/businesses.js`
- Business member routes: `src/routes/api/v1/businessMembers.js`
- Invitation routes: `src/routes/api/v1/invitations.js`
- Contacts routes: `src/routes/api/v1/contacts.js`
- Leads routes: `src/routes/api/v1/leads.js`
- Controllers: `src/controllers/*.js`
- Validators: `src/validators/*.js`
- Validation middleware: `src/middleware/validateRequest.js`

---

## 15) React frontend (repo root)

- App location: `../frontend` (Vite + React + Tailwind v4 + React Router).
- Local dev: from `frontend/`, run `npm run dev`. Vite proxies `/api` to `http://localhost:8080` so use paths like `/api/v1/...` in `fetch`.
