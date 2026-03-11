import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
    handleServiceImageUpload,
    handleVehicleImageUpload
} from '../middleware/uploadMiddleware.js';

// Import controller functions
import {
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    addVehicleType,
    updateVehicleType,
    deleteVehicleType,
    setPrimaryImage
} from '../controllers/serviceController.js';

const router = express.Router();

// Debug middleware - log all requests to this router
router.use((req, res, next) => {
    console.log(`📍 Service Route: ${req.method} ${req.path}`);
    next();
});

// Health check (no auth)
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Service routes OK' });
});

// ============================================
// All routes below require admin auth
// ============================================
router.use(protect, isAdmin);

// GET all services
router.get('/', getAllServicesAdmin);

// GET single service
router.get('/:serviceId', getServiceById);

// CREATE service
router.post('/', handleServiceImageUpload, createService);

// UPDATE service
router.put('/:serviceId', handleServiceImageUpload, updateService);

// DELETE service
router.delete('/:serviceId', deleteService);

// Set primary image
router.put('/:serviceId/images/:imageId/primary', setPrimaryImage);

// Vehicle type routes
router.post('/:serviceId/vehicles', handleVehicleImageUpload, addVehicleType);
router.put('/:serviceId/vehicles/:vehicleTypeId', handleVehicleImageUpload, updateVehicleType);
router.delete('/:serviceId/vehicles/:vehicleTypeId', deleteVehicleType);

export default router;