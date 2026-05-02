import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid business ID is required");

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .nullable();

const updateBusinessBodySchema = z
  .object({
    name: z.string().trim().min(1, "Business name is required").optional(),
    logoUrl: nullableTrimmedString.optional(),
    currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
    location: z
      .object({
        street: nullableTrimmedString.optional(),
        city: nullableTrimmedString.optional(),
        state: nullableTrimmedString.optional(),
        zip: nullableTrimmedString.optional(),
        country: nullableTrimmedString.optional(),
      })
      .optional(),
    phoneNumber: nullableTrimmedString.optional(),
    phoneCountry: nullableTrimmedString.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export const updateBusinessSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: updateBusinessBodySchema,
});

export const createBusinessSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Business name is required"),
    logoUrl: nullableTrimmedString.optional(),
    currency: z.string().trim().min(3).max(3).toUpperCase().optional(),
    location: z
      .object({
        street: nullableTrimmedString.optional(),
        city: nullableTrimmedString.optional(),
        state: nullableTrimmedString.optional(),
        zip: nullableTrimmedString.optional(),
        country: nullableTrimmedString.optional(),
      })
      .optional(),
    phoneNumber: nullableTrimmedString.optional(),
    phoneCountry: nullableTrimmedString.optional(),
  }),
});

export const getBusinessByIdSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteBusinessSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
