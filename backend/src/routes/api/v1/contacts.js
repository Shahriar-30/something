import express from "express";
import {
  createContact,
  deleteContact,
  getContactAssignableMembers,
  getContactById,
  getContacts,
  updateContact,
  updateContactFields,
} from "../../../controllers/contactController.js";
import {
  createLead,
  getLeads,
} from "../../../controllers/leadController.js";
import {
  importGoogleSheet,
  importLeadsFromCsv,
  syncGoogleSheet,
} from "../../../controllers/leadImportController.js";
import {
  authenticate,
  businessScope,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  contactIdParamsSchema,
  createContactSchema,
  updateContactFieldsSchema,
  updateContactSchema,
} from "../../../validators/contactValidator.js";
import {
  createLeadSchema,
  getLeadsSchema,
  importCsvSchema,
  importGoogleSheetSchema,
  syncGoogleSheetSchema,
} from "../../../validators/leadValidator.js";

const router = express.Router();

router.post("/", authenticate, businessScope, validateRequest(createContactSchema), createContact);
router.get("/", authenticate, businessScope, getContacts);
router.get(
  "/:id",
  authenticate,
  businessScope,
  validateRequest(contactIdParamsSchema),
  getContactById
);
router.patch(
  "/:id",
  authenticate,
  businessScope,
  validateRequest(updateContactSchema),
  updateContact
);
router.patch(
  "/:id/fields",
  authenticate,
  businessScope,
  validateRequest(updateContactFieldsSchema),
  updateContactFields
);
router.delete(
  "/:id",
  authenticate,
  businessScope,
  validateRequest(contactIdParamsSchema),
  deleteContact
);
router.get(
  "/:id/assignable-members",
  authenticate,
  businessScope,
  validateRequest(contactIdParamsSchema),
  getContactAssignableMembers
);
router.post(
  "/:id/leads",
  authenticate,
  businessScope,
  validateRequest(createLeadSchema),
  createLead
);
router.get(
  "/:id/leads",
  authenticate,
  businessScope,
  validateRequest(getLeadsSchema),
  getLeads
);
router.post(
  "/:id/import/csv",
  authenticate,
  businessScope,
  validateRequest(importCsvSchema),
  importLeadsFromCsv
);
router.post(
  "/:id/import/gsheet",
  authenticate,
  businessScope,
  validateRequest(importGoogleSheetSchema),
  importGoogleSheet
);
router.post(
  "/:id/import/gsheet/sync",
  authenticate,
  businessScope,
  validateRequest(syncGoogleSheetSchema),
  syncGoogleSheet
);

export default router;
