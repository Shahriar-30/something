import express from "express";
import {
  sendInvitation,
  getInvitationDetailsByToken,
  acceptInvitation,
  getInvitations,
  expireInvitation,
  resendInvitation,
} from "../../../controllers/invitationController.js";
import {
  authenticate,
  businessScope,
  requireRole,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { ROLE_GROUPS } from "../../../utils/rbac.js";
import {
  sendInvitationSchema,
  invitationIdParamsSchema,
  invitationTokenParamsSchema,
  acceptInvitationSchema,
} from "../../../validators/invitationValidator.js";

const router = express.Router();

const INVITATION_MANAGEMENT_ROLES = ROLE_GROUPS.INVITATION_MANAGEMENT;

router.post(
  "/",
  authenticate,
  businessScope,
  requireRole(...INVITATION_MANAGEMENT_ROLES),
  validateRequest(sendInvitationSchema),
  sendInvitation
);
router.get(
  "/",
  authenticate,
  businessScope,
  requireRole(...INVITATION_MANAGEMENT_ROLES),
  getInvitations
);
router.post(
  "/:id/resend",
  authenticate,
  businessScope,
  requireRole(...INVITATION_MANAGEMENT_ROLES),
  validateRequest(invitationIdParamsSchema),
  resendInvitation
);
router.patch(
  "/:id/expire",
  authenticate,
  businessScope,
  requireRole(...INVITATION_MANAGEMENT_ROLES),
  validateRequest(invitationIdParamsSchema),
  expireInvitation
);
router.get(
  "/accept/:token",
  validateRequest(invitationTokenParamsSchema),
  getInvitationDetailsByToken
);
router.post(
  "/accept/:token",
  validateRequest(acceptInvitationSchema),
  acceptInvitation
);

export default router;
