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
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';
import { sendNewBookingTelegram } from '../utils/telegram.js';
import {
    emitNewBooking,
    emitBookingCancelled,
    emitBookingStatusUpdate,
    emitSlotBooked,
    emitSlotAvailable
} from '../utils/socketEmitter.js';

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
// CHECK AVAILABILITY (Supports Admin Slots)
// ============================================
export const checkAvailability = async (req, res) => {
    try {
        const { date, includeAdminSlots } = req.query;
        
        // Check if user is admin (from optional auth middleware)
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

        console.log('🔍 ==================== AVAILABILITY CHECK ====================');
        console.log('📅 Received date:', date);
        console.log('📅 Server today:', todayStr);
        console.log('👤 Is Admin:', isAdmin);
        console.log('🔐 Show Admin Slots:', showAdminSlots);

        const [year, month, day] = date.split('-').map(Number);
        const bookingDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        console.log('📅 Parsed booking date:', bookingDate.toLocaleDateString());
        console.log('📅 Day of week:', bookingDate.getDay(), '(0=Sun, 1=Mon)');

        if (isNaN(bookingDate.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid date' });
        }

        if (date < todayStr) {
            return res.status(400).json({ success: false, message: 'Cannot check availability for past dates' });
        }

        // Get the appropriate slots based on role
        const slotsToShow = showAdminSlots ? ALL_TIME_SLOTS : TIME_SLOTS;

        // Check if closed day
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

        // Find all booked slots for this date
        const lockedBookings = await Booking.find({
            slotLockKey: { $regex: `^${date}\\|` },
            status: { $in: ['pending', 'confirmed'] }
        }).select('timeSlot serviceName status');

        console.log('📋 Active bookings found:', lockedBookings.length);

        const lockedSlotMap = {};
        lockedBookings.forEach(b => {
            lockedSlotMap[b.timeSlot] = b.serviceName;
        });

        const isToday = date === todayStr;

        // ✅ FIXED: Process each slot - check END time, not START time
        const slots = slotsToShow.map(slot => {
            const isBooked = lockedSlotMap[slot] !== undefined;
            const isAdminSlot = isAdminOnlySlot(slot);
            
            let isPast = false;

            // ✅ NEW: Check if slot END time has passed
            if (isToday) {
                const endTime = slot.split('-')[1].trim(); // "10:30 AM"
                const match = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                
                if (match) {
                    let endHour = parseInt(match[1], 10);
                    const endMinutes = parseInt(match[2], 10);
                    const period = match[3].toUpperCase();
                    
                    // Convert to 24-hour format
                    if (period === 'PM' && endHour !== 12) {
                        endHour += 12;
                    } else if (period === 'AM' && endHour === 12) {
                        endHour = 0;
                    }
                    
                    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
                    const endTotalMinutes = endHour * 60 + endMinutes;
                    
                    isPast = currentTotalMinutes >= endTotalMinutes;
                }
            }

            let available = true;
            let reason = null;

            if (isPast) { 
                available = false; 
                reason = 'Past'; 
            } else if (isBooked) { 
                available = false; 
                reason = 'Booked'; 
            }

            return { 
                slot, 
                available, 
                reason,
                isAdminOnly: isAdminSlot
            };
        });

        const availableCount = slots.filter(s => s.available).length;
        const regularAvailable = slots.filter(s => s.available && !s.isAdminOnly).length;
        const adminOnlyAvailable = slots.filter(s => s.available && s.isAdminOnly).length;

        console.log('📊 Total Available:', availableCount, '/', slots.length);
        console.log('📊 Regular Available:', regularAvailable);
        console.log('📊 Admin-Only Available:', adminOnlyAvailable);
        console.log('🔍 ============================================================');

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
// CREATE BOOKING (Supports Admin Slots)
// ============================================
export const createBooking = async (req, res) => {
    try {
        const { serviceId, bookingDate, timeSlot, location, phone } = req.body;

        // ==================== VALIDATION ====================
        
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

        // ==================== ADMIN SLOT CHECK ====================
        
        const isAdmin = req.user?.role === 'admin';
        const isAdminSlot = isAdminOnlySlot(timeSlot);

        // Non-admins cannot book admin-only slots
        if (isAdminSlot && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'This time slot is only available for admin bookings. Please choose a regular time slot.',
                availableSlots: TIME_SLOTS
            });
        }

        // Validate against appropriate slot list
        if (!isValidAnySlot(timeSlot)) {
            const validSlots = isAdmin ? ALL_TIME_SLOTS : TIME_SLOTS;
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${validSlots.join(', ')}`
            });
        }

        // ==================== DATE VALIDATION ====================
        
        if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

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

        // ==================== TIME SLOT VALIDATION ====================
        
        const slotCheck = isSlotInPast(bookingDate, timeSlot);
        if (slotCheck.isPast) {
            return res.status(400).json({
                success: false,
                message: slotCheck.reason
            });
        }

        // ==================== USER BOOKING LIMIT ====================
        
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

        // ==================== SERVICE VALIDATION ====================
        
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

        // ==================== SLOT AVAILABILITY CHECK ====================
        
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

        // ==================== CREATE BOOKING ====================
        
        const finalPrice = service.discountPrice || service.price || 0;
        const duration = service.duration || 60;

        console.log(`📦 Creating booking for ${service.name}`);
        console.log(`   Price: ${finalPrice}`);
        console.log(`   Admin Slot: ${isAdminSlot}`);
        console.log(`   User: ${req.user.email}`);

        let booking;

        try {
            booking = await Booking.create({
                bookingType: 'online',
                customerId: req.user._id,
                isAdminSlot: isAdminSlot,

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

                phone: phone,
                paymentMethod: 'cash'
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${timeSlot} on ${bookingDate} was just booked by someone else. Please choose another slot.`
                });
            }
            throw createError;
        }

        // ==================== POST-CREATION TASKS ====================
        
        // Update service booking count
        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        // Emit real-time events
        emitNewBooking(booking, `${req.user.firstName} ${req.user.lastName}`);
        emitSlotBooked(bookingDate, timeSlot, serviceId);

        console.log(`🔌 Real-time: Emitted new booking + slot booked for ${bookingDate} ${timeSlot}`);

        // Send notifications async
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
            phone: booking.phone,
            isAdminSlot: booking.isAdminSlot
        };

        setImmediate(async () => {
            try {
                await sendBookingConfirmationEmail(req.user, emailData);
                console.log('✉️ Booking confirmation email sent');
            } catch (e) {
                console.error('Customer email failed:', e.message);
            }

            try {
                await sendNewBookingTelegram(booking, req.user);
                console.log('📱 Telegram notification sent');
            } catch (e) {
                console.error('Telegram notification failed:', e.message);
            }
        });

        // ==================== RESPONSE ====================
        
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
// CANCEL BOOKING (DELETES FROM DB)
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

        // Save info BEFORE deleting
        const oldDateStr = getLocalDateStr(booking.bookingDate);
        const oldSlot = booking.timeSlot;
        const oldServiceId = booking.serviceId;
        const bookingCode = booking.bookingCode;
        const serviceName = booking.serviceName;
        const bookingDate = booking.bookingDate;
        const timeSlot = booking.timeSlot;

        // DELETE the booking instead of soft delete
        await Booking.deleteOne({ _id: bookingId });

        console.log(`🗑️ Booking ${bookingCode} DELETED (cancelled by user)`);
        console.log(`🔓 Slot freed: ${oldDateStr} | ${oldSlot}`);

        // Real-time socket emissions
        emitSlotAvailable(oldDateStr, oldSlot, oldServiceId);

        emitBookingCancelled({
            _id: bookingId,
            bookingCode,
            serviceName,
            bookingDate,
            timeSlot,
            customerId: req.user._id
        }, 'user');

        console.log(`🔌 Real-time: Emitted cancellation + slot available for ${oldDateStr} ${oldSlot}`);

        // Send cancellation email async
        setImmediate(async () => {
            try {
                await sendBookingCancellationEmail(req.user, {
                    bookingCode,
                    serviceName,
                    bookingDate,
                    timeSlot,
                    cancellationReason: reason || 'Cancelled by customer'
                });
                console.log('✉️ Cancellation email sent');
            } catch (e) {
                console.error('Cancellation email failed:', e.message);
            }
        });

        res.status(200).json({
            success: true,
            message: 'Booking cancelled and removed successfully. The slot is now available for others.',
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
// RESCHEDULE BOOKING (Supports Admin Slots)
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

        // ==================== ADMIN SLOT CHECK ====================
        
        const isAdmin = req.user?.role === 'admin';
        const isAdminSlot = isAdminOnlySlot(newTimeSlot);

        // Non-admins cannot reschedule to admin-only slots
        if (isAdminSlot && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'This time slot is only available for admin bookings. Please choose a regular time slot.',
                availableSlots: TIME_SLOTS
            });
        }

        // Validate against appropriate slot list
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
            return res.status(400).json({ 
                success: false, 
                message: CLOSED_DAY_MESSAGE 
            });
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
            return res.status(400).json({ 
                success: false, 
                message: slotCheck.reason 
            });
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

        // Save old slot info BEFORE updating
        const oldDateStr = getLocalDateStr(booking.bookingDate);
        const oldTimeSlot = booking.timeSlot;
        const serviceId = booking.serviceId;

        try {
            booking.bookingDate = requestedDate;
            booking.timeSlot = newTimeSlot;
            booking.isAdminSlot = isAdminSlot;  // Update admin slot flag
            await booking.save();

            console.log(`📅 Booking rescheduled from ${oldDateStr} ${oldTimeSlot} to ${newDate} ${newTimeSlot}`);
            console.log(`   Admin Slot: ${isAdminSlot}`);

            emitSlotAvailable(oldDateStr, oldTimeSlot, serviceId);
            emitSlotBooked(newDate, newTimeSlot, serviceId);
            emitBookingStatusUpdate(booking, req.user._id);

            console.log(`🔌 Real-time: Rescheduled ${oldDateStr} ${oldTimeSlot} -> ${newDate} ${newTimeSlot}`);

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

// ============================================
// GET USER BOOKING STATS
// ============================================
export const getMyBookingStats = async (req, res) => {
    try {
        const stats = await Booking.getUserStats(req.user._id);

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('getMyBookingStats error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

// ============================================
// GET AVAILABLE SLOTS FOR DATE
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

// ============================================
// EXPORT DEFAULT
// ============================================
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