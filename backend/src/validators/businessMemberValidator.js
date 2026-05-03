import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid user ID is required");

export const removeBusinessMemberSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});

export const updateBusinessMemberRoleSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
  body: z.object({
    role: z.enum(["owner", "admin", "staff", "viewer"], {
      required_error: "Role is required",
      invalid_type_error: "Role must be owner, admin, staff, or viewer",
    }),
  }),
});
