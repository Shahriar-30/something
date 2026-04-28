import express from "express";
import {
  createBusiness,
  getBusinessById,
  getMyBusinesses,
  updateBusiness,
  softDeleteBusiness,
} from "../../../controllers/businessController.js";
import { authenticate } from "../../../middleware/authMiddleware.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  createBusinessSchema,
  getBusinessByIdSchema,
  updateBusinessSchema,
  deleteBusinessSchema,
} from "../../../validators/businessValidator.js";

const router = express.Router();

router.post("/", authenticate, validateRequest(createBusinessSchema), createBusiness);
router.get("/", authenticate, getMyBusinesses);
router.get(
  "/:id",
  authenticate,
  validateRequest(getBusinessByIdSchema),
  getBusinessById
);
router.patch(
  "/:id",
  authenticate,
  validateRequest(updateBusinessSchema),
  updateBusiness
);
router.delete(
  "/:id",
  authenticate,
  validateRequest(deleteBusinessSchema),
  softDeleteBusiness
);

export default router;
