// models/Booking.js

import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema({
    bookingCode: {
        type: String,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        enum: [
            '08:00-09:00', '09:00-10:00', '10:00-11:00',
            '11:00-12:00', '12:00-13:00', '13:00-14:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00',
            '17:00-18:00'
        ]
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: String,
        zipCode: String,
        landmark: String
    },
    vehicleDetails: {
        type: {
            type: String,
            enum: ['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'],
            required: [true, 'Vehicle type is required']
        },
        brand: String,
        model: String,
        color: String,
        plateNumber: String
    },
    price: {
        type: Number,
        required: true
    },
    specialNotes: {
        type: String,
        default: ''
    },
    completedAt: Date,
    cancellationReason: String,
    cancelledBy: {
        type: String,
        enum: ['user', 'admin'],
        default: null
    },
    cancelledAt: Date,
    isReviewed: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash'
    }
}, {
    timestamps: true
});

// Generate booking code before saving
bookingSchema.pre('save', function(next) {
    if (!this.bookingCode) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.bookingCode = `CW-${random}`;
    }
    next();
});

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ bookingCode: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;