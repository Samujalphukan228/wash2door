// controllers/publicController.js - COMPLETE FIXED

import Service from '../models/Service.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL ACTIVE SERVICES
// ============================================

export const getActiveServices = async (req, res) => {
    try {
        const { category, sort, search } = req.query;

        const query = { isActive: true };

        if (category) {
            const validCategories = ['basic', 'standard', 'premium'];
            if (validCategories.includes(category)) {
                query.category = category;
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { displayOrder: 1 };

        if (sort === 'price-low') sortOption = { startingPrice: 1 };
        if (sort === 'price-high') sortOption = { startingPrice: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'popular') sortOption = { totalBookings: -1 };

        const services = await Service.find(query)
            .select('name shortDescription category images vehicleTypes highlights startingPrice averageRating totalReviews totalBookings displayOrder isActive')
            .sort(sortOption);

        // Format response
        const formattedServices = services.map(service => ({
            _id: service._id,
            name: service.name,
            shortDescription: service.shortDescription,
            category: service.category,
            primaryImage: service.primaryImage,
            images: service.images,
            highlights: service.highlights,
            startingPrice: service.startingPrice,
            priceRange: service.priceRange,
            averageRating: service.averageRating,
            totalReviews: service.totalReviews,
            totalBookings: service.totalBookings,
            vehicleCount: service.vehicleTypes.filter(v => v.isActive).length
        }));

        res.status(200).json({
            success: true,
            total: formattedServices.length,
            data: formattedServices
        });

    } catch (error) {
        console.error('Get active services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE SERVICE DETAILS
// ============================================

export const getServiceDetails = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findOne({
            _id: serviceId,
            isActive: true
        }).select('-createdBy');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Get active vehicle types only
        const activeVehicleTypes = service.vehicleTypes
            .filter(v => v.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        // Get reviews
        const reviews = await Review.find({
            serviceId,
            isVisible: true
        })
            .populate('customerId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .limit(10);

        // Rating breakdown
        const ratingBreakdown = await Review.aggregate([
            {
                $match: {
                    serviceId: new mongoose.Types.ObjectId(serviceId),
                    isVisible: true
                }
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                service: {
                    _id: service._id,
                    name: service.name,
                    description: service.description,
                    shortDescription: service.shortDescription,
                    category: service.category,
                    images: service.images,
                    primaryImage: service.primaryImage,
                    highlights: service.highlights,
                    includes: service.includes,
                    excludes: service.excludes,
                    vehicleTypes: activeVehicleTypes,
                    startingPrice: service.startingPrice,
                    priceRange: service.priceRange,
                    averageRating: service.averageRating,
                    totalReviews: service.totalReviews,
                    totalBookings: service.totalBookings
                },
                reviews,
                ratingBreakdown
            }
        });

    } catch (error) {
        console.error('Get service details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service details',
            error: error.message
        });
    }
};

// ============================================
// GET CATEGORIES
// ============================================

export const getCategories = async (req, res) => {
    try {
        const categories = await Service.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    minPrice: { $min: '$startingPrice' },
                    maxPrice: { $max: '$startingPrice' },
                    avgRating: { $avg: '$averageRating' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Order: basic → standard → premium
        const order = ['basic', 'standard', 'premium'];
        const sorted = categories.sort(
            (a, b) => order.indexOf(a._id) - order.indexOf(b._id)
        );

        res.status(200).json({
            success: true,
            data: sorted
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// ============================================
// GET SERVICE REVIEWS
// ============================================

export const getServiceReviews = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { page = 1, limit = 10, rating } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const query = {
            serviceId,
            isVisible: true
        };

        // Filter by rating
        if (rating) {
            query.rating = Number(rating);
        }

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('customerId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: reviews
        });

    } catch (error) {
        console.error('Get service reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// ============================================
// CHECK AVAILABILITY (KEPT FOR PUBLIC)
// ============================================

export const checkAvailability = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        if (!serviceId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Service ID and date are required'
            });
        }

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Check Sunday
        if (bookingDate.getDay() === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isAvailable: false,
                    message: 'We are closed on Sundays',
                    slots: []
                }
            });
        }

        const allSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ];

        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { default: Booking } = await import('../models/Booking.js');

        const bookedSlots = await Booking.find({
            serviceId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        const slots = allSlots.map(slot => ({
            slot,
            available: !bookedSlotNames.includes(slot)
        }));

        res.status(200).json({
            success: true,
            data: {
                date,
                isAvailable: true,
                slots
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability',
            error: error.message
        });
    }
};