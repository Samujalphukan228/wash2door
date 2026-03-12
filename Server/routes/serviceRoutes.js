// routes/serviceRoutes.js

import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
    handleServiceImageUpload,
    handleVariantImageUpload
} from '../middleware/uploadMiddleware.js';

import {
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    addVariant,
    updateVariant,
    deleteVariant,
    setPrimaryImage,
    toggleFeatured
} from '../controllers/serviceController.js';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`📍 Service Route: ${req.method} ${req.path}`);
    next();
});

// Health check
router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Service routes OK' });
});

// ============================================
// All routes require admin auth
// ============================================
router.use(protect, isAdmin);

// Service CRUD
router.get('/', getAllServicesAdmin);
router.get('/:serviceId', getServiceById);
router.post('/', handleServiceImageUpload, createService);
router.put('/:serviceId', handleServiceImageUpload, updateService);
router.delete('/:serviceId', deleteService);

// Image management
router.put('/:serviceId/images/:imageId/primary', setPrimaryImage);

// Featured toggle
router.patch('/:serviceId/featured', toggleFeatured);

// Variant routes (replaces vehicle type routes)
router.post('/:serviceId/variants', handleVariantImageUpload, addVariant);
router.put('/:serviceId/variants/:variantId', handleVariantImageUpload, updateVariant);
router.delete('/:serviceId/variants/:variantId', deleteVariant);

export default router;