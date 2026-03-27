// controllers/publicController.js - COMPLETE FIXED VERSION

import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { TIME_SLOTS } from '../utils/constants.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// 🔥 Helper: Get consistent YYYY-MM-DD string from Date
const getLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================
// GET ALL ACTIVE SERVICES - WITH PAGINATION
// ============================================
export const getActiveServices = async (req, res) => {
    try {
        const {
            category,
            subcategory,
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

        if (subcategory && isValidObjectId(subcategory)) {
            query.subcategory = subcategory;
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
            .populate('subcategory', 'name slug icon')
            .select('name shortDescription category subcategory tier images highlights features price discountPrice duration averageRating totalReviews totalBookings displayOrder isFeatured')
            .sort(sortOption)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const formattedServices = services.map(service => ({
            _id: service._id,
            name: service.name,
            shortDescription: service.shortDescription,
            category: service.category,
            subcategory: service.subcategory,
            tier: service.tier,
            primaryImage: service.primaryImage,
            images: service.images,
            highlights: service.highlights,
            features: service.features,
            price: service.price,
            discountPrice: service.discountPrice,
            finalPrice: service.finalPrice,
            duration: service.duration,
            averageRating: service.averageRating,
            totalReviews: service.totalReviews,
            totalBookings: service.totalBookings,
            isFeatured: service.isFeatured,
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
            .populate('subcategory', 'name slug icon image')
            .select('-createdBy');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

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

        const relatedServices = await Service.find({
            category: service.category._id,
            _id: { $ne: serviceId },
            isActive: true
        })
            .populate('subcategory', 'name slug icon')
            .select('name shortDescription images price discountPrice duration averageRating tier subcategory')
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
                    subcategory: service.subcategory,
                    tier: service.tier,
                    images: service.images,
                    primaryImage: service.primaryImage,
                    highlights: service.highlights,
                    includes: service.includes,
                    excludes: service.excludes,
                    price: service.price,
                    discountPrice: service.discountPrice,
                    finalPrice: service.finalPrice,
                    duration: service.duration,
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
            .select('name slug icon image description displayOrder totalSubcategories totalServices')
            .sort({ displayOrder: 1, createdAt: -1 })
            .lean();

        let result = categories;

        if (withServiceCount === 'true') {
            result = await Promise.all(
                categories.map(async (cat) => {
                    const serviceCount = await Service.countDocuments({
                        category: cat._id,
                        isActive: true
                    });
                    const subcategoryCount = await Subcategory.countDocuments({
                        category: cat._id,
                        isActive: true
                    });
                    return {
                        ...cat,
                        totalServices: serviceCount,
                        totalSubcategories: subcategoryCount
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
// GET SUBCATEGORIES BY CATEGORY
// ============================================
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const category = await Category.findById(categoryId)
            .select('name slug icon')
            .lean();

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const subcategories = await Subcategory.find({
            category: categoryId,
            isActive: true
        })
            .select('_id name slug icon description image totalServices category displayOrder')
            .sort({ displayOrder: 1 })
            .lean();

        const result = await Promise.all(
            subcategories.map(async (sub) => {
                const serviceCount = await Service.countDocuments({
                    subcategory: sub._id,
                    isActive: true
                });
                return {
                    ...sub,
                    category: {
                        _id: category._id,
                        name: category.name,
                        icon: category.icon
                    },
                    totalServices: serviceCount
                };
            })
        );

        res.status(200).json({
            success: true,
            total: result.length,
            data: result
        });

    } catch (error) {
        console.error('getSubcategoriesByCategory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories'
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

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('customerId', 'firstName lastName avatar')
            .sort(sortOption)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

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
// 🔥 CHECK AVAILABILITY (FIXED - USES slotLockKey)
// ============================================
export const checkAvailability = async (req, res) => {
    try {
        const { date } = req.query;

        // ✅ Validate date parameter
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // ✅ Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // ✅ Parse date correctly (avoid timezone issues)
        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date'
            });
        }

        // ✅ Get today's date string for comparison
        const now = new Date();
        const todayStr = getLocalDateStr(now);

        // ✅ Check if date is in the past
        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check availability for past dates'
            });
        }

        // ✅ Check if Sunday (closed)
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

        // ============================================
        // 🔥 CRITICAL FIX: Use slotLockKey instead of date range
        // slotLockKey format: "YYYY-MM-DD|HH:MM-HH:MM"
        // ============================================
        const bookedSlots = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('timeSlot serviceName');

        // ✅ Build booked slot map
        const bookedSlotMap = {};
        bookedSlots.forEach(booking => {
            bookedSlotMap[booking.timeSlot] = {
                serviceName: booking.serviceName
            };
        });

        // ✅ Check if today for past-time filtering
        const isToday = date === todayStr;

        // ✅ Build slots array with availability
        const slots = TIME_SLOTS.map(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);

            const isBooked = bookedSlotMap[slot] !== undefined;

            // Check if slot time has passed (for today only)
            let isPast = false;
            if (isToday) {
                const slotDateTime = new Date(year, month - 1, day, hours, minutes || 0, 0, 0);
                isPast = now.getTime() >= slotDateTime.getTime();
            }

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

            return { slot, available, reason, bookedBy };
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
            .populate('subcategory', 'name slug icon')
            .select('name shortDescription images price discountPrice duration averageRating totalReviews tier subcategory')
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
                subcategory: service.subcategory,
                tier: service.tier,
                primaryImage: service.primaryImage,
                price: service.price,
                discountPrice: service.discountPrice,
                finalPrice: service.finalPrice,
                duration: service.duration,
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
// 🔥 GET AVAILABLE SLOTS (FIXED - USES slotLockKey)
// ============================================
export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;

        // ✅ Validate date parameter
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // ✅ Validate date format (YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // ✅ Parse date correctly (avoid timezone issues)
        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        // ✅ Get today's date string for comparison
        const now = new Date();
        const todayStr = getLocalDateStr(now);

        // ✅ Check if date is in the past
        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check slots for past dates'
            });
        }

        // ✅ Check if Sunday (closed)
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

        // ============================================
        // 🔥 CRITICAL FIX: Use slotLockKey instead of date range
        // slotLockKey format: "YYYY-MM-DD|HH:MM-HH:MM"
        // ============================================
        const bookedSlots = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        // ✅ Check if today for past-time filtering
        const isToday = date === todayStr;

        // ✅ Filter available slots
        const availableSlots = TIME_SLOTS.filter(slot => {
            // Check if already booked
            if (bookedSlotNames.includes(slot)) return false;

            // Check if time has passed (for today only)
            if (isToday) {
                const [startTime] = slot.split('-');
                const [hours, minutes] = startTime.split(':').map(Number);
                const slotDateTime = new Date(year, month - 1, day, hours, minutes || 0, 0, 0);
                if (now.getTime() >= slotDateTime.getTime()) return false;
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
    getSubcategoriesByCategory,
    getServiceReviews,
    checkAvailability,
    getFeaturedServices,
    getAvailableSlots
};