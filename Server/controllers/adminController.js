// controllers/adminController.js - COMPLETE FIXED FILE

import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendBookingStatusEmail } from '../utils/sendEmail.js';
import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

const VALID_TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00',
    '11:00-12:00', '12:00-13:00', '13:00-14:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00'
];

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

        const [
            totalUsers,
            totalAdmins,
            totalBookings,
            totalServices,
            bookingsToday,
            pendingBookings,
            confirmedBookings,
            inProgressBookings,
            completedBookings,
            cancelledBookings,
            bookingsThisMonth
        ] = await Promise.all([
            User.countDocuments({ role: 'user', registrationStatus: 'completed' }),
            User.countDocuments({ role: 'admin' }),
            Booking.countDocuments(),
            Service.countDocuments({ isActive: true }),
            Booking.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.countDocuments({ status: 'in-progress' }),
            Booking.countDocuments({ status: 'completed' }),
            Booking.countDocuments({ status: 'cancelled' }),
            Booking.countDocuments({ createdAt: { $gte: thisMonthStart } })
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

        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customerId', 'firstName lastName email');

        const popularServices = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
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

        res.status(200).json({
            success: true,
            data: {
                users: { total: totalUsers, admins: totalAdmins },
                services: { total: totalServices },
                bookings: {
                    total: totalBookings,
                    today: bookingsToday,
                    thisMonth: bookingsThisMonth,
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
                    thisMonth: revenueThisMonth[0]?.total || 0
                },
                recentBookings,
                popularServices,
                bookingsByCategory
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
        const { page = 1, limit = 10, search, isBlocked } = req.query;

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

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select('-password -otp -refreshToken -passwordResetToken -emailVerificationToken')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            data: {
                users,
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
// GET SINGLE USER WITH BOOKINGS
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

        const bookings = await Booking.find({ customerId: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        const [totalBookings, completedBookings, cancelledBookings, totalSpent] = await Promise.all([
            Booking.countDocuments({ customerId: userId }),
            Booking.countDocuments({ customerId: userId, status: 'completed' }),
            Booking.countDocuments({ customerId: userId, status: 'cancelled' }),
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

        const reviews = await Review.find({ customerId: userId })
            .populate('serviceId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: {
                    totalBookings,
                    completedBookings,
                    cancelledBookings,
                    totalSpent: totalSpent[0]?.total || 0
                },
                recentBookings: bookings,
                recentReviews: reviews
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
        await user.save({ validateBeforeSave: false });

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
// GET ALL SERVICES (ADMIN)
// ============================================

export const getAllServices = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, isActive } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const total = await Service.countDocuments(query);

        const services = await Service.find(query)
            .populate('category', 'name slug')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: services
        });

    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching services',
            error: error.message
        });
    }
};

// ============================================
// CREATE SERVICE
// ============================================

export const createService = async (req, res) => {
    try {
        const { name, description, category, tier, variants } = req.body;

        if (!name || !description || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, description and category are required'
            });
        }

        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one variant is required'
            });
        }

        const serviceData = {
            ...req.body,
            createdBy: req.user._id
        };

        const service = await Service.create(serviceData);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('Create service error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this name already exists'
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
            message: 'Error creating service',
            error: error.message
        });
    }
};

// ============================================
// UPDATE SERVICE
// ============================================

