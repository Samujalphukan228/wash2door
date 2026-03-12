// controllers/bookingController.js - SIMPLIFIED & FIXED

import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import { getIO } from '../config/socket.js';
import { SOCKET_EVENTS } from '../utils/socketEvents.js';
import {
    sendBookingConfirmationEmail,
    sendAdminNewBookingEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';

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
// GET SERVICE WITH VARIANT PRICING
// ============================================

export const getServiceWithPricing = async (req, res) => {
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
            .select('name category tier shortDescription variants images')
            .populate('category', 'name slug icon');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const activeVariants = service.variants
            .filter(v => v.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(v => ({
                _id: v._id,
                name: v.name,
                description: v.description,
                image: v.image,
                price: v.price,
                discountPrice: v.discountPrice,
                duration: v.duration,
                features: v.features
            }));

        res.status(200).json({
            success: true,
            data: {
                serviceId: service._id,
                serviceName: service.name,
                serviceTier: service.tier,
                category: service.category,
                shortDescription: service.shortDescription,
                primaryImage: service.primaryImage,
                variants: activeVariants
            }
        });

    } catch (error) {
        console.error('Get service pricing error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service pricing'
        });
    }
};

// ============================================
// CHECK TIME SLOT AVAILABILITY
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
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate < today) {
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
                    message: 'We are closed on Sundays',
                    slots: []
                }
            });
        }

        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedSlots = await Booking.find({
            serviceId,
            bookingDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled'] }
        }).select('timeSlot');

        const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

        const slots = VALID_TIME_SLOTS.map(slot => ({
            slot,
            available: !bookedSlotNames.includes(slot)
        }));

        res.status(200).json({
            success: true,
            data: { date, isAvailable: true, slots }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking availability'
        });
    }
};

// ============================================
// CREATE BOOKING
// ============================================

export const createBooking = async (req, res) => {
    try {
        const {
            serviceId,
            variantId,
            bookingDate,
            timeSlot,
            location,
            specialNotes
        } = req.body;

        // ---- Validate required fields ----
        if (!serviceId || !variantId || !bookingDate || !timeSlot || !location) {
            return res.status(400).json({
                success: false,
                message: 'Required: serviceId, variantId, bookingDate, timeSlot, location'
            });
        }

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        if (!location.address || !location.city) {
            return res.status(400).json({
                success: false,
                message: 'Location address and city are required'
            });
        }

        if (!VALID_TIME_SLOTS.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time slot'
            });
        }

        // ---- Validate date ----
        const requestedDate = new Date(bookingDate);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
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

        if (requestedDate.getDay() === 0) {
            return res.status(400).json({
                success: false,
                message: 'We are closed on Sundays'
            });
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        if (requestedDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book more than 30 days in advance'
            });
        }

        // ---- Max active bookings ----
        const activeBookings = await Booking.countDocuments({
            customerId: req.user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings >= 3) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 3 active bookings allowed'
            });
        }

        // ---- Find service & variant ----
        const service = await Service.findOne({
            _id: serviceId,
            isActive: true
        }).populate('category', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not available'
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

        // ---- Check slot availability ----
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
                message: 'This time slot is already booked'
            });
        }

        // ---- Calculate price ----
        const finalPrice = selectedVariant.discountPrice ?? selectedVariant.price;

        // ---- Create booking ----
        const booking = await Booking.create({
            bookingType: 'online',
            customerId: req.user._id,
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
            location: {
                address: location.address,
                city: location.city,
                landmark: location.landmark || ''
            },
            specialNotes: specialNotes || '',
            paymentMethod: 'cash'
        });

        // Update service booking count
        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // ---- Socket events ----
        try {
            const io = getIO();

            io.to('admin_room').emit(SOCKET_EVENTS.NEW_BOOKING, {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                bookingType: 'online',
                customerName: `${req.user.firstName} ${req.user.lastName}`,
                serviceName: booking.serviceName,
                variantName: booking.variantName,
                categoryName: booking.categoryName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                price: booking.price,
                status: booking.status,
                location: booking.location,
                createdAt: booking.createdAt
            });

            io.emit(SOCKET_EVENTS.SLOT_BOOKED, {
                serviceId: booking.serviceId,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot
            });
        } catch (socketError) {
            console.error('Socket emit error:', socketError.message);
        }

        // ---- Send emails ----
        const emailData = {
            bookingCode: booking.bookingCode,
            serviceName: booking.serviceName,
            serviceCategory: booking.categoryName,
            vehicleTypeName: booking.variantName,
            price: booking.price,
            duration: booking.duration,
            bookingDate: booking.bookingDate,
            timeSlot: booking.timeSlot,
            location: booking.location,
            vehicleDetails: { brand: '', model: '', color: '', plateNumber: '' },
            specialNotes: booking.specialNotes
        };

        try {
            await sendBookingConfirmationEmail(req.user, emailData);
        } catch (e) {
            console.error('Customer email failed:', e.message);
        }

        try {
            await sendAdminNewBookingEmail(emailData, req.user);
        } catch (e) {
            console.error('Admin email failed:', e.message);
        }

        // ---- Response ----
        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                categoryName: booking.categoryName,
                serviceName: booking.serviceName,
                serviceTier: booking.serviceTier,
                variantName: booking.variantName,
                price: booking.price,
                duration: booking.duration,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                location: booking.location,
                status: booking.status,
                paymentMethod: booking.paymentMethod
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot was just booked'
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
            message: 'Failed to create booking'
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
                    message: `Invalid status. Must be: ${validStatuses.join(', ')}`
                });
            }
            query.status = status;
        }

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
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
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};

// ============================================
// GET SINGLE BOOKING
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

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id
        });

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
            message: 'Failed to fetch booking'
        });
    }
};

// ============================================
// CANCEL BOOKING
// ============================================

export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a ${booking.status} booking`
            });
        }

        // 2 hour cancellation limit
        const bookingDateTime = new Date(booking.bookingDate);
        const [startHour] = booking.timeSlot.split('-')[0].split(':');
        bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

        const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);

        if (new Date() > twoHoursBefore) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking less than 2 hours before the slot'
            });
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by customer';
        booking.cancelledBy = 'user';
        booking.cancelledAt = new Date();
        await booking.save();

        // Socket events
        try {
            const io = getIO();

            io.to('admin_room').emit(SOCKET_EVENTS.BOOKING_CANCELLED, {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                serviceName: booking.serviceName,
                variantName: booking.variantName,
                timeSlot: booking.timeSlot,
                bookingDate: booking.bookingDate,
                cancelledBy: 'user',
                reason: booking.cancellationReason
            });

            io.emit(SOCKET_EVENTS.SLOT_AVAILABLE, {
                serviceId: booking.serviceId,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot
            });
        } catch (socketError) {
            console.error('Socket emit error:', socketError.message);
        }

        // Send cancellation email
        try {
            await sendBookingCancellationEmail(req.user, {
                bookingCode: booking.bookingCode,
                serviceName: booking.serviceName,
                serviceId: booking.serviceId,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                cancellationReason: booking.cancellationReason
            });
        } catch (e) {
            console.error('Cancellation email failed:', e.message);
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
            message: 'Failed to cancel booking'
        });
    }
};