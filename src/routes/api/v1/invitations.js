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
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  sendInvitationSchema,
  invitationIdParamsSchema,
  invitationTokenParamsSchema,
  acceptInvitationSchema,
} from "../../../validators/invitationValidator.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  businessScope,
  validateRequest(sendInvitationSchema),
  sendInvitation
);
router.get("/", authenticate, businessScope, getInvitations);
router.post(
  "/:id/resend",
  authenticate,
  businessScope,
  validateRequest(invitationIdParamsSchema),
  resendInvitation
);
router.patch(
  "/:id/expire",
  authenticate,
  businessScope,
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
