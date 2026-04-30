import express from "express";
import {
  listBusinessMembers,
  removeBusinessMember,
} from "../../../controllers/businessMemberController.js";
import {
  authenticate,
  businessScope,
} from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { removeBusinessMemberSchema } from "../../../validators/businessMemberValidator.js";

const router = express.Router();

router.get("/", authenticate, businessScope, listBusinessMembers);
router.patch(
  "/:userId/remove",
  authenticate,
  businessScope,
  validateRequest(removeBusinessMemberSchema),
  removeBusinessMember
);

export default router;
