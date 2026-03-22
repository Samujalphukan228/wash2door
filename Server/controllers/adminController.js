// controllers/adminController.js - COMPLETE with GLOBAL SLOT BOOKING

import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendBookingStatusEmail } from '../utils/sendEmail.js';
import {
    TIME_SLOTS,
    BOOKING_STATUSES,
    isValidTimeSlot,
    isClosedDay
} from '../utils/constants.js';
import {
    emitNewBooking,
    emitBookingStatusUpdate,
    emitUserBlocked
} from '../utils/socketEmitter.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        const [
            totalUsers,
            totalAdmins,
            newUsersThisMonth,
            totalBookings,
            totalServices,
            activeServices,
            bookingsToday,
            pendingBookings,
            confirmedBookings,
            inProgressBookings,
            completedBookings,
            cancelledBookings,
            bookingsThisMonth,
            bookingsLastMonth
        ] = await Promise.all([
            User.countDocuments({ role: 'user', registrationStatus: 'completed' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({
                role: 'user',
                registrationStatus: 'completed',
                createdAt: { $gte: thisMonthStart }
            }),
            Booking.countDocuments(),
            Service.countDocuments(),
            Service.countDocuments({ isActive: true }),
            Booking.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.countDocuments({ status: 'in-progress' }),
            Booking.countDocuments({ status: 'completed' }),
            Booking.countDocuments({ status: 'cancelled' }),
            Booking.countDocuments({ createdAt: { $gte: thisMonthStart } }),
            Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } })
        ]);

        const revenueThisMonth = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    completedAt: { $gte: thisMonthStart }
                }
            },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const revenueLastMonth = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    completedAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
                }
            },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customerId', 'firstName lastName email avatar');

        const popularServices = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    categoryName: { $first: '$categoryName' },
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$price' }
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: 5 }
        ]);

        const bookingsByCategory = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$categoryName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const bookingsByTimeSlot = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$timeSlot',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // ← WEEKLY DATA (last 7 days)
        const weeklyData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    day: '$_id',
                    revenue: 1,
                    bookings: 1
                }
            }
        ]);

        // Upcoming bookings for today
        const upcomingToday = await Booking.find({
            bookingDate: { $gte: today, $lte: todayEnd },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate('customerId', 'firstName lastName email')
            .sort({ timeSlot: 1 })
            .limit(10);

        // ← DEBUG LOG
        console.log('🔍 DEBUG - Dashboard Stats:', {
            weeklyDataCount: weeklyData?.length,
            weeklyDataSample: weeklyData?.slice(0, 2),
            bookingsByCategories: bookingsByCategory?.length,
            totalBookingsInDB: totalBookings,
            last7DaysBookings: await Booking.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            sampleBooking: await Booking.findOne().select('bookingCode price createdAt bookingDate status')
        });

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    newThisMonth: newUsersThisMonth
                },
                services: {
                    total: totalServices,
                    active: activeServices
                },
                bookings: {
                    total: totalBookings,
                    today: bookingsToday,
                    thisMonth: bookingsThisMonth,
                    lastMonth: bookingsLastMonth,
                    growth: bookingsLastMonth > 0
                        ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100)
                        : 100,
                    byStatus: {
                        pending: pendingBookings,
                        confirmed: confirmedBookings,
                        inProgress: inProgressBookings,
                        completed: completedBookings,
                        cancelled: cancelledBookings
                    }
                },
                revenue: {
                    total: totalRevenue[0]?.total || 0,
                    thisMonth: revenueThisMonth[0]?.total || 0,
                    lastMonth: revenueLastMonth[0]?.total || 0,
                    growth: (revenueLastMonth[0]?.total || 0) > 0
                        ? Math.round((((revenueThisMonth[0]?.total || 0) - (revenueLastMonth[0]?.total || 0)) / (revenueLastMonth[0]?.total || 1)) * 100)
                        : 100
                },
                recentBookings,
                upcomingToday,
                popularServices,
                bookingsByCategory,
                bookingsByTimeSlot,
                weeklyData  // ← RETURN THIS
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// ============================================
// GET ALL USERS
// ============================================

