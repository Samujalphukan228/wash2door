// routes/publicRoutes.js

import express from "express";
import {
  getActiveServices,
  getServiceDetails,
  getCategories,
  getSubcategoriesByCategory,  // ✅ ADD THIS
  getServiceReviews,
  checkAvailability,
  getFeaturedServices,
  getAvailableSlots,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/services", getActiveServices);
router.get("/services/featured", getFeaturedServices);
router.get("/services/:serviceId", getServiceDetails);
router.get("/services/:serviceId/reviews", getServiceReviews);
router.get("/categories", getCategories);
router.get("/categories/:categoryId/subcategories", getSubcategoriesByCategory);  // ✅ ADD THIS
router.get("/availability", checkAvailability);
router.get("/slots", getAvailableSlots);

export default router;