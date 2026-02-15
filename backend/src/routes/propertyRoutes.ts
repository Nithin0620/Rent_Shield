import { Router } from "express";
import {
  createProperty,
  listMyProperties,
  listProperties,
  getProperty,
  updateProperty
} from "../controllers/propertyController";
import { protect, restrictTo } from "../middleware/authMiddleware";

const router = Router();

router
  .route("/")
  .post(protect, restrictTo("landlord"), createProperty)
  .get(listProperties);

router.get("/me", protect, restrictTo("landlord"), listMyProperties);

router
  .route("/:propertyId")
  .get(getProperty)
  .patch(protect, restrictTo("landlord"), updateProperty);

export default router;
