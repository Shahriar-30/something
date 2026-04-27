import express from "express";
import {
  register,
  login,
  switchBusiness,
  refreshToken,
  logout,
} from "../../../controllers/authController.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  switchBusinessSchema,
} from "../../../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", validateRequest(refreshTokenSchema), refreshToken);
router.patch(
  "/switch-business/:id",
  authenticate,
  validateRequest(switchBusinessSchema),
  switchBusiness
);
router.post("/logout", authenticate, logout);

export default router;
