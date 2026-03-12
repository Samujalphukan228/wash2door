// models/Booking.js - SIMPLIFIED

import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema({
    // ============================================
    // BOOKING CODE (auto generated)
    // ============================================
    bookingCode: {
        type: String,
        unique: true
    },

    // ============================================
    // BOOKING TYPE
    // ============================================
    bookingType: {
        type: String,
        enum: ['online', 'walkin'],
        default: 'online'
    },

    // ============================================
    // CUSTOMER
    // ============================================
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    walkInCustomer: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' }
    },

    // ============================================
    // CATEGORY (stored for history)
    // ============================================
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    categoryName: {
        type: String,
        required: true
    },

    // ============================================
    // SERVICE
    // ============================================
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: [true, 'Service is required']
    },
    serviceName: {
        type: String,
        required: true
    },
    serviceTier: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'custom'],
        required: true
    },

    // ============================================
    // VARIANT (pricing option selected)
    // ============================================
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Variant is required']
    },
    variantName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },

    // ============================================
    // DATE & TIME
    // ============================================
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

    // ============================================
    // LOCATION (simplified)
    // ============================================
    location: {
        address: { type: String, required: [true, 'Address is required'] },
        city: { type: String, required: [true, 'City is required'] },
        landmark: { type: String, default: '' }
    },

    // ============================================
    // NOTES (customer can mention anything here)
    // ============================================
    specialNotes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    // ============================================
    // STATUS
    // ============================================
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
        type: String,
        enum: ['user', 'admin', null],
        default: null
    },
    cancellationReason: {
        type: String,
        default: ''
    },

    // ============================================
    // REVIEW & PAYMENT
    // ============================================
    isReviewed: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'online'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, {
    timestamps: true
});

// Auto generate booking code
bookingSchema.pre('save', function(next) {
    if (!this.bookingCode) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
        const prefix = this.bookingType === 'walkin' ? 'WI' : 'BK';
        this.bookingCode = `${prefix}-${timestamp}${random}`;
    }
    next();
});

// Indexes
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ bookingCode: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ categoryId: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index(
    { serviceId: 1, bookingDate: 1, timeSlot: 1 },
    { unique: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;