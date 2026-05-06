import express from "express";
import {
  assignLead,
  deleteLead,
  updateLead,
} from "../../../controllers/leadController.js";
import { importLeadsFromWebhook } from "../../../controllers/leadImportController.js";
import {
  authenticate,
  businessScope,
  requireRole,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  assignLeadSchema,
  importWebhookSchema,
  leadIdParamsSchema,
  updateLeadSchema,
} from "../../../validators/leadValidator.js";
import { ROLE_GROUPS } from "../../../utils/rbac.js";

const router = express.Router();
const LEAD_MUTATE_ROLES = ROLE_GROUPS.LEAD_MUTATE;
const LEAD_DELETE_ROLES = ROLE_GROUPS.LEAD_DELETE;

router.patch(
  "/:leadId",
  authenticate,
  businessScope,
  requireRole(...LEAD_MUTATE_ROLES),
  validateRequest(updateLeadSchema),
  updateLead
);
router.delete(
  "/:leadId",
  authenticate,
  businessScope,
  requireRole(...LEAD_DELETE_ROLES),
  validateRequest(leadIdParamsSchema),
  deleteLead
);
router.post(
  "/:leadId/assign",
  authenticate,
  businessScope,
  requireRole(...LEAD_MUTATE_ROLES),
  validateRequest(assignLeadSchema),
  assignLead
);

// Public-ish webhook endpoint. Signature and business scope are validated in controller.
router.post(
  "/webhook/contacts/:id",
  validateRequest(importWebhookSchema),
  importLeadsFromWebhook
);

export default router;
