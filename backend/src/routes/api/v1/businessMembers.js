import express from "express";
import {
  listBusinessMembers,
  removeBusinessMember,
  updateBusinessMemberRole,
} from "../../../controllers/businessMemberController.js";
import {
  authenticate,
  businessScope,
  requireRole,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { ROLE_GROUPS } from "../../../utils/rbac.js";
import {
  removeBusinessMemberSchema,
  updateBusinessMemberRoleSchema,
} from "../../../validators/businessMemberValidator.js";

const router = express.Router();
const MEMBER_MANAGEMENT_ROLES = ROLE_GROUPS.MEMBER_MANAGEMENT;

router.get(
  "/",
  authenticate,
  businessScope,
  requireRole(...MEMBER_MANAGEMENT_ROLES),
  listBusinessMembers
);
router.patch(
  "/:userId/remove",
  authenticate,
  businessScope,
  requireRole(...MEMBER_MANAGEMENT_ROLES),
  validateRequest(removeBusinessMemberSchema),
  removeBusinessMember
);
router.patch(
  "/:userId/role",
  authenticate,
  businessScope,
  requireRole(...MEMBER_MANAGEMENT_ROLES),
  validateRequest(updateBusinessMemberRoleSchema),
  updateBusinessMemberRole
);

export default router;
