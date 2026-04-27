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
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const switchBusinessSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Business ID is required"),
  }),
});
