// controllers/publicController.js - UPDATED with GLOBAL SLOT CHECK

import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { TIME_SLOTS } from '../utils/constants.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL ACTIVE SERVICES - WITH PAGINATION
// ============================================
export const getActiveServices = async (req, res) => {
    try {
        const {
            category,
            tier,
            sort,
            search,
            page = 1,
            limit = 12,
            featured
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;

        const query = { isActive: true };

        if (category && isValidObjectId(category)) {
            query.category = category;
        }

        if (tier) {
            const validTiers = ['basic', 'standard', 'premium', 'custom'];
            if (validTiers.includes(tier)) {
                query.tier = tier;
            }
        }

        if (featured === 'true') {
            query.isFeatured = true;
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
        if (sort === 'newest') sortOption = { createdAt: -1 };

        const total = await Service.countDocuments(query);

        const services = await Service.find(query)
            .populate('category', 'name slug icon image')
            .select('name shortDescription category tier images variants highlights startingPrice averageRating totalReviews totalBookings displayOrder isFeatured')
            .sort(sortOption)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const formattedServices = services.map(service => ({
            _id: service._id,
            name: service.name,
            shortDescription: service.shortDescription,
            category: service.category,
            tier: service.tier,
            primaryImage: service.primaryImage,
            images: service.images,
            highlights: service.highlights,
            startingPrice: service.startingPrice,
            priceRange: service.priceRange,
            averageRating: service.averageRating,
            totalReviews: service.totalReviews,
            totalBookings: service.totalBookings,
            isFeatured: service.isFeatured,
            variantCount: service.variants ? service.variants.filter(v => v.isActive).length : 0,
            variants: service.variants
                ? service.variants
                    .filter(v => v.isActive)
                    .map(v => ({
                        _id: v._id,
                        name: v.name,
                        price: v.price,
                        discountPrice: v.discountPrice,
                        duration: v.duration
                    }))
                : []
        }));

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            hasMore: pageNum < Math.ceil(total / limitNum),
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
        })
            .populate('category', 'name slug icon image')
            .select('-createdBy');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const activeVariants = service.variants
            .filter(v => v.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder);

        const reviews = await Review.find({
            serviceId,
            isVisible: true
        })
            .populate('customerId', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .limit(10);

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

        // Get related services (same category, exclude current)
        const relatedServices = await Service.find({
            category: service.category._id,
            _id: { $ne: serviceId },
            isActive: true
        })
            .select('name shortDescription images startingPrice averageRating tier')
            .limit(4);

        res.status(200).json({
            success: true,
            data: {
                service: {
                    _id: service._id,
                    name: service.name,
                    description: service.description,
                    shortDescription: service.shortDescription,
                    category: service.category,
                    tier: service.tier,
                    images: service.images,
                    primaryImage: service.primaryImage,
                    highlights: service.highlights,
                    includes: service.includes,
                    excludes: service.excludes,
                    variants: activeVariants,
                    startingPrice: service.startingPrice,
                    priceRange: service.priceRange,
                    averageRating: service.averageRating,
                    totalReviews: service.totalReviews,
                    totalBookings: service.totalBookings,
                    isFeatured: service.isFeatured
                },
                reviews,
                ratingBreakdown,
                relatedServices
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
        const { withServiceCount = 'true' } = req.query;

        const categories = await Category.find({ isActive: true })
            .select('name slug icon image description displayOrder')
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();

        let result = categories;

        // Add service count if requested
        if (withServiceCount === 'true') {
            result = await Promise.all(
                categories.map(async (cat) => {
                    const count = await Service.countDocuments({
                        category: cat._id,
                        isActive: true
                    });
                    return {
                        ...cat,
                        totalServices: count
                    };
                })
            );
        }

        res.status(200).json({
            success: true,
            total: result.length,
            data: result
        });

    } catch (error) {
        console.error('getCategories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// ============================================
// GET SERVICE REVIEWS
// ============================================
export const getServiceReviews = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { page = 1, limit = 10, rating, sort = 'newest' } = req.query;

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

        if (rating) {
            const ratingNum = parseInt(rating);
            if (ratingNum >= 1 && ratingNum <= 5) {
                query.rating = ratingNum;
            }
        }

        let sortOption = { createdAt: -1 }; // newest
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('customerId', 'firstName lastName avatar')
            .sort(sortOption)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        // Get rating stats
        const ratingStats = await Review.aggregate([
            { $match: { serviceId: new mongoose.Types.ObjectId(serviceId), isVisible: true } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                    rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                    rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                    rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            stats: ratingStats[0] || null,
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
// CHECK AVAILABILITY (GLOBAL - ALL SERVICES)
// ============================================
export const checkAvailability = async (req, res) => {
    try {
        const { serviceId, date } = req.query;

        // Date is required, serviceId is optional (kept for API compatibility)
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check availability for past dates'
            });
        }

        // Check if Sunday (closed)
        if (bookingDate.getDay() === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isAvailable: false,
                    isClosed: true,
                    message: 'We are closed on Sundays',
                    availableSlots: 0,
                    totalSlots: TIME_SLOTS.length,
                    slots: TIME_SLOTS.map(slot => ({
                        slot,
                        available: false,
                        reason: 'Closed'
                    }))
                }
            });
        }

        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        // ============================================
        // GLOBAL CHECK - Get ALL bookings for this date
        // Not filtered by serviceId
        // ============================================
        const bookedSlots = await Booking.find({
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        }).select('timeSlot serviceName variantName');

        // Create a map of booked slots with details
        const bookedSlotMap = {};
        bookedSlots.forEach(booking => {
            bookedSlotMap[booking.timeSlot] = {
                serviceName: booking.serviceName,
                variantName: booking.variantName
            };
        });

        // For today, filter out past time slots
        const now = new Date();
        const isToday = bookingDate.toDateString() === now.toDateString();

        const slots = TIME_SLOTS.map(slot => {
            const [startTime] = slot.split('-');
            const [hours] = startTime.split(':');
            const slotHour = parseInt(hours);

            // Check if slot is booked
            const isBooked = bookedSlotMap[slot] !== undefined;

            // Check if slot is in the past (for today)
            let isPast = false;
            if (isToday) {
                const currentHour = now.getHours();
                // Add 1 hour buffer - can't book slots starting within the next hour
                if (slotHour <= currentHour + 1) {
                    isPast = true;
                }
            }

            // Determine availability and reason
            let available = true;
            let reason = null;
            let bookedBy = null;

            if (isPast) {
                available = false;
                reason = 'Past';
            } else if (isBooked) {
                available = false;
                reason = 'Booked';
                bookedBy = bookedSlotMap[slot].serviceName;
            }

            return {
                slot,
                available,
                reason,
                bookedBy
            };
        });

        const availableCount = slots.filter(s => s.available).length;

        res.status(200).json({
            success: true,
            data: {
                date,
                isAvailable: availableCount > 0,
                isClosed: false,
                message: availableCount === 0 ? 'All slots are booked for this date' : null,
                availableSlots: availableCount,
                totalSlots: slots.length,
                slots
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch availability',
            error: error.message
        });
    }
};

// ============================================
// GET FEATURED SERVICES
// ============================================
export const getFeaturedServices = async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        const limitNum = parseInt(limit) || 6;

        const services = await Service.find({
            isActive: true,
            isFeatured: true
        })
            .populate('category', 'name slug icon')
            .select('name shortDescription images startingPrice averageRating totalReviews tier')
            .sort({ displayOrder: 1 })
            .limit(limitNum);

        res.status(200).json({
            success: true,
            total: services.length,
            data: services.map(service => ({
                _id: service._id,
                name: service.name,
                shortDescription: service.shortDescription,
                category: service.category,
                tier: service.tier,
                primaryImage: service.primaryImage,
                startingPrice: service.startingPrice,
                averageRating: service.averageRating,
                totalReviews: service.totalReviews
            }))
        });

    } catch (error) {
        console.error('Get featured services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured services'
        });
    }
};

// ============================================
// GET AVAILABLE SLOTS FOR DATE (GLOBAL)
// ============================================
export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        const bookingDate = new Date(date);
        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check slots for past dates'
            });
        }

        // Check if Sunday
        if (bookingDate.getDay() === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isClosed: true,
                    message: 'We are closed on Sundays',
                    slots: []
                }
            });
        }

        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all booked slots for this date (GLOBAL)
        const bookedSlots = await Booking.find({
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        // For today, filter out past slots
        const now = new Date();
        const isToday = bookingDate.toDateString() === now.toDateString();

        const availableSlots = TIME_SLOTS.filter(slot => {
            // Check if already booked
            if (bookedSlotNames.includes(slot)) {
                return false;
            }

            // Check if past (for today)
            if (isToday) {
                const [startTime] = slot.split('-');
                const [hours] = startTime.split(':');
                const slotHour = parseInt(hours);
                const currentHour = now.getHours();

                if (slotHour <= currentHour + 1) {
                    return false;
                }
            }

            return true;
        });

        res.status(200).json({
            success: true,
            data: {
                date,
                isClosed: false,
                totalSlots: TIME_SLOTS.length,
                availableCount: availableSlots.length,
                bookedCount: TIME_SLOTS.length - availableSlots.length,
                slots: availableSlots
            }
        });

    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available slots'
        });
    }
};

export default {
    getActiveServices,
    getServiceDetails,
    getCategories,
    getServiceReviews,
    checkAvailability,
    getFeaturedServices,
    getAvailableSlots
};