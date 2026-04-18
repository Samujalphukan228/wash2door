// controllers/bookingController.js

import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import {
    TIME_SLOTS,
    ADMIN_ONLY_SLOTS,
    ALL_TIME_SLOTS,
    BOOKING_STATUSES,
    LIMITS,
    CLOSED_DAY_MESSAGE,
    isValidTimeSlot,
    isValidAnySlot,
    isAdminOnlySlot,
    isClosedDay,
    convertTo24Hour
} from '../utils/constants.js';
import {
    emitNewBooking,
    emitBookingCancelled,
    emitBookingStatusUpdate,
    emitSlotBooked,
    emitSlotAvailable
} from '../utils/socketEmitter.js';
import {
    sendNewBookingTelegram,
    sendAdminBookingTelegram,
    sendBookingCancelledTelegram,
    sendBookingStatusTelegram,
    sendBookingRescheduledTelegram
} from '../utils/telegram.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

const getLocalDateStr = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const isSlotInPast = (dateStr, timeSlot, bufferMinutes = LIMITS.MIN_BOOKING_BUFFER_MINUTES || 30) => {
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    if (dateStr !== todayStr) {
        return { isPast: false, reason: null };
    }

    const { start } = convertTo24Hour(timeSlot);
    const [hours, minutes] = start.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);

    const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    const minBookingTime = new Date(slotDateTime.getTime() - bufferMinutes * 60 * 1000);

    if (now >= slotDateTime) {
        return { isPast: true, reason: 'This time slot has already passed' };
    }

    if (now >= minBookingTime) {
        return {
            isPast: true,
            reason: `Please book at least ${bufferMinutes} minutes before the slot starts`
        };
    }

    return { isPast: false, reason: null };
};

// ============================================
// GET SERVICE INFO FOR BOOKING
// ============================================
export const getServiceWithPricing = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findOne({ _id: serviceId, isActive: true })
            .select('name tier shortDescription price discountPrice duration images')
            .populate('category', 'name slug icon')
            .populate('subcategory', 'name slug icon');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                serviceId: service._id,
                serviceName: service.name,
                serviceTier: service.tier,
                category: service.category,
                subcategory: service.subcategory,
                shortDescription: service.shortDescription,
                primaryImage: service.primaryImage,
                price: service.price,
                discountPrice: service.discountPrice,
                finalPrice: service.finalPrice,
                duration: service.duration
            }
        });

    } catch (error) {
        console.error('getServiceWithPricing error:', error);
        res.status(500).json({ success: false, message: 'Error fetching service' });
    }
};

