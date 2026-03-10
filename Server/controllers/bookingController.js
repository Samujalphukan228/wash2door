// controllers/bookingController.js - FIXED: Added ObjectId validation

import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';

// ✅ FIXED: Helper to validate ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) &&
        /^[0-9a-fA-F]{24}$/.test(id);
};

// ============================================
// CREATE BOOKING
// ============================================

export const createBooking = async (req, res) => {
    try {
        const {
            serviceId,
            bookingDate,
            timeSlot,
            location,
            vehicleDetails,
            specialNotes,
            paymentMethod
        } = req.body;

        // ✅ FIXED: Validate required fields first
        if (!serviceId || !bookingDate || !timeSlot || !location || !vehicleDetails) {
            return res.status(400).json({
                success: false,
                message: 'Service, date, time slot, location and vehicle details are required'
            });
        }

        // ✅ FIXED: Validate serviceId format BEFORE querying DB
        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID format. Please select a valid service.'
            });
        }

        // ✅ FIXED: Validate location required fields
        if (!location.address || !location.city) {
            return res.status(400).json({
                success: false,
                message: 'Location address and city are required'
            });
        }

        // ✅ FIXED: Validate vehicleDetails required fields
        if (!vehicleDetails.type) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle type is required'
            });
        }

        // ✅ FIXED: Validate timeSlot value
        const validTimeSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ];

        if (!validTimeSlots.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Must be one of: ${validTimeSlots.join(', ')}`
            });
        }

        // Check if service exists and is active
        const service = await Service.findOne({ 
            _id: serviceId, 
            isActive: true 
        });

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not available'
            });
        }

        // Check if date is in the future
        const requestedDate = new Date(bookingDate);

        // ✅ FIXED: Validate date format
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking date format'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (requestedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Booking date must be in the future'
            });
        }

        // Check time slot availability
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBooking = await Booking.findOne({
            serviceId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            timeSlot,
            status: { $nin: ['cancelled'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked. Please choose another slot.'
            });
        }

        // Create booking
        const booking = await Booking.create({
            customerId: req.user._id,
            serviceId,
            bookingDate: requestedDate,
            timeSlot,
            location,
            vehicleDetails,
            price: service.price,
            specialNotes: specialNotes || '',
            paymentMethod: paymentMethod || 'cash'
        });

        // Update service total bookings
        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // Populate booking details
        const populatedBooking = await Booking.findById(booking._id)
            .populate('serviceId', 'name price duration')
            .populate('customerId', 'firstName lastName email');

        // Send confirmation email
        try {
            await sendBookingConfirmationEmail(req.user, populatedBooking);
        } catch (emailError) {
            console.error('Booking confirmation email failed:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: populatedBooking
        });

    } catch (error) {
        console.error('Create booking error:', error);

        // ✅ FIXED: Handle CastError specifically
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format provided'
            });
        }

        // Handle validation errors
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
            message: 'Failed to create booking',
            error: error.message
        });
    }
};

// ============================================
// GET MY BOOKINGS
// ============================================

export const getMyBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = { customerId: req.user._id };

        if (status) {
            const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
            }
            query.status = status;
        }

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('serviceId', 'name price duration category image')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            data: {
                bookings,
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum
            }
        });

    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE BOOKING
// ============================================

export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // ✅ FIXED: Validate bookingId format
        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id
        })
        .populate('serviceId', 'name price duration category image description')
        .populate('customerId', 'firstName lastName email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.status(200).json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// ============================================
// CANCEL BOOKING (BY USER)
// ============================================

export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        // ✅ FIXED: Validate bookingId format
        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID format'
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id
        }).populate('serviceId', 'name price');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Can only cancel pending or confirmed bookings
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a booking that is ${booking.status}`
            });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by user';
        booking.cancelledBy = 'user';
        booking.cancelledAt = new Date();
        await booking.save();

        // Send cancellation email
        try {
            await sendBookingCancellationEmail(req.user, booking);
        } catch (emailError) {
            console.error('Cancellation email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
};