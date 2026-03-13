// routes/serviceRoutes.js - UPDATED

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
    deleteImage,
    toggleFeatured,
    toggleActive,
    reorderServices
} from '../controllers/serviceController.js';

const router = express.Router();

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

// Service status toggles
router.patch('/:serviceId/featured', toggleFeatured);
router.patch('/:serviceId/active', toggleActive);

// Reorder services
router.put('/reorder/bulk', reorderServices);

// Image management
router.put('/:serviceId/images/:imageId/primary', setPrimaryImage);
router.delete('/:serviceId/images/:imageId', deleteImage);

// Variant routes
router.post('/:serviceId/variants', handleVariantImageUpload, addVariant);
router.put('/:serviceId/variants/:variantId', handleVariantImageUpload, updateVariant);
router.delete('/:serviceId/variants/:variantId', deleteVariant);

export default router;