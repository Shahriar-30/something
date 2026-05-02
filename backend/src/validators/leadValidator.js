import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "A valid ID is required");

const sourceSchema = z.enum(["manual", "webhook", "csv", "gsheet"]);

export const createLeadSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    values: z.record(z.string(), z.any()),
    status: z.enum(["new", "open", "won", "lost"]).optional(),
    source: sourceSchema.optional(),
    sourceRef: z.string().optional().nullable(),
  }),
});

export const getLeadsSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.enum(["new", "open", "won", "lost"]).optional(),
    assignmentState: z.enum(["unassigned", "assigned", "reassigned"]).optional(),
    assigneeId: objectIdSchema.optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "lastActivityAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const leadIdParamsSchema = z.object({
  params: z.object({
    leadId: objectIdSchema,
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    leadId: objectIdSchema,
  }),
  body: z.object({
    values: z.record(z.string(), z.any()).optional(),
    status: z.enum(["new", "open", "won", "lost"]).optional(),
  }),
});

export const assignLeadSchema = z.object({
  params: z.object({
    leadId: objectIdSchema,
  }),
  body: z.object({
    assigneeId: objectIdSchema,
    reason: z.string().optional().nullable(),
  }),
});

export const importCsvSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    csv: z.string().min(1, "CSV content is required"),
  }),
});

export const importWebhookSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    leads: z.array(z.record(z.string(), z.any())).min(1, "At least one lead is required"),
  }),
});

export const importGoogleSheetSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    sheetUrl: z.string().url("A valid Google Sheet URL is required"),
    rows: z.array(z.record(z.string(), z.any())).optional(),
  }),
});

export const syncGoogleSheetSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    rows: z.array(z.record(z.string(), z.any())).min(1, "Rows are required for sync"),
  }),
});
