import { z } from "zod";

const emailSchema = z.string().email();

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: emailSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    businessName: z.string().min(1, "Business name is required"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required").optional(),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: emailSchema,
    code: z.string().length(6, "Verification code must be 6 digits"),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const passwordResetConfirmSchema = z.object({
  body: z.object({
    email: emailSchema,
    code: z.string().length(6, "Password reset code must be 6 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const switchBusinessSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Business ID is required"),
  }),
});
