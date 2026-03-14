// models/Booking.js

import mongoose from 'mongoose';
import crypto from 'crypto';
import {
    TIME_SLOTS,
    BOOKING_STATUSES,
    BOOKING_TYPES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    SERVICE_TIERS
} from '../utils/constants.js';

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
        enum: BOOKING_TYPES,
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
        enum: SERVICE_TIERS,
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
        enum: TIME_SLOTS
    },

    // ============================================
    // SLOT LOCK KEY (for global uniqueness)
    // Used to enforce: only ONE active booking per date+slot
    // Format: "YYYY-MM-DD|HH:MM-HH:MM"
    // Set to null when cancelled (so index ignores it)
    // ============================================
    slotLockKey: {
        type: String,
        default: null
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
    // NOTES
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
        enum: BOOKING_STATUSES,
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
        enum: PAYMENT_METHODS,
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: PAYMENT_STATUSES,
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

// ============================================
// AUTO GENERATE BOOKING CODE + SLOT LOCK KEY
// ============================================
bookingSchema.pre('save', function (next) {
    // Generate booking code
    if (!this.bookingCode) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
        const prefix = this.bookingType === 'walkin' ? 'WI' : 'BK';
        this.bookingCode = `${prefix}-${timestamp}${random}`;
    }

    // ============================================
    // SET OR CLEAR slotLockKey based on status
    // Active booking → set the key (enforces uniqueness)
    // Cancelled booking → null (releases the slot)
    // ============================================
    if (this.status === 'cancelled') {
        this.slotLockKey = null;
    } else {
        const dateStr = new Date(this.bookingDate).toISOString().split('T')[0];
        this.slotLockKey = `${dateStr}|${this.timeSlot}`;
    }

    next();
});

// ============================================
// INDEXES
// ============================================
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ bookingCode: 1 });
bookingSchema.index({ serviceId: 1 });
bookingSchema.index({ categoryId: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ createdAt: -1 });

// ============================================
// GLOBAL UNIQUE SLOT INDEX
// Only ONE active booking per date+timeSlot combo
// slotLockKey is null for cancelled bookings,
// so they are excluded by the sparse option
// ============================================
bookingSchema.index(
    { slotLockKey: 1 },
    {
        unique: true,
        sparse: true  // ignores documents where slotLockKey is null
    }
);

// ============================================
// VIRTUALS
// ============================================
bookingSchema.virtual('customerName').get(function () {
    if (this.bookingType === 'walkin') {
        return this.walkInCustomer?.name || 'Walk-in Customer';
    }
    return null;
});

bookingSchema.virtual('isUpcoming').get(function () {
    if (this.status === 'cancelled' || this.status === 'completed') {
        return false;
    }
    const now = new Date();
    const bookingDateTime = new Date(this.bookingDate);
    const [startHour] = this.timeSlot.split('-')[0].split(':');
    bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);
    return bookingDateTime > now;
});

bookingSchema.virtual('canCancel').get(function () {
    if (!['pending', 'confirmed'].includes(this.status)) {
        return false;
    }
    const now = new Date();
    const bookingDateTime = new Date(this.bookingDate);
    const [startHour] = this.timeSlot.split('-')[0].split(':');
    bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);
    const cancelDeadline = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
    return now < cancelDeadline;
});

// ============================================
// STATIC METHODS
// ============================================

// Get available slots for a date (GLOBAL - across all services)
bookingSchema.statics.getAvailableSlots = async function (date) {
    const bookingDate = new Date(date);
    const dateStr = bookingDate.toISOString().split('T')[0];

    // Find all locked slots for this date
    const bookedSlots = await this.find({
        slotLockKey: { $regex: `^${dateStr}\\|` }
    }).select('timeSlot');

    const bookedSlotNames = bookedSlots.map(b => b.timeSlot);

    return TIME_SLOTS.filter(slot => !bookedSlotNames.includes(slot));
};

// Get booking stats for a user
bookingSchema.statics.getUserStats = async function (userId) {
    const stats = await this.aggregate([
        { $match: { customerId: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalSpent: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'completed'] }, '$price', 0]
                    }
                }
            }
        }
    ]);

    const result = {
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0
    };

    stats.forEach(s => {
        result[s._id === 'in-progress' ? 'inProgress' : s._id] = s.count;
        result.total += s.count;
        if (s._id === 'completed') {
            result.totalSpent = s.totalSpent;
        }
    });

    return result;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;