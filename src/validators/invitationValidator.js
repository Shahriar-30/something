import { z } from "zod";

export const sendInvitationSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    role: z.enum(["owner", "admin", "staff", "viewer"]),
  }),
});

export const acceptInvitationSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Invitation token is required"),
  }),
  body: z.object({
    otp: z
      .string()
      .min(6, "OTP is required")
      .max(6, "OTP must be 6 characters"),
    name: z.string().min(1, "Name is required").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  }),
});
