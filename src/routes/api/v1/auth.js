import express from "express";
import {
  register,
  login,
  switchBusiness,
  refreshToken,
  logout,
  verifyEmail,
  resendVerification,
  passwordResetRequest,
  passwordResetConfirm,
} from "../../../controllers/authController.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  switchBusinessSchema,
} from "../../../validators/authValidator.js";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh", validateRequest(refreshTokenSchema), refreshToken);
router.post("/verify-email", validateRequest(verifyEmailSchema), verifyEmail);
router.post(
  "/resend-verification",
  validateRequest(resendVerificationSchema),
  resendVerification
);
router.post(
  "/password-reset/request",
  validateRequest(passwordResetRequestSchema),
  passwordResetRequest
);
router.post(
  "/password-reset/confirm",
  validateRequest(passwordResetConfirmSchema),
  passwordResetConfirm
);
router.post(
  "/switch-business/:id",
  authenticate,
  validateRequest(switchBusinessSchema),
  switchBusiness
);
router.post("/logout", authenticate, logout);

export default router;
