import mongoose from 'mongoose';
import crypto from 'crypto';
import {
    TIME_SLOTS,
    BOOKING_STATUSES,
    BOOKING_TYPES,
    PAYMENT_METHODS,
    PAYMENT_STATUSES
} from '../utils/constants.js';

const bookingSchema = new mongoose.Schema({
    bookingCode: {
        type: String,
        unique: true
    },
    bookingType: {
        type: String,
        enum: BOOKING_TYPES,
        default: 'online'
    },

    // Customer
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    walkInCustomer: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' }
    },

    // Category
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    categoryName: {
        type: String,
        required: true
    },

    // Subcategory
    subcategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: [true, 'Subcategory is required']
    },
    subcategoryName: {
        type: String,
        required: true
    },

    // Service
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

    // Date & Time
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    timeSlot: {
        type: String,
        required: [true, 'Time slot is required'],
        enum: TIME_SLOTS
    },

    // Slot lock
    slotLockKey: {
        type: String,
        default: null,
        sparse: true
    },

    // Location
    location: {
        address: { type: String, required: [true, 'Address is required'] },
        city: { type: String, required: [true, 'City is required'] },
    },

    // Contact phone number for this booking
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[\d\s\-]{7,15}$/, 'Please enter a valid phone number']
    },

    // Status
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

    isReviewed: { type: Boolean, default: false },
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
}, { timestamps: true });

// Auto generate booking code + slot lock key
bookingSchema.pre('save', function (next) {
    if (!this.bookingCode) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
        const prefix = this.bookingType === 'walkin' ? 'WI' : 'BK';
        this.bookingCode = `${prefix}-${timestamp}${random}`;
    }

    // Generate unique key for cancelled bookings instead of null
    if (this.status === 'cancelled') {
        this.slotLockKey = `CANCELLED_${this._id}_${Date.now()}`;
        console.log(`🗑️ Cancelled booking locked with key: ${this.slotLockKey}`);
    } else {
        // Generate active slot lock key
        const d = new Date(this.bookingDate);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        this.slotLockKey = `${dateStr}|${this.timeSlot}`;
        console.log(`📍 Booking slot locked with key: ${this.slotLockKey}`);
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
bookingSchema.index({ subcategoryId: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ createdAt: -1 });

// Unique index only for active slots
bookingSchema.index(
    { slotLockKey: 1 },
    { 
        unique: true, 
        sparse: true,
        partialFilterExpression: { slotLockKey: { $regex: '^\\d{4}-\\d{2}-\\d{2}\\|' } }
    }
);

// Virtuals
bookingSchema.virtual('isUpcoming').get(function () {
    if (['cancelled', 'completed'].includes(this.status)) return false;
    const bookingDateTime = new Date(this.bookingDate);
    const [startHour] = this.timeSlot.split('-')[0].split(':');
    bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);
    return bookingDateTime > new Date();
});

bookingSchema.virtual('canCancel').get(function () {
    if (!['pending', 'confirmed'].includes(this.status)) return false;
    const bookingDateTime = new Date(this.bookingDate);
    const [startHour] = this.timeSlot.split('-')[0].split(':');
    bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);
    const cancelDeadline = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
    return new Date() < cancelDeadline;
});

// Static: get available slots
bookingSchema.statics.getAvailableSlots = async function (date) {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const bookedSlots = await this.find({
        slotLockKey: { $regex: `^${dateStr}\\|` },
        status: { $in: ['pending', 'confirmed'] }
    }).select('timeSlot');
    const bookedSlotNames = bookedSlots.map(b => b.timeSlot);
    return TIME_SLOTS.filter(slot => !bookedSlotNames.includes(slot));
};

// Static: get user stats
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
        completed: 0,
        cancelled: 0,
        totalSpent: 0
    };

    stats.forEach(s => {
        result[s._id] = s.count;
        result.total += s.count;
        if (s._id === 'completed') result.totalSpent = s.totalSpent;
    });

    return result;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;