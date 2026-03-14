// controllers/bookingController.js

import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import {
    TIME_SLOTS,
    BOOKING_STATUSES,
    LIMITS,
    isValidTimeSlot,
    isClosedDay
} from '../utils/constants.js';
import {
    sendBookingConfirmationEmail,
    sendAdminNewBookingEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';
import {
    emitNewBooking,
    emitBookingCancelled
} from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

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
// CHECK TIME SLOT AVAILABILITY (GLOBAL)
// ============================================

export const checkAvailability = async (req, res) => {
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

        // Check if Sunday (closed)
        if (isClosedDay(bookingDate)) {
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
        // GLOBAL CHECK using slotLockKey
        // Find all locked slots for this date
        // ============================================
        const dateStr = bookingDate.toISOString().split('T')[0];

        const lockedBookings = await Booking.find({
            slotLockKey: { $regex: `^${dateStr}\\|` }
        }).select('timeSlot serviceName variantName');

        // Build a map: timeSlot → booking info
        const lockedSlotMap = {};
        lockedBookings.forEach(booking => {
            lockedSlotMap[booking.timeSlot] = {
                serviceName: booking.serviceName,
                variantName: booking.variantName
            };
        });

        // For today, calculate past slots
        const now = new Date();
        const isToday = bookingDate.toDateString() === now.toDateString();

        const slots = TIME_SLOTS.map(slot => {
            const [startTime] = slot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);

            const isBooked = lockedSlotMap[slot] !== undefined;

            // Check if slot is in the past (for today)
            let isPast = false;
            if (isToday) {
                const currentHour = now.getHours();
                const currentMin = now.getMinutes();
                // Slot is past if current time has reached or passed the start time
                if (currentHour > hours || (currentHour === hours && currentMin >= minutes)) {
                    isPast = true;
                }
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
                bookedBy = lockedSlotMap[slot].serviceName;
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
                availableSlots: availableCount,
                totalSlots: slots.length,
                slots
            }
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
// CREATE BOOKING (GLOBAL SLOT LOCK)
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

        if (!isValidTimeSlot(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${TIME_SLOTS.join(', ')}`
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

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({
                success: false,
                message: 'We are closed on Sundays'
            });
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS);
        if (requestedDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        // ---- Check if slot time has passed (for today) ----
        const isToday = requestedDate.toDateString() === new Date().toDateString();
        if (isToday) {
            const [startTime] = timeSlot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);
            const now = new Date();

            if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot has already passed for today'
                });
            }
        }

        // ---- Max active bookings per user ----
        const activeBookings = await Booking.countDocuments({
            customerId: req.user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings >= LIMITS.MAX_ACTIVE_BOOKINGS_PER_USER) {
            return res.status(400).json({
                success: false,
                message: `Maximum ${LIMITS.MAX_ACTIVE_BOOKINGS_PER_USER} active bookings allowed`
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

        // ============================================
        // GLOBAL SLOT CHECK using slotLockKey
        // ============================================
        const dateStr = requestedDate.toISOString().split('T')[0];
        const slotLockKey = `${dateStr}|${timeSlot}`;

        const slotTaken = await Booking.findOne({ slotLockKey });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} on ${dateStr} is already booked${slotTaken.serviceName ? ` (${slotTaken.serviceName})` : ''}. Please choose another slot.`
            });
        }

        // ---- Calculate price ----
        const finalPrice = selectedVariant.discountPrice ?? selectedVariant.price;

        // ---- Create booking ----
        // slotLockKey is auto-set in pre('save') hook
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
        emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);

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

        // ============================================
        // Duplicate key = race condition caught by DB
        // ============================================
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
            if (!BOOKING_STATUSES.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be: ${BOOKING_STATUSES.join(', ')}`
                });
            }
            query.status = status;
        }

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const bookingsWithMeta = bookings.map(booking => {
            const bookingObj = booking.toObject();

            const bookingDateTime = new Date(booking.bookingDate);
            const [startHour] = booking.timeSlot.split('-')[0].split(':');
            bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

            bookingObj.isUpcoming = bookingDateTime > new Date() &&
                !['cancelled', 'completed'].includes(booking.status);

            const cancelDeadline = new Date(
                bookingDateTime.getTime() - LIMITS.MIN_CANCEL_HOURS_BEFORE * 60 * 60 * 1000
            );
            bookingObj.canCancel = ['pending', 'confirmed'].includes(booking.status) &&
                new Date() < cancelDeadline;

            return bookingObj;
        });

        res.status(200).json({
            success: true,
            data: {
                bookings: bookingsWithMeta,
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

        const bookingObj = booking.toObject();

        const bookingDateTime = new Date(booking.bookingDate);
        const [startHour] = booking.timeSlot.split('-')[0].split(':');
        bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

        bookingObj.isUpcoming = bookingDateTime > new Date() &&
            !['cancelled', 'completed'].includes(booking.status);

        const cancelDeadline = new Date(
            bookingDateTime.getTime() - LIMITS.MIN_CANCEL_HOURS_BEFORE * 60 * 60 * 1000
        );
        bookingObj.canCancel = ['pending', 'confirmed'].includes(booking.status) &&
            new Date() < cancelDeadline;

        bookingObj.canReview = booking.status === 'completed' && !booking.isReviewed;

        res.status(200).json({
            success: true,
            data: bookingObj
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
// CANCEL BOOKING (releases slotLockKey)
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

        // Cancellation time limit check
        const bookingDateTime = new Date(booking.bookingDate);
        const [startHour] = booking.timeSlot.split('-')[0].split(':');
        bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

        const cancelDeadline = new Date(
            bookingDateTime.getTime() - LIMITS.MIN_CANCEL_HOURS_BEFORE * 60 * 60 * 1000
        );

        if (new Date() > cancelDeadline) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel booking less than ${LIMITS.MIN_CANCEL_HOURS_BEFORE} hours before the slot`
            });
        }

        // Update booking — pre('save') hook sets slotLockKey to null
        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by customer';
        booking.cancelledBy = 'user';
        booking.cancelledAt = new Date();
        await booking.save(); // slotLockKey becomes null → slot is released

        // ---- Socket events ----
        emitBookingCancelled(booking, 'user');

        // ---- Send cancellation email ----
        try {
            await sendBookingCancellationEmail(req.user, {
                bookingCode: booking.bookingCode,
                serviceName: booking.serviceName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                cancellationReason: booking.cancellationReason
            });
        } catch (e) {
            console.error('Cancellation email failed:', e.message);
        }

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully. The slot is now available for others.',
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

