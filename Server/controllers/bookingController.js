import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import {
    TIME_SLOTS,
    BOOKING_STATUSES,
    LIMITS,
    isValidTimeSlot,
    isClosedDay,
    convertTo24Hour
} from '../utils/constants.js';
import {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';
import { sendNewBookingTelegram } from '../utils/telegram.js';
import {
    emitNewBooking,
    emitBookingCancelled
} from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ✅ HELPER: Get local date string from Date object
const getLocalDateStr = (date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

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
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: 'Date is required' });
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD' });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now)

        console.log('🔍 ==================== AVAILABILITY CHECK ====================')
        console.log('📅 Received date:', date)
        console.log('📅 Server today:', todayStr)
        console.log('📅 Server time:', now.toLocaleString())

        const [year, month, day] = date.split('-').map(Number)
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0)

        console.log('📅 Parsed booking date:', bookingDate.toLocaleDateString())
        console.log('📅 Day of week:', bookingDate.getDay(), '(0=Sun)')

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        if (date < todayStr) {
            return res.status(400).json({ success: false, message: 'Cannot check availability for past dates' });
        }

        if (isClosedDay(bookingDate)) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    isAvailable: false,
                    isClosed: true,
                    message: 'We are closed on Mondays',
                    availableSlots: 0,
                    totalSlots: TIME_SLOTS.length,
                    slots: TIME_SLOTS.map(slot => ({ slot, available: false, reason: 'Closed' }))
                }
            });
        }

        const lockedBookings = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed'] }
        }).select('timeSlot serviceName status');

        console.log('📋 Active bookings found:', lockedBookings.length)

        const lockedSlotMap = {};
        lockedBookings.forEach(b => {
            lockedSlotMap[b.timeSlot] = b.serviceName;
        });

        const isToday = date === todayStr

        const slots = TIME_SLOTS.map(slot => {
            const { start } = convertTo24Hour(slot);
            const [hours, minutes] = start.split(':').map(Number);

            const isBooked = lockedSlotMap[slot] !== undefined;
            let isPast = false;

            if (isToday) {
                const slotDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
                isPast = now.getTime() >= slotDateTime.getTime()
            }

            let available = true;
            let reason = null;

            if (isPast) { available = false; reason = 'Past'; }
            else if (isBooked) { available = false; reason = 'Booked'; }

            return { slot, available, reason };
        });

        const availableCount = slots.filter(s => s.available).length
        console.log('📊 Available:', availableCount, '/', slots.length)
        console.log('🔍 ============================================================')

        res.status(200).json({
            success: true,
            data: {
                date,
                isAvailable: slots.some(s => s.available),
                isClosed: false,
                availableSlots: slots.filter(s => s.available).length,
                totalSlots: slots.length,
                slots
            }
        });

    } catch (error) {
        console.error('checkAvailability error:', error);
        res.status(500).json({ success: false, message: 'Error checking availability' });
    }
};

