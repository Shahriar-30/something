import express from "express";
import {
  listBusinessMembers,
  removeBusinessMember,
  updateBusinessMemberRole,
} from "../../../controllers/businessMemberController.js";
import {
  authenticate,
  businessScope,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  removeBusinessMemberSchema,
  updateBusinessMemberRoleSchema,
} from "../../../validators/businessMemberValidator.js";

const router = express.Router();

router.get("/", authenticate, businessScope, listBusinessMembers);
router.patch(
  "/:userId/remove",
  authenticate,
  businessScope,
  validateRequest(removeBusinessMemberSchema),
  removeBusinessMember
);
router.patch(
  "/:userId/role",
  authenticate,
  businessScope,
  validateRequest(updateBusinessMemberRoleSchema),
  updateBusinessMemberRole
);

export default router;
