// controllers/publicController.js

import Service from '../models/Service.js';
import Review from '../models/Review.js';

// ============================================
// GET ALL ACTIVE SERVICES (PUBLIC)
// ============================================

export const getActiveServices = async (req, res) => {
    try {
        const { category, sort, search } = req.query;

        const query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };

        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { averageRating: -1 };
        if (sort === 'popular') sortOption = { totalBookings: -1 };

        const services = await Service.find(query)
            .select('name description shortDescription price duration category image features averageRating totalReviews')
            .sort(sortOption);

        res.status(200).json({
            success: true,
            total: services.length,
            data: services
        });

    } catch (error) {
        console.error('Get active services error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services'
        });
    }
};

// ============================================
// GET SINGLE SERVICE DETAILS (PUBLIC)
// ============================================

export const getServiceDetails = async (req, res) => {
    try {
        const { serviceId } = req.params;

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

        // Get reviews for this service
        const reviews = await Review.find({
            serviceId: serviceId,
            isVisible: true
        })
        .populate('customerId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(10);

        res.status(200).json({
            success: true,
            data: {
                service,
                reviews
            }
        });

    } catch (error) {
        console.error('Get service details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch service details'
        });
    }
};

// ============================================
// GET ALL CATEGORIES (PUBLIC)
// ============================================

export const getCategories = async (req, res) => {
    try {
        const categories = await Service.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// ============================================
// GET SERVICE REVIEWS (PUBLIC)
// ============================================

export const getServiceReviews = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const total = await Review.countDocuments({
            serviceId,
            isVisible: true
        });

        const reviews = await Review.find({
            serviceId,
            isVisible: true
        })
        .populate('customerId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        res.status(200).json({
            success: true,
            data: {
                reviews,
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get service reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// ============================================
// CHECK TIME SLOT AVAILABILITY (PUBLIC)
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

        const bookingDate = new Date(date);
        bookingDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const allSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ];

        // Find booked slots for this date
        const Booking = (await import('../models/Booking.js')).default;
        
        const bookedSlots = await Booking.find({
            serviceId,
            bookingDate: { $gte: bookingDate, $lt: nextDay },
            status: { $nin: ['cancelled'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        const availableSlots = allSlots.map(slot => ({
            slot,
            available: !bookedSlotNames.includes(slot)
        }));

        res.status(200).json({
            success: true,
            data: {
                date: date,
                slots: availableSlots
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability'
        });
    }
};