// ============================================
// CREATE BOOKING
// ============================================
export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, timeSlot, location, phone } = req.body;

        // ✅ Required fields check
        if (!serviceId || !bookingDate || !timeSlot || !location) {
            return res.status(400).json({
                success: false,
                message: 'Required: serviceId, bookingDate, timeSlot, location'
            });
        }

        // ✅ Phone required + validation
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

        if (!isValidTimeSlot(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${TIME_SLOTS.join(', ')}`
            });
        }

        // ✅ Parse date
        const [year, month, day] = bookingDate.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
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
                message: 'We are closed on Sundays'
            });
        }

        // ✅ Max advance booking limit
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS);
        const maxDateStr = getLocalDateStr(maxDate);

        if (bookingDate > maxDateStr) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        // ✅ Prevent past time slot booking (today)
        const isToday = bookingDate === todayStr;
        if (isToday) {
            const { start } = convertTo24Hour(timeSlot);
            const [hours, minutes] = start.split(':').map(Number);

            if (
                now.getHours() > hours ||
                (now.getHours() === hours && now.getMinutes() >= minutes)
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot has already passed for today'
                });
            }
        }

        // ✅ Limit active bookings per user
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

        // ✅ Get service
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

        // ✅ Slot locking check
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

        // ✅ Pricing
        const finalPrice = service.discountPrice || service.price || 0;
        const duration = service.duration || 60;

        console.log(`📦 Creating booking for ${service.name}. Price: ${finalPrice}`);

        let booking;

        try {
            booking = await Booking.create({
                bookingType: 'online',
                customerId: req.user._id,

                categoryId: service.category._id,
                categoryName: service.category.name,

                subcategoryId: service.subcategory._id,
                subcategoryName: service.subcategory.name,

                serviceId: service._id,
                serviceName: service.name,
                serviceTier: service.tier || 'basic',

                price: finalPrice,
                duration: duration,

                bookingDate: requestedDate,
                timeSlot,

                location: {
                    address: location.address,
                    city: location.city
                },

                phone: phone, // ✅ REQUIRED

                paymentMethod: 'cash'
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${timeSlot} on ${bookingDate} was just booked`
                });
            }
            throw createError;
        }

        // ✅ Increment booking count
        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // ✅ Emit events
        emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);

        // ✅ Email data (clean)
        const emailData = {
            bookingCode: booking.bookingCode,
            serviceName: booking.serviceName,
            serviceCategory: booking.categoryName,
            subcategoryName: booking.subcategoryName,
            price: booking.price,
            duration: booking.duration,
            bookingDate: booking.bookingDate,
            timeSlot: booking.timeSlot,
            location: booking.location,
            phone: booking.phone
        };

        try {
            await sendBookingConfirmationEmail(req.user, emailData);
        } catch (e) {
            console.error('Customer email failed:', e.message);
        }

        try {
            await sendNewBookingTelegram(booking, req.user);
        } catch (e) {
            console.error('Telegram notification failed:', e.message);
        }

        // ✅ Response
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
                paymentMethod: booking.paymentMethod
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

        const oldDate = getLocalDateStr(new Date(booking.bookingDate));
        const oldSlot = booking.timeSlot;

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'Cancelled by customer';
        booking.cancelledBy = 'user';
        booking.cancelledAt = new Date();
        await booking.save();

        console.log(`🗑️ Slot freed: ${oldDate} | ${oldSlot}`)

        emitBookingCancelled(booking, 'user');

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

        if (!isValidTimeSlot(newTimeSlot)) {
            return res.status(400).json({ success: false, message: 'Invalid time slot' });
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

        const [year, month, day] = newDate.split('-').map(Number)
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0)

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date format' });
        }

        const now = new Date()
        const todayStr = getLocalDateStr(now)

        if (newDate < todayStr) {
            return res.status(400).json({ success: false, message: 'Cannot reschedule to a past date' });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({ success: false, message: 'We are closed on Sundays' });
        }

        const maxDate = new Date()
        maxDate.setDate(maxDate.getDate() + LIMITS.MAX_BOOKING_ADVANCE_DAYS)
        const maxDateStr = getLocalDateStr(maxDate)

        if (newDate > maxDateStr) {
            return res.status(400).json({
                success: false,
                message: `Cannot book more than ${LIMITS.MAX_BOOKING_ADVANCE_DAYS} days in advance`
            });
        }

        const isToday = newDate === todayStr
        if (isToday) {
            const { start } = convertTo24Hour(newTimeSlot);
            const [hours, minutes] = start.split(':').map(Number);
            if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
                return res.status(400).json({ success: false, message: 'This time slot has already passed for today' });
            }
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
                message: `Time slot ${newTimeSlot} on ${newDate} is already booked. Please choose another slot.`
            });
        }

        const oldDate = booking.bookingDate;
        const oldTimeSlot = booking.timeSlot;

        try {
            booking.bookingDate = requestedDate;
            booking.timeSlot = newTimeSlot;
            await booking.save();

            console.log(`📅 Booking rescheduled from ${getLocalDateStr(new Date(oldDate))} ${oldTimeSlot} to ${newDate} ${newTimeSlot}`);

            emitBookingCancelled({ ...booking.toObject(), bookingDate: oldDate, timeSlot: oldTimeSlot }, 'reschedule');
            emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);

            res.status(200).json({
                success: true,
                message: 'Booking rescheduled successfully',
                data: booking
            });

        } catch (updateError) {
            if (updateError.code === 11000) {
                console.warn(`⚠️ Duplicate booking attempt for slot: ${newSlotLockKey}`);
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${newTimeSlot} on ${newDate} was just booked by someone else. Please choose another slot.`
                });
            }
            throw updateError;
        }

    } catch (error) {
        console.error('rescheduleBooking error:', error);
        res.status(500).json({ success: false, message: 'Failed to reschedule booking' });
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