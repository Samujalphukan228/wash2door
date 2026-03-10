// Update publicRoutes.js - Add new service routes

import express from 'express';
import Service from '../models/Service.js';
import Review from '../models/Review.js';

const router = express.Router();

// GET all active services (public)
router.get('/services', async (req, res) => {
    try {
        const { category, sort, search } = req.query;

        const query = { isActive: true };
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { displayOrder: 1 };
        if (sort === 'price-low') sortOption = { startingPrice: 1 };
        if (sort === 'price-high') sortOption = { startingPrice: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'popular') sortOption = { totalBookings: -1 };

        const services = await Service.find(query)
            .select('name shortDescription category images vehicleTypes highlights startingPrice averageRating totalReviews displayOrder')
            .sort(sortOption);

        res.status(200).json({
            success: true,
            total: services.length,
            data: services
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
});

// GET single service with full details (public)
router.get('/services/:serviceId', async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: req.params.serviceId,
            isActive: true
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Get reviews
        const reviews = await Review.find({
            serviceId: req.params.serviceId,
            isVisible: true
        })
        .populate('customerId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            data: { service, reviews }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching service' });
    }
});

// GET service vehicle types only (for booking step 2)
router.get('/services/:serviceId/vehicles', async (req, res) => {
    try {
        const service = await Service.findOne({
            _id: req.params.serviceId,
            isActive: true
        }).select('name vehicleTypes');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Only return active vehicle types
        const activeVehicles = service.vehicleTypes
            .filter(v => v.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        res.status(200).json({
            success: true,
            data: {
                serviceName: service.name,
                vehicleTypes: activeVehicles
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching vehicle types' });
    }
});

// GET categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Service.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    minPrice: { $min: '$startingPrice' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching categories' });
    }
});

export default router;