import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid user ID is required");

export const removeBusinessMemberSchema = z.object({
  params: z.object({
    userId: objectIdSchema,
  }),
});