export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            isBlocked,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = { role: 'user', registrationStatus: 'completed' };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isBlocked !== undefined) {
            query.isBlocked = isBlocked === 'true';
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select('-password -otp -refreshToken -passwordResetToken -emailVerificationToken')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        // Add booking stats for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const bookingCount = await Booking.countDocuments({ customerId: user._id });
                const completedCount = await Booking.countDocuments({
                    customerId: user._id,
                    status: 'completed'
                });

                return {
                    ...user.toObject(),
                    totalBookings: bookingCount,
                    completedBookings: completedCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                users: usersWithStats,
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE USER WITH DETAILS
// ============================================

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId)
            .select('-password -otp -refreshToken -passwordResetToken -emailVerificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [totalBookings, completedBookings, cancelledBookings, pendingBookings, totalSpent] = await Promise.all([
            Booking.countDocuments({ customerId: userId }),
            Booking.countDocuments({ customerId: userId, status: 'completed' }),
            Booking.countDocuments({ customerId: userId, status: 'cancelled' }),
            Booking.countDocuments({ customerId: userId, status: { $in: ['pending', 'confirmed'] } }),
            Booking.aggregate([
                {
                    $match: {
                        customerId: new mongoose.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ])
        ]);

        const recentBookings = await Booking.find({ customerId: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        const reviews = await Review.find({ customerId: userId })
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        const favoriteServices = await Booking.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(userId),
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: {
                    totalBookings,
                    completedBookings,
                    cancelledBookings,
                    pendingBookings,
                    totalSpent: totalSpent[0]?.total || 0,
                    completionRate: totalBookings > 0
                        ? Math.round((completedBookings / totalBookings) * 100)
                        : 0
                },
                recentBookings,
                reviews,
                favoriteServices
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// ============================================
// BLOCK USER
// ============================================

export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot block admin users'
            });
        }

        if (user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: 'User is already blocked'
            });
        }

        user.isBlocked = true;
        user.blockedReason = reason || 'No reason provided';
        user.blockedAt = new Date();
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        // Force logout via socket
        emitUserBlocked(userId, user.blockedReason);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: 'User blocked successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error blocking user',
            error: error.message
        });
    }
};

// ============================================
// UNBLOCK USER
// ============================================

export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.isBlocked) {
            return res.status(400).json({
                success: false,
                message: 'User is not blocked'
            });
        }

        user.isBlocked = false;
        user.blockedReason = undefined;
        user.blockedAt = undefined;
        await user.save({ validateBeforeSave: false });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: 'User unblocked successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error unblocking user',
            error: error.message
        });
    }
};

// ============================================
// CHANGE USER ROLE
// ============================================

export const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Must be "user" or "admin"'
            });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === role) {
            return res.status(400).json({
                success: false,
                message: `User is already a ${role}`
            });
        }

        user.role = role;
        await user.save({ validateBeforeSave: false });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: `User role changed to ${role}`,
            data: userResponse
        });

    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing role',
            error: error.message
        });
    }
};

// ============================================
// GET ALL BOOKINGS (ADMIN)
// ============================================

export const getAllBookings = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            date,
            city,
            search,
            categoryName,
            startDate,
            endDate,
            bookingType,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};

        if (status && BOOKING_STATUSES.includes(status)) {
            query.status = status;
        }

        if (categoryName) {
            query.categoryName = { $regex: categoryName, $options: 'i' };
        }

        if (bookingType && ['online', 'walkin'].includes(bookingType)) {
            query.bookingType = bookingType;
        }

        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        if (date) {
            const bookingDate = new Date(date);
            const startOfDay = new Date(bookingDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(bookingDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: 'i' } },
                { serviceName: { $regex: search, $options: 'i' } },
                { variantName: { $regex: search, $options: 'i' } },
                { 'walkInCustomer.name': { $regex: search, $options: 'i' } },
                { 'walkInCustomer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('customerId', 'firstName lastName email avatar')
            .populate('createdBy', 'firstName lastName')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE BOOKING (ADMIN)
// ============================================

export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('customerId', 'firstName lastName email avatar phone')
            .populate('createdBy', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get customer's booking history if online booking
        let customerHistory = null;
        if (booking.customerId) {
            customerHistory = await Booking.find({
                customerId: booking.customerId._id,
                _id: { $ne: bookingId }
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('bookingCode serviceName status bookingDate price');
        }

        res.status(200).json({
            success: true,
            data: {
                booking,
                customerHistory
            }
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking',
            error: error.message
        });
    }
};

// ============================================
// UPDATE BOOKING STATUS
// ============================================

export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        if (!BOOKING_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be: ${BOOKING_STATUSES.join(', ')}`
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('customerId', 'firstName lastName email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['in-progress', 'cancelled'],
            'in-progress': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from "${booking.status}" to "${status}"`
            });
        }

        // Update booking
        booking.status = status;

        if (status === 'completed') {
            booking.completedAt = new Date();
            booking.paymentStatus = 'completed';
        }

        if (status === 'cancelled') {
            booking.cancelledAt = new Date();
            booking.cancelledBy = 'admin';
            booking.cancellationReason = reason || 'Cancelled by admin';
        }

        await booking.save();

        // Socket events
        emitBookingStatusUpdate(booking, booking.customerId?._id);

        // Send email
        try {
            if (booking.customerId?.email) {
                await sendBookingStatusEmail(booking.customerId, booking);
            }
        } catch (emailError) {
            console.error('Status email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: booking
        });

    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating booking status',
            error: error.message
        });
    }
};

