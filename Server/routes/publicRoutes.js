import express from "express";
import {
  getActiveServices,
  getServiceDetails,
  getCategories,
  getSubcategoriesByCategory,
  checkAvailability,
  getFeaturedServices,
  getAvailableSlots,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/services", getActiveServices);
router.get("/services/featured", getFeaturedServices);
router.get("/services/:serviceId", getServiceDetails);
router.get("/categories", getCategories);
router.get("/categories/:categoryId/subcategories", getSubcategoriesByCategory);
router.get("/availability", checkAvailability);
router.get("/slots", getAvailableSlots);

export default router;