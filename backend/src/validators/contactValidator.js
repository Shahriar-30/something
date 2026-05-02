import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid ID is required");

const fieldItemSchema = z.object({
  key: z
    .string()
    .min(1, "Field key is required")
    .regex(/^[a-z][a-z0-9_]*$/, "Field key must be snake_case"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "phone", "address", "number", "date", "select"]),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  options: z.array(z.string()).optional(),
});

const assignmentConfigSchema = z.object({
  mode: z.enum(["queue", "auto"]).optional(),
  strategy: z.enum(["round_robin", "least_loaded"]).optional(),
  assigneePool: z.array(objectIdSchema).optional(),
});

export const createContactSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    fieldSchema: z.array(fieldItemSchema).optional(),
    assignmentConfig: assignmentConfigSchema.optional(),
  }),
});

export const contactIdParamsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateContactSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    assignmentConfig: assignmentConfigSchema.optional(),
  }),
});

export const updateContactFieldsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    fieldSchema: z.array(fieldItemSchema).min(1, "At least one field is required"),
  }),
});
