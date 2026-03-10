// routes/serviceRoutes.js - COMPLETE

import express from 'express';
import {
    createService,
    updateService,
    deleteService,
    getAllServicesAdmin,
    getServiceById,
    addVehicleType,
    updateVehicleType,
    deleteVehicleType,
    setPrimaryImage
} from '../controllers/serviceController.js';

import { protect, isAdmin } from '../middleware/auth.js';
import {
    handleServiceImageUpload,
    handleVehicleImageUpload
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require admin
router.use(protect, isAdmin);

// ============================================
// SERVICE ROUTES
// ============================================

// GET all services (admin)
router.get('/', getAllServicesAdmin);

// GET single service
router.get('/:serviceId', getServiceById);

// CREATE service with images (max 3)
router.post('/', handleServiceImageUpload, createService);

// UPDATE service
router.put('/:serviceId', handleServiceImageUpload, updateService);

// DELETE service
router.delete('/:serviceId', deleteService);

// Set primary image
router.put('/:serviceId/images/:imageId/primary', setPrimaryImage);

// ============================================
// VEHICLE TYPE ROUTES
// ============================================

// ADD vehicle type (with image)
router.post('/:serviceId/vehicles', handleVehicleImageUpload, addVehicleType);

// UPDATE vehicle type (with image)
router.put('/:serviceId/vehicles/:vehicleTypeId', handleVehicleImageUpload, updateVehicleType);

// DELETE vehicle type
router.delete('/:serviceId/vehicles/:vehicleTypeId', deleteVehicleType);

export default router;