// ============================================
// RESCHEDULE BOOKING (GLOBAL SLOT LOCK)
// ============================================

export const rescheduleBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newDate, newTimeSlot } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        if (!newDate || !newTimeSlot) {
            return res.status(400).json({
                success: false,
                message: 'New date and time slot are required'
            });
        }

        if (!isValidTimeSlot(newTimeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${TIME_SLOTS.join(', ')}`
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
                message: `Cannot reschedule a ${booking.status} booking`
            });
        }

        // Validate new date
        const requestedDate = new Date(newDate);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format'
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (requestedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot reschedule to a past date'
            });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({
                success: false,
                message: 'We are closed on Sundays'
            });
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS);
        if (requestedDate > maxDate) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        // Check if slot time has passed (for today)
        const isToday = requestedDate.toDateString() === new Date().toDateString();
        if (isToday) {
            const [startTime] = newTimeSlot.split('-');
            const [hours, minutes] = startTime.split(':').map(Number);
            const now = new Date();

            if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot has already passed for today'
                });
            }
        }

        // ============================================
        // GLOBAL SLOT CHECK using slotLockKey
        // ============================================
        const newDateStr = requestedDate.toISOString().split('T')[0];
        const newSlotLockKey = `${newDateStr}|${newTimeSlot}`;

        // Check if the new slot is taken (exclude current booking)
        const slotTaken = await Booking.findOne({
            _id: { $ne: bookingId },
            slotLockKey: newSlotLockKey
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${newTimeSlot} on ${newDateStr} is already booked. Please choose another slot.`
            });
        }

        // Store old values for socket emission
        const oldDate = booking.bookingDate;
        const oldTimeSlot = booking.timeSlot;

        // Update booking — pre('save') hook updates slotLockKey automatically
        booking.bookingDate = requestedDate;
        booking.timeSlot = newTimeSlot;
        await booking.save(); // slotLockKey auto-updates to new date|slot

        // ---- Socket events ----
        emitBookingCancelled({
            ...booking.toObject(),
            bookingDate: oldDate,
            timeSlot: oldTimeSlot
        }, 'reschedule');

        emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);

        res.status(200).json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Reschedule booking error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot was just booked by someone else. Please choose another slot.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to reschedule booking'
        });
    }
};

export default {
    getServiceWithPricing,
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    rescheduleBooking
};