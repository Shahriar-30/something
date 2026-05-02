import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid invitation ID is required");

export const sendInvitationSchema = z.object({
  body: z.object({
    email: z.string().email("A valid email is required"),
    role: z.enum(["owner", "admin", "staff", "viewer"]),
  }),
});

export const invitationIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const invitationTokenParamsSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Invitation token is required"),
  }),
});

export const acceptInvitationSchema = z.object({
  params: z.object({
    token: z.string().min(1, "Invitation token is required"),
  }),
  body: z.object({
    email: z.string().email("A valid email is required"),
    role: z.enum(["owner", "admin", "staff", "viewer"]),
    otp: z
      .string()
      .min(6, "OTP is required")
      .max(6, "OTP must be 6 characters"),
    name: z.string().min(1, "Name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});
