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
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  assignLeadSchema,
  importWebhookSchema,
  leadIdParamsSchema,
  updateLeadSchema,
} from "../../../validators/leadValidator.js";

const router = express.Router();

router.patch(
  "/:leadId",
  authenticate,
  businessScope,
  validateRequest(updateLeadSchema),
  updateLead
);
router.delete(
  "/:leadId",
  authenticate,
  businessScope,
  validateRequest(leadIdParamsSchema),
  deleteLead
);
router.post(
  "/:leadId/assign",
  authenticate,
  businessScope,
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