// ============================================
// CREATE ADMIN BOOKING - ✅ SAME AS USER BOOKING (NO VARIANT SELECTION)
// ============================================

export const createAdminBooking = async (req, res) => {
    try {
        const {
            bookingType,
            customerId,
            walkInCustomer,
            serviceId,
            bookingDate,
            timeSlot,
            location,
            specialNotes,
            paymentMethod,
            paymentStatus
        } = req.body;

        console.log('📥 Admin booking request:', {
            bookingType,
            serviceId,
            bookingDate,
            timeSlot
        });

        // Validate booking type
        if (!bookingType || !['walkin', 'online'].includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: 'bookingType must be "walkin" or "online"'
            });
        }

        // Validate customer
        if (bookingType === 'walkin') {
            if (!walkInCustomer?.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Walk-in customer name is required'
                });
            }
        }

        if (bookingType === 'online') {
            if (!customerId || !isValidObjectId(customerId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid customer ID is required for online booking'
                });
            }

            const customerExists = await User.findById(customerId);
            if (!customerExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }
        }

        // Validate service
        if (!serviceId || !isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid service ID is required'
            });
        }

        const service = await Service.findOne({
            _id: serviceId,
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not active'
            });
        }

        console.log('📦 Service found:', {
            name: service.name,
            hasCategory: !!service.category,
            hasSubcategory: !!service.subcategory,
            variantsCount: service.variants?.length || 0
        });

        // ✅ Check category and subcategory
        if (!service.category || !service.category._id) {
            return res.status(400).json({
                success: false,
                message: 'This service is missing a category assignment'
            });
        }

        if (!service.subcategory || !service.subcategory._id) {
            return res.status(400).json({
                success: false,
                message: 'This service is missing a subcategory assignment'
            });
        }

        // ============================================
        // ✅ AUTO-SELECT VARIANT OR USE SERVICE PRICE (SAME AS USER BOOKING)
        // ============================================
        let finalPrice = 0;
        let duration = 60;
        let variantId = null;
        let variantName = null;

        const hasVariants = service.variants && service.variants.length > 0;

        if (hasVariants) {
            // Auto-select first active variant
            const activeVariants = service.variants.filter(v => v.isActive);
            
            if (activeVariants.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This service has no available variants at the moment'
                });
            }

            const selectedVariant = activeVariants[0];
            finalPrice = selectedVariant.discountPrice ?? selectedVariant.price;
            duration = selectedVariant.duration;
            variantId = selectedVariant._id;
            variantName = selectedVariant.name;

            console.log(`📌 Auto-selected variant: ${variantName}`);

        } else {
            // Use service-level pricing
            finalPrice = service.discountPrice ?? service.price ?? 0;
            duration = service.duration ?? 60;
            variantId = null;
            variantName = null;

            if (!finalPrice || finalPrice === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This service has no price configured'
                });
            }

            console.log('📌 No variants - using service-level pricing');
        }

        // Validate date and time
        if (!bookingDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Booking date and time slot are required'
            });
        }

        // ✅ Parse date from local string
        const [year, month, day] = bookingDate.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        // ✅ Helper function for local date string
        const getLocalDateStr = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (bookingDate < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Booking date cannot be in the past'
            });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({
                success: false,
                message: 'We are closed on Sundays'
            });
        }

        if (!isValidTimeSlot(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${TIME_SLOTS.join(', ')}`
            });
        }

        // ✅ Check if slot time has passed today
        const isToday = bookingDate === todayStr;
        if (isToday) {
            const [startTime] = timeSlot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);
            if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot has already passed for today'
                });
            }
        }

        // ✅ GLOBAL SLOT CHECK - Exclude cancelled bookings
        const slotLockKey = `${bookingDate}|${timeSlot}`;

        const slotTaken = await Booking.findOne({
            slotLockKey,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} is already booked for "${slotTaken.serviceName}". Please choose another slot.`
            });
        }

        // Set location
        const bookingLocation = {
            address: location?.address || 'Walk-in / At Shop',
            city: location?.city || 'Walk-in',
            landmark: location?.landmark || ''
        };

        console.log(`📦 Creating booking: ${service.name} ${variantName ? `(${variantName})` : '(No variant)'}`);
        console.log(`💰 Price: ₹${finalPrice}, ⏱️ Duration: ${duration} min`);

        // Create booking
        const booking = await Booking.create({
            bookingType,
            customerId: bookingType === 'online' ? customerId : null,
            walkInCustomer: bookingType === 'walkin'
                ? { name: walkInCustomer.name, phone: walkInCustomer.phone || '' }
                : { name: '', phone: '' },
            categoryId: service.category._id,
            categoryName: service.category.name,
            subcategoryId: service.subcategory._id,
            subcategoryName: service.subcategory.name,
            serviceId: service._id,
            serviceName: service.name,
            serviceTier: service.tier || 'basic',
            variantId: variantId,
            variantName: variantName,
            price: finalPrice,
            duration: duration,
            bookingDate: requestedDate,
            timeSlot,
            location: bookingLocation,
            specialNotes: specialNotes || '',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: paymentStatus || 'pending',
            createdBy: req.user._id,
            status: 'confirmed'
        });

        console.log('✅ Booking created:', booking.bookingCode);

        // Update service booking count
        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // Socket events
        const customerName = bookingType === 'walkin'
            ? walkInCustomer.name
            : 'Online Customer';

        emitNewBooking(booking, customerName);

        // Notify customer if online booking
        if (bookingType === 'online' && customerId) {
            emitBookingStatusUpdate(booking, customerId);
        }

        res.status(201).json({
            success: true,
            message: `${bookingType === 'walkin' ? 'Walk-in' : 'Online'} booking created!`,
            data: {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                bookingType: booking.bookingType,
                customer: bookingType === 'walkin'
                    ? booking.walkInCustomer
                    : { customerId },
                categoryName: booking.categoryName,
                subcategoryName: booking.subcategoryName,
                serviceName: booking.serviceName,
                variantName: booking.variantName,
                price: booking.price,
                duration: booking.duration,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                location: booking.location,
                status: booking.status,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus
            }
        });

    } catch (error) {
        console.error('Admin create booking error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot was just booked by someone else. Please choose another slot.'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
};

// ============================================
// REVENUE REPORT
// ============================================

export const getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const matchCondition = { status: 'completed' };

        if (startDate || endDate) {
            matchCondition.completedAt = {};
            if (startDate) matchCondition.completedAt.$gte = new Date(startDate);
            if (endDate) matchCondition.completedAt.$lte = new Date(endDate);
        }

        const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        const revenueData = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$completedAt' } },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 },
                    avgOrderValue: { $avg: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const revenueByCategory = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$categoryName',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const revenueByService = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const revenueByVariant = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$variantName',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const revenueByCity = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$location.city',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const revenueByPaymentMethod = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
        const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalBookings,
                    averageOrderValue: totalBookings > 0
                        ? Math.round(totalRevenue / totalBookings)
                        : 0
                },
                revenueData,
                revenueByCategory,
                revenueByService,
                revenueByVariant,
                revenueByCity,
                revenueByPaymentMethod
            }
        });

    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching revenue report',
            error: error.message
        });
    }
};

