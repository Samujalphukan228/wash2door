// controllers/adminController.js - FIXED: Added service validation

import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { sendBookingStatusEmail } from '../utils/sendEmail.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// DASHBOARD
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ 
            role: 'user',
            registrationStatus: 'completed' 
        });
        
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalBookings = await Booking.countDocuments();
        const totalServices = await Service.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            data: { totalUsers, totalAdmins, totalBookings, totalServices }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats'
        });
    }
};

// GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const total = await User.countDocuments({ 
            role: 'user', 
            registrationStatus: 'completed' 
        });

        const users = await User.find({ 
            role: 'user', 
            registrationStatus: 'completed' 
        })
            .select('-password -otp -refreshToken')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            data: { users, total, pages: Math.ceil(total / limitNum), currentPage: pageNum }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
};

// BLOCK USER
export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot block admin users' });
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
        res.status(500).json({ success: false, message: 'Error blocking user' });
    }
};

// UNBLOCK USER
export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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
        res.status(500).json({ success: false, message: 'Error unblocking user' });
    }
};

// CHANGE USER ROLE
export const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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
        res.status(500).json({ success: false, message: 'Error changing role' });
    }
};

// GET ALL SERVICES
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, total: services.length, data: services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
};

// CREATE SERVICE - FIXED: Added validation
export const createService = async (req, res) => {
    try {
        const { name, description, price, duration, category } = req.body;

        // ✅ FIXED: Validate required fields
        if (!name || !description || !price || !duration || !category) {
            return res.status(400).json({
                success: false,
                message: 'Name, description, price, duration and category are required'
            });
        }

        // ✅ FIXED: Validate category
        const validCategories = ['basic', 'premium', 'deluxe', 'interior', 'exterior', 'full-package'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
            });
        }

        // ✅ FIXED: Validate price
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price cannot be negative'
            });
        }

        const serviceData = { ...req.body, createdBy: req.user._id };
        const service = await Service.create(serviceData);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('Create service error:', error);

        // ✅ FIXED: Handle duplicate name error
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

        res.status(500).json({ success: false, message: 'Error creating service' });
    }
};

// UPDATE SERVICE
export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findByIdAndUpdate(
            serviceId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ success: false, message: 'Error updating service' });
    }
};

// DELETE SERVICE
export const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findByIdAndDelete(serviceId);

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({ success: true, message: 'Service deleted successfully' });

    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ success: false, message: 'Error deleting service' });
    }
};

// GET ALL BOOKINGS
export const getAllBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (status) query.status = status;

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('customerId', 'firstName lastName email')
            .populate('serviceId', 'name price')
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
        res.status(500).json({ success: false, message: 'Error fetching bookings' });
    }
};

// UPDATE BOOKING STATUS
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const updateData = { status };

        if (status === 'completed') updateData.completedAt = new Date();

        if (status === 'cancelled') {
            updateData.cancelledAt = new Date();
            updateData.cancelledBy = 'admin';
            updateData.cancellationReason = reason || 'Cancelled by admin';
        }

        const booking = await Booking.findByIdAndUpdate(bookingId, updateData, { new: true })
            .populate('customerId', 'firstName lastName email')
            .populate('serviceId', 'name price');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

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
        res.status(500).json({ success: false, message: 'Error updating booking status' });
    }
};

// REVENUE REPORT
export const getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchCondition = { status: 'completed' };

        if (startDate || endDate) {
            matchCondition.completedAt = {};
            if (startDate) matchCondition.completedAt.$gte = new Date(startDate);
            if (endDate) matchCondition.completedAt.$lte = new Date(endDate);
        }

        const revenueData = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
        const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);

        res.status(200).json({
            success: true,
            data: { totalRevenue, totalBookings, dailyData: revenueData }
        });

    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching revenue report' });
    }
};

// GET ALL REVIEWS
export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('customerId', 'firstName lastName email')
            .populate('serviceId', 'name')
            .populate('bookingId', 'bookingCode')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, total: reviews.length, data: reviews });

    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ success: false, message: 'Error fetching reviews' });
    }
};

// TOGGLE REVIEW VISIBILITY
export const toggleReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid review ID' });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
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
        res.status(500).json({ success: false, message: 'Error toggling review visibility' });
    }
};