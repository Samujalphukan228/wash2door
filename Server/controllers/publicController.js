import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { TIME_SLOTS } from '../utils/constants.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

const getLocalDateStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: error.message
        });
    }
};

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
                relatedServices
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service details',
            error: error.message
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories'
        });
    }
};

export const checkAvailability = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date'
            });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check availability for past dates'
            });
        }

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

        const bookedSlots = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('timeSlot serviceName');

        const bookedSlotMap = {};
        bookedSlots.forEach(booking => {
            bookedSlotMap[booking.timeSlot] = {
                serviceName: booking.serviceName
            };
        });

        const isToday = date === todayStr;

        const slots = TIME_SLOTS.map(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);

            const isBooked = bookedSlotMap[slot] !== undefined;

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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch availability',
            error: error.message
        });
    }
};

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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured services'
        });
    }
};

export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (date < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check slots for past dates'
            });
        }

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

        const bookedSlots = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        const isToday = date === todayStr;

        const availableSlots = TIME_SLOTS.filter(slot => {
            if (bookedSlotNames.includes(slot)) return false;

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
    checkAvailability,
    getFeaturedServices,
    getAvailableSlots
};