// ============================================
// BOOKING REPORT
// ============================================

export const getBookingReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchCondition = {};

        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
            if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
        }

        const byStatus = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byVariant = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$variantName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const byService = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const byTimeSlot = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const byCity = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const byBookingType = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$bookingType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            }
        ]);

        const byDayOfWeek = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dayOfWeek: '$bookingDate' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const byDayOfWeekNamed = byDayOfWeek.map(d => ({
            day: dayNames[d._id],
            count: d.count
        }));

        res.status(200).json({
            success: true,
            data: {
                byStatus,
                byVariant,
                byService,
                byTimeSlot,
                byCity,
                byBookingType,
                byDayOfWeek: byDayOfWeekNamed
            }
        });

    } catch (error) {
        console.error('Booking report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booking report',
            error: error.message
        });
    }
};

// ============================================
// GET ALL REVIEWS (ADMIN)
// ============================================

export const getAllReviews = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            isVisible,
            serviceId,
            rating,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (isVisible !== undefined) query.isVisible = isVisible === 'true';
        if (serviceId && isValidObjectId(serviceId)) query.serviceId = serviceId;
        if (rating) query.rating = parseInt(rating);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('customerId', 'firstName lastName email avatar')
            .populate('serviceId', 'name category')
            .populate('bookingId', 'bookingCode bookingDate')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const ratingStats = await Review.aggregate([
            { $match: query },
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
        console.error('Get reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// ============================================
// TOGGLE REVIEW VISIBILITY
// ============================================

export const toggleReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        review.isVisible = !review.isVisible;
        await review.save();

        res.status(200).json({
            success: true,
            message: `Review ${review.isVisible ? 'shown' : 'hidden'} successfully`,
            data: review
        });

    } catch (error) {
        console.error('Toggle review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling review visibility',
            error: error.message
        });
    }
};

export default {
    getDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    changeUserRole,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    createAdminBooking,
    getRevenueReport,
    getBookingReport,
    getAllReviews,
    toggleReviewVisibility
};