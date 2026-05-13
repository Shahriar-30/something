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
import { createLead, getLeads } from "../../../controllers/leadController.js";
import {
  importGoogleSheet,
  importLeadsFromCsv,
  syncGoogleSheet,
} from "../../../controllers/leadImportController.js";
import {
  authenticate,
  businessScope,
  requireRole,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  contactIdParamsSchema,
  createContactSchema,
  updateContactFieldsSchema,
  updateContactSchema,
  deleteContactSchema,
} from "../../../validators/contactValidator.js";
import { ROLE_GROUPS } from "../../../utils/rbac.js";
import {
  createLeadSchema,
  getLeadsSchema,
  importCsvSchema,
  importGoogleSheetSchema,
  syncGoogleSheetSchema,
} from "../../../validators/leadValidator.js";

const router = express.Router();
const CONTACT_CREATE_ROLES = ROLE_GROUPS.CONTACT_CREATE;
const CONTACT_MUTATE_ROLES = ROLE_GROUPS.CONTACT_MUTATE;
const CONTACT_VIEW_ROLES = ROLE_GROUPS.CONTACT_VIEW;
const BUSINESS_ADMIN_ROLES = ROLE_GROUPS.BUSINESS_ADMIN;

router.post(
  "/",
  authenticate,
  businessScope,
  requireRole(...CONTACT_CREATE_ROLES),
  validateRequest(createContactSchema),
  createContact
);
router.get(
  "/",
  authenticate,
  businessScope,
  requireRole(...CONTACT_VIEW_ROLES),
  getContacts
);
router.get(
  "/:id",
  authenticate,
  businessScope,
  requireRole(...CONTACT_VIEW_ROLES),
  validateRequest(contactIdParamsSchema),
  getContactById
);
router.patch(
  "/:id",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(updateContactSchema),
  updateContact
);
router.patch(
  "/:id/fields",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(updateContactFieldsSchema),
  updateContactFields
);
router.delete(
  "/:id",
  authenticate,
  businessScope,
  requireRole(...BUSINESS_ADMIN_ROLES),
  validateRequest(deleteContactSchema),
  deleteContact
);
router.get(
  "/:id/assignable-members",
  authenticate,
  businessScope,
  requireRole(...CONTACT_VIEW_ROLES),
  validateRequest(contactIdParamsSchema),
  getContactAssignableMembers
);
router.post(
  "/:id/leads",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(createLeadSchema),
  createLead
);
router.get(
  "/:id/leads",
  authenticate,
  businessScope,
  requireRole(...CONTACT_VIEW_ROLES),
  validateRequest(getLeadsSchema),
  getLeads
);
router.post(
  "/:id/import/csv",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(importCsvSchema),
  importLeadsFromCsv
);
router.post(
  "/:id/import/gsheet",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(importGoogleSheetSchema),
  importGoogleSheet
);
router.post(
  "/:id/import/gsheet/sync",
  authenticate,
  businessScope,
  requireRole(...CONTACT_MUTATE_ROLES),
  validateRequest(syncGoogleSheetSchema),
  syncGoogleSheet
);

export default router;