// ============================================
// CHECK AVAILABILITY
// ============================================
export const checkAvailability = async (req, res) => {
    try {
        const { date, includeAdminSlots } = req.query;

        const isAdmin = req.user?.role === 'admin';
        const showAdminSlots = isAdmin && includeAdminSlots === 'true';

        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        if (date < todayStr) {
            return res.status(400).json({ success: false, message: 'Cannot check availability for past dates' });
        }

        const slotsToShow = showAdminSlots ? ALL_TIME_SLOTS : TIME_SLOTS;

        if (isClosedDay(bookingDate)) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isAvailable: false,
                    isClosed: true,
                    message: CLOSED_DAY_MESSAGE,
                    availableSlots: 0,
                    totalSlots: slotsToShow.length,
                    slots: slotsToShow.map(slot => ({
                        slot,
                        available: false,
                        reason: 'Closed',
                        isAdminOnly: isAdminOnlySlot(slot)
                    })),
                    showingAdminSlots: showAdminSlots,
                    regularSlotCount: TIME_SLOTS.length,
                    adminSlotCount: showAdminSlots ? ADMIN_ONLY_SLOTS.length : 0
                }
            });
        }

        const lockedBookings = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed'] }
        }).select('timeSlot serviceName status');

        const lockedSlotMap = {};
        lockedBookings.forEach(b => {
            lockedSlotMap[b.timeSlot] = b.serviceName;
        });

        const isToday = date === todayStr;

        const slots = slotsToShow.map(slot => {
            const isBooked = lockedSlotMap[slot] !== undefined;
            const isAdminSlot = isAdminOnlySlot(slot);

            let isPast = false;

            if (isToday) {
                const endTime = slot.split('-')[1].trim();
                const match = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

                if (match) {
                    let endHour = parseInt(match[1], 10);
                    const endMinutes = parseInt(match[2], 10);
                    const period = match[3].toUpperCase();

                    if (period === 'PM' && endHour !== 12) endHour += 12;
                    else if (period === 'AM' && endHour === 12) endHour = 0;

                    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                    const endTotalMinutes = endHour * 60 + endMinutes;

                    isPast = currentTotalMinutes >= endTotalMinutes;
                }
            }

            let available = true;
            let reason = null;

            if (isPast) { available = false; reason = 'Past'; }
            else if (isBooked) { available = false; reason = 'Booked'; }

            return { slot, available, reason, isAdminOnly: isAdminSlot };
        });

        const availableCount = slots.filter(s => s.available).length;
        const regularAvailable = slots.filter(s => s.available && !s.isAdminOnly).length;
        const adminOnlyAvailable = slots.filter(s => s.available && s.isAdminOnly).length;

        res.status(200).json({
            success: true,
            data: {
                date,
                isAvailable: slots.some(s => s.available),
                isClosed: false,
                availableSlots: availableCount,
                totalSlots: slots.length,
                slots,
                showingAdminSlots: showAdminSlots,
                regularSlotCount: TIME_SLOTS.length,
                adminSlotCount: showAdminSlots ? ADMIN_ONLY_SLOTS.length : 0,
                summary: {
                    regularAvailable,
                    adminOnlyAvailable,
                    totalAvailable: availableCount
                }
            }
        });

    } catch (error) {
        console.error('checkAvailability error:', error);
        res.status(500).json({ success: false, message: 'Error checking availability' });
    }
};

