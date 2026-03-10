import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import {
    sendBookingConfirmationEmail,
    sendAdminNewBookingEmail,
    sendBookingCancellationEmail
} from '../utils/sendEmail.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// STEP 2 - GET SERVICE WITH VEHICLE TYPE PRICING
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
        }).select('name category vehicleTypes shortDescription');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const activeVehicleTypes = service.vehicleTypes
            .filter(v => v.isActive)
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .map(v => ({
                _id: v._id,
                type: v.type,
                label: v.label,
                description: v.description,
                image: v.image,
                price: v.price,
                duration: v.duration,
                features: v.features
            }));

        res.status(200).json({
            success: true,
            data: {
                serviceId: service._id,
                serviceName: service.name,
                serviceCategory: service.category,
                vehicleTypes: activeVehicleTypes
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
// STEP 3 - CHECK TIME SLOT AVAILABILITY
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

        // Check Sunday
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

        const allSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ];

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

        const slots = allSlots.map(slot => ({
            slot,
            available: !bookedSlotNames.includes(slot)
        }));

        res.status(200).json({
            success: true,
            data: {
                date,
                isAvailable: true,
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
// STEP 4 & 5 - CREATE BOOKING
// ============================================

export const createBooking = async (req, res) => {
    try {
        const {
            serviceId,
            vehicleTypeId,
            bookingDate,
            timeSlot,
            location,
            vehicleDetails,
            specialNotes
        } = req.body;

        // Validate required fields
        if (!serviceId || !vehicleTypeId || !bookingDate ||
            !timeSlot || !location || !vehicleDetails) {
            return res.status(400).json({
                success: false,
                message: 'All fields required: serviceId, vehicleTypeId, bookingDate, timeSlot, location, vehicleDetails'
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

        if (!vehicleDetails.type) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle type is required in vehicle details'
            });
        }

        const validTimeSlots = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ];

        if (!validTimeSlots.includes(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time slot'
            });
        }

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

        // ✅ ADDED: Max active bookings check
        const activeBookings = await Booking.countDocuments({
            customerId: req.user._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings >= 3) {
            return res.status(400).json({
                success: false,
                message: 'You cannot have more than 3 active bookings at a time'
            });
        }

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

        const selectedVehicleType = service.vehicleTypes.id(vehicleTypeId);

        if (!selectedVehicleType) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle type not found in this service'
            });
        }

        if (!selectedVehicleType.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This vehicle type is currently not available'
            });
        }

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

        const booking = await Booking.create({
            customerId: req.user._id,
            serviceId: service._id,
            serviceName: service.name,
            serviceCategory: service.category,
            vehicleTypeId: selectedVehicleType._id,
            vehicleTypeName: selectedVehicleType.label,
            vehicleType: selectedVehicleType.type,
            price: selectedVehicleType.price,
            duration: selectedVehicleType.duration,
            bookingDate: requestedDate,
            timeSlot,
            location,
            vehicleDetails,
            specialNotes: specialNotes || '',
            paymentMethod: 'cash'
        });

        await Service.findByIdAndUpdate(serviceId, {
            $inc: { totalBookings: 1 }
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate('customerId', 'firstName lastName email');

        // Send emails
        try {
            await sendBookingConfirmationEmail(req.user, populatedBooking);
            console.log(`✅ Confirmation email sent to: ${req.user.email}`);
        } catch (emailError) {
            console.error('Customer email failed:', emailError.message);
        }

        try {
            await sendAdminNewBookingEmail(populatedBooking, req.user);
            console.log(`✅ Admin notification sent`);
        } catch (emailError) {
            console.error('Admin email failed:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully!',
            data: {
                bookingId: populatedBooking._id,
                bookingCode: populatedBooking.bookingCode,
                serviceName: populatedBooking.serviceName,
                serviceCategory: populatedBooking.serviceCategory,
                vehicleTypeName: populatedBooking.vehicleTypeName,
                price: populatedBooking.price,
                duration: populatedBooking.duration,
                bookingDate: populatedBooking.bookingDate,
                timeSlot: populatedBooking.timeSlot,
                location: populatedBooking.location,
                vehicleDetails: populatedBooking.vehicleDetails,
                status: populatedBooking.status,
                paymentMethod: populatedBooking.paymentMethod,
                specialNotes: populatedBooking.specialNotes
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);

        // ✅ ADDED: Handle duplicate key error from unique index
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'This time slot was just booked. Please choose another slot.'
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format'
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
            const validStatuses = [
                'pending', 'confirmed',
                'in-progress', 'completed', 'cancelled'
            ];
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

        // ✅ ADDED: 2 hour cancellation limit
        const bookingDateTime = new Date(booking.bookingDate);
        const [startHour] = booking.timeSlot.split('-')[0].split(':');
        bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);

        const twoHoursBefore = new Date(
            bookingDateTime.getTime() - 2 * 60 * 60 * 1000
        );

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
            message: 'Failed to cancel booking'
        });
    }
};