export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findByIdAndUpdate(
            serviceId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

// ============================================
// DELETE SERVICE
// ============================================

export const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findByIdAndDelete(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
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
            bookingType
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};

        if (status) {
            const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
            if (validStatuses.includes(status)) {
                query.status = status;
            }
        }

        if (categoryName) {
            query.categoryName = { $regex: categoryName, $options: 'i' };
        }

        if (bookingType) {
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
                { 'walkInCustomer.name': { $regex: search, $options: 'i' } },
                { 'walkInCustomer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('customerId', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 })
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

        const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be: ${validStatuses.join(', ')}`
            });
        }

        const updateData = { status };

        if (status === 'completed') {
            updateData.completedAt = new Date();
            updateData.paymentStatus = 'completed';
        }

        if (status === 'cancelled') {
            updateData.cancelledAt = new Date();
            updateData.cancelledBy = 'admin';
            updateData.cancellationReason = reason || 'Cancelled by admin';
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        ).populate('customerId', 'firstName lastName email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Socket events
        try {
            const io = getIO();

            const socketPayload = {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                status: booking.status,
                serviceName: booking.serviceName,
                variantName: booking.variantName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                updatedAt: new Date()
            };

            if (booking.customerId) {
                io.to(`user_${booking.customerId._id}`).emit(
                    SOCKET_EVENTS.BOOKING_STATUS_UPDATED,
                    socketPayload
                );
            }

            io.to('admin_room').emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, socketPayload);

            if (status === 'cancelled') {
                io.emit(SOCKET_EVENTS.SLOT_AVAILABLE, {
                    serviceId: booking.serviceId,
                    bookingDate: booking.bookingDate,
                    timeSlot: booking.timeSlot
                });
            }
        } catch (socketError) {
            console.error('Socket emit error:', socketError.message);
        }

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
// CREATE ADMIN BOOKING
// ============================================

export const createAdminBooking = async (req, res) => {
    try {
        const {
            bookingType,
            customerId,
            walkInCustomer,
            serviceId,
            variantId,
            bookingDate,
            timeSlot,
            specialNotes,
            paymentMethod,
            paymentStatus,
            location
        } = req.body;

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
        }).populate('category', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not active'
            });
        }

        // Validate variant
        if (!variantId) {
            return res.status(400).json({
                success: false,
                message: 'Variant ID is required'
            });
        }

        const selectedVariant = service.variants.id(variantId);

        if (!selectedVariant) {
            return res.status(404).json({
                success: false,
                message: 'Variant not found in this service'
            });
        }

        if (!selectedVariant.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This variant is currently not available'
            });
        }

        // Validate date and time
        if (!bookingDate || !timeSlot) {
            return res.status(400).json({
                success: false,
                message: 'Booking date and time slot are required'
            });
        }

        const requestedDate = new Date(bookingDate);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        if (requestedDate.getDay() === 0) {
            return res.status(400).json({
                success: false,
                message: 'We are closed on Sundays'
            });
        }

        if (!VALID_TIME_SLOTS.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time slot'
            });
        }

        // Check slot availability
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const slotTaken = await Booking.findOne({
            serviceId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            timeSlot,
            status: { $nin: ['cancelled'] }
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} is already booked`
            });
        }

        // Calculate price
        const finalPrice = selectedVariant.discountPrice ?? selectedVariant.price;

        // Set location
        const bookingLocation = {
            address: location?.address || 'Walk-in / At Shop',
            city: location?.city || 'Walk-in',
            landmark: location?.landmark || ''
        };

        // Create booking
        const booking = await Booking.create({
            bookingType,
            customerId: bookingType === 'online' ? customerId : null,
            walkInCustomer: bookingType === 'walkin'
                ? { name: walkInCustomer.name, phone: walkInCustomer.phone || '' }
                : { name: '', phone: '' },
            categoryId: service.category._id,
            categoryName: service.category.name,
            serviceId: service._id,
            serviceName: service.name,
            serviceTier: service.tier,
            variantId: selectedVariant._id,
            variantName: selectedVariant.name,
            price: finalPrice,
            duration: selectedVariant.duration,
            bookingDate: requestedDate,
            timeSlot,
            location: bookingLocation,
            specialNotes: specialNotes || '',
            paymentMethod: paymentMethod || 'cash',
            paymentStatus: paymentStatus || 'pending',
            createdBy: req.user._id,
            status: 'confirmed'
        });

        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // Socket events
        try {
            const io = getIO();
            const customerName = bookingType === 'walkin'
                ? walkInCustomer.name
                : `Customer ${customerId}`;

            io.to('admin_room').emit(SOCKET_EVENTS.NEW_BOOKING, {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                bookingType: booking.bookingType,
                customerName,
                serviceName: booking.serviceName,
                variantName: booking.variantName,
                categoryName: booking.categoryName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                price: booking.price,
                status: booking.status,
                createdAt: booking.createdAt
            });

            io.emit(SOCKET_EVENTS.SLOT_BOOKED, {
                serviceId: booking.serviceId,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot
            });

            if (bookingType === 'online' && customerId) {
                io.to(`user_${customerId}`).emit(
                    SOCKET_EVENTS.BOOKING_STATUS_UPDATED,
                    {
                        bookingId: booking._id,
                        bookingCode: booking.bookingCode,
                        status: booking.status,
                        serviceName: booking.serviceName,
                        bookingDate: booking.bookingDate,
                        timeSlot: booking.timeSlot
                    }
                );
            }
        } catch (socketError) {
            console.error('Socket emit error:', socketError.message);
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
                message: 'This time slot was just booked'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
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
                    bookings: { $sum: 1 }
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

        const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
        const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                totalBookings,
                averageOrderValue: totalBookings > 0
                    ? Math.round(totalRevenue / totalBookings)
                    : 0,
                revenueData,
                revenueByCategory,
                revenueByVariant,
                revenueByCity
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
// GET ALL REVIEWS (ADMIN)
// ============================================

export const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, isVisible, serviceId } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (isVisible !== undefined) query.isVisible = isVisible === 'true';
        if (serviceId && isValidObjectId(serviceId)) query.serviceId = serviceId;

        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('customerId', 'firstName lastName email')
            .populate('serviceId', 'name category')
            .populate('bookingId', 'bookingCode')
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
            { $sort: { count: -1 } }
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

        res.status(200).json({
            success: true,
            data: {
                byStatus,
                byVariant,
                byService,
                byTimeSlot,
                byCity,
                byBookingType
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