// ============================================
// CREATE BOOKING (Online)
// ============================================
export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, timeSlot, location, phone } = req.body;

        if (!serviceId || !bookingDate || !timeSlot || !location) {
            return res.status(400).json({
                success: false,
                message: 'Required: serviceId, bookingDate, timeSlot, location'
            });
        }

        if (!phone || !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Valid phone number is required'
            });
        }

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        if (!location.address || !location.city) {
            return res.status(400).json({
                success: false,
                message: 'Location address and city are required'
            });
        }

        const isAdmin = req.user?.role === 'admin';
        const isAdminSlot = isAdminOnlySlot(timeSlot);

        if (isAdminSlot && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'This time slot is only available for admin bookings.',
                availableSlots: TIME_SLOTS
            });
        }

        if (!isValidAnySlot(timeSlot)) {
            const validSlots = isAdmin ? ALL_TIME_SLOTS : TIME_SLOTS;
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${validSlots.join(', ')}`
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const [year, month, day] = bookingDate.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (bookingDate < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Booking date must be in the future'
            });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({
                success: false,
                message: CLOSED_DAY_MESSAGE
            });
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS);
        const maxDateStr = getLocalDateStr(maxDate);

        if (bookingDate > maxDateStr) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        const slotCheck = isSlotInPast(bookingDate, timeSlot);
        if (slotCheck.isPast) {
            return res.status(400).json({
                success: false,
                message: slotCheck.reason
            });
        }

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

        const service = await Service.findOne({ _id: serviceId, isActive: true })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not available'
            });
        }

        if (!service.subcategory || !service.subcategory._id) {
            return res.status(400).json({
                success: false,
                message: 'Service is missing subcategory'
            });
        }

        const slotLockKey = `${bookingDate}|${timeSlot}`;

        const existingBooking = await Booking.findOne({
            slotLockKey,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} on ${bookingDate} is already booked`
            });
        }

        const finalPrice = service.discountPrice || service.price || 0;
        const duration = service.duration || 60;

        let booking;

        try {
            booking = await Booking.create({
                bookingType: 'online',
                customerId: req.user._id,
                isAdminSlot,
                categoryId: service.category._id,
                categoryName: service.category.name,
                subcategoryId: service.subcategory._id,
                subcategoryName: service.subcategory.name,
                serviceId: service._id,
                serviceName: service.name,
                serviceTier: service.tier || 'basic',
                price: finalPrice,
                duration,
                bookingDate: requestedDate,
                timeSlot,
                location: {
                    address: location.address,
                    city: location.city
                },
                phone,
                paymentMethod: 'cash'
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${timeSlot} on ${bookingDate} was just booked by someone else.`
                });
            }
            throw createError;
        }

        await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

        emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);
        emitSlotBooked(bookingDate, timeSlot, serviceId);

        // Send Telegram notification async
        setImmediate(async () => {
            try {
                await sendNewBookingTelegram(booking, req.user);
                console.log('📱 Telegram: New booking notification sent');
            } catch (e) {
                console.error('Telegram notification failed:', e.message);
            }
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: {
                bookingId: booking._id,
                bookingCode: booking.bookingCode,
                categoryName: booking.categoryName,
                subcategoryName: booking.subcategoryName,
                serviceName: booking.serviceName,
                serviceTier: booking.serviceTier,
                price: booking.price,
                duration: booking.duration,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                location: booking.location,
                phone: booking.phone,
                status: booking.status,
                paymentMethod: booking.paymentMethod,
                isAdminSlot: booking.isAdminSlot
            }
        });

    } catch (error) {
        console.error('createBooking error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({ success: false, message: 'Failed to create booking' });
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

            const { start } = convertTo24Hour(booking.timeSlot);
            const [startHour] = start.split(':').map(Number);
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
        console.error('getMyBookings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
};

// ============================================
// GET SINGLE BOOKING
// ============================================
export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const bookingObj = booking.toObject();
        const bookingDateTime = new Date(booking.bookingDate);

        const { start } = convertTo24Hour(booking.timeSlot);
        const [startHour] = start.split(':').map(Number);
        bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

        bookingObj.isUpcoming = bookingDateTime > new Date() &&
            !['cancelled', 'completed'].includes(booking.status);

        const cancelDeadline = new Date(
            bookingDateTime.getTime() - LIMITS.MIN_CANCEL_HOURS_BEFORE * 60 * 60 * 1000
        );
        bookingObj.canCancel = ['pending', 'confirmed'].includes(booking.status) &&
            new Date() < cancelDeadline;

        bookingObj.canReview = booking.status === 'completed' && !booking.isReviewed;

        res.status(200).json({ success: true, data: bookingObj });

    } catch (error) {
        console.error('getBookingById error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
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
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel a ${booking.status} booking`
            });
        }

        const bookingDateTime = new Date(booking.bookingDate);
        const { start } = convertTo24Hour(booking.timeSlot);
        const [startHour] = start.split(':').map(Number);
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

        const oldDateStr = getLocalDateStr(booking.bookingDate);
        const oldSlot = booking.timeSlot;
        const oldServiceId = booking.serviceId;
        const bookingCode = booking.bookingCode;
        const serviceName = booking.serviceName;
        const bookingDate = booking.bookingDate;
        const timeSlot = booking.timeSlot;
        const price = booking.price;
        const phone = booking.phone;
        const walkInCustomer = booking.walkInCustomer;
        const customerId = booking.customerId;

        await Booking.deleteOne({ _id: bookingId });

        console.log(`🗑️ Booking ${bookingCode} DELETED (cancelled by user)`);

        emitSlotAvailable(oldDateStr, oldSlot, oldServiceId);
        emitBookingCancelled({
            _id: bookingId,
            bookingCode,
            serviceName,
            bookingDate,
            timeSlot,
            customerId: req.user._id
        }, 'user');

        // Send Telegram notification async
        setImmediate(async () => {
            try {
                await sendBookingCancelledTelegram({
                    bookingCode,
                    serviceName,
                    bookingDate,
                    timeSlot,
                    price,
                    phone,
                    walkInCustomer,
                    customerId,
                    cancellationReason: reason || 'Cancelled by customer'
                }, 'user');
                console.log('📱 Telegram: Cancellation notification sent');
            } catch (e) {
                console.error('Telegram cancellation notification failed:', e.message);
            }
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully. The slot is now available.',
            data: {
                bookingCode,
                serviceName,
                bookingDate,
                timeSlot,
                status: 'deleted'
            }
        });

    } catch (error) {
        console.error('cancelBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
};

// ============================================
// RESCHEDULE BOOKING
// ============================================
export const rescheduleBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newDate, newTimeSlot } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        if (!newDate || !newTimeSlot) {
            return res.status(400).json({ success: false, message: 'New date and time slot are required' });
        }

        const isAdmin = req.user?.role === 'admin';
        const isAdminSlot = isAdminOnlySlot(newTimeSlot);

        if (isAdminSlot && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'This time slot is only available for admin bookings.',
                availableSlots: TIME_SLOTS
            });
        }

        if (!isValidAnySlot(newTimeSlot)) {
            const validSlots = isAdmin ? ALL_TIME_SLOTS : TIME_SLOTS;
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${validSlots.join(', ')}`
            });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const booking = await Booking.findOne({ _id: bookingId, customerId: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot reschedule a ${booking.status} booking`
            });
        }

        const [year, month, day] = newDate.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (newDate < todayStr) {
            return res.status(400).json({ success: false, message: 'Cannot reschedule to a past date' });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({ success: false, message: CLOSED_DAY_MESSAGE });
        }

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS);
        const maxDateStr = getLocalDateStr(maxDate);

        if (newDate > maxDateStr) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        const slotCheck = isSlotInPast(newDate, newTimeSlot);
        if (slotCheck.isPast) {
            return res.status(400).json({ success: false, message: slotCheck.reason });
        }

        const newSlotLockKey = `${newDate}|${newTimeSlot}`;

        const slotTaken = await Booking.findOne({
            _id: { $ne: bookingId },
            slotLockKey: newSlotLockKey,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${newTimeSlot} on ${newDate} is already booked.`
            });
        }

        // Save old slot info BEFORE updating
        const oldDateStr = getLocalDateStr(booking.bookingDate);
        const oldTimeSlot = booking.timeSlot;
        const oldDate = booking.bookingDate;
        const serviceId = booking.serviceId;

        try {
            booking.bookingDate = requestedDate;
            booking.timeSlot = newTimeSlot;
            booking.isAdminSlot = isAdminSlot;
            await booking.save();

            emitSlotAvailable(oldDateStr, oldTimeSlot, serviceId);
            emitSlotBooked(newDate, newTimeSlot, serviceId);
            emitBookingStatusUpdate(booking, req.user._id);

            // Send Telegram notification async
            setImmediate(async () => {
                try {
                    await sendBookingRescheduledTelegram(
                        booking,
                        oldDate,
                        oldTimeSlot,
                        requestedDate,
                        newTimeSlot
                    );
                    console.log('📱 Telegram: Reschedule notification sent');
                } catch (e) {
                    console.error('Telegram reschedule notification failed:', e.message);
                }
            });

            res.status(200).json({
                success: true,
                message: 'Booking rescheduled successfully',
                data: {
                    ...booking.toObject(),
                    isAdminSlot: booking.isAdminSlot
                }
            });

        } catch (updateError) {
            if (updateError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${newTimeSlot} on ${newDate} was just booked by someone else.`
                });
            }
            throw updateError;
        }

    } catch (error) {
        console.error('rescheduleBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to reschedule booking' });
    }
};

// ============================================
// GET USER BOOKING STATS
// ============================================
export const getMyBookingStats = async (req, res) => {
    try {
        const stats = await Booking.getUserStats(req.user._id);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('getMyBookingStats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

// ============================================
// GET AVAILABLE SLOTS
// ============================================
export const getAvailableSlots = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isClosedDay(bookingDate)) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isClosed: true,
                    message: CLOSED_DAY_MESSAGE,
                    availableSlots: []
                }
            });
        }

        const isAdmin = req.user?.role === 'admin';
        const availableSlots = await Booking.getAvailableSlots(date, isAdmin);

        res.status(200).json({
            success: true,
            data: {
                date,
                isClosed: false,
                availableSlots,
                totalAvailable: availableSlots.length
            }
        });

    } catch (error) {
        console.error('getAvailableSlots error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch available slots' });
    }
};

export default {
    getServiceWithPricing,
    checkAvailability,
    createBooking,
    getMyBookings,
    getBookingById,
    cancelBooking,
    rescheduleBooking,
    getMyBookingStats,
    getAvailableSlots
};