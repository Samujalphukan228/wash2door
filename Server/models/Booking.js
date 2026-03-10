import mongoose from 'mongoose';
import crypto from 'crypto';

const bookingSchema = new mongoose.Schema({
    // ============================================
    // BOOKING CODE
    // ============================================
    bookingCode: {
        type: String,
        unique: true
    },

    // ============================================
    // BOOKING TYPE
    // ✅ NEW: online = customer booked, walkin = admin created
    // ============================================
    bookingType: {
        type: String,
        enum: ['online', 'walkin'],
        default: 'online'
    },

    // ============================================
    // CUSTOMER (registered user - optional for walkin)
    // ============================================
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // ============================================
    // WALK-IN CUSTOMER INFO
    // ✅ NEW: For offline/walk-in customers
    // ============================================
    walkInCustomer: {
        name: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        email: {
            type: String,
            default: ''
        }
    },

    // ============================================
    // SERVICE INFO (Step 1)
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
    serviceCategory: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: true
    },

    // ============================================
    // VEHICLE TYPE INFO (Step 2)
    // ============================================
    vehicleTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Vehicle type is required']
    },
    vehicleTypeName: {
        type: String,
        required: true
    },
    vehicleType: {
        type: String,
        enum: ['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'],
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
    // DATE & TIME (Step 3)
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
    // LOCATION & VEHICLE DETAILS (Step 4)
    // ============================================
    location: {
        address: {
            type: String,
            default: 'Walk-in / At Shop'
        },
        city: {
            type: String,
            default: 'Walk-in'
        },
        state: {
            type: String,
            default: ''
        },
        zipCode: {
            type: String,
            default: ''
        },
        landmark: {
            type: String,
            default: ''
        }
    },
    vehicleDetails: {
        type: {
            type: String,
            enum: ['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'],
            required: [true, 'Vehicle type is required']
        },
        brand: {
            type: String,
            default: ''
        },
        model: {
            type: String,
            default: ''
        },
        color: {
            type: String,
            default: ''
        },
        plateNumber: {
            type: String,
            default: ''
        }
    },
    specialNotes: {
        type: String,
        default: '',
        maxlength: [500, 'Special notes cannot exceed 500 characters']
    },

    // ============================================
    // BOOKING STATUS
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
    // REVIEW
    // ============================================
    isReviewed: {
        type: Boolean,
        default: false
    },

    // ============================================
    // PAYMENT
    // ✅ UPDATED: Added card and online options
    // ============================================
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

    // ============================================
    // CREATED BY (for walkin - which admin created)
    // ✅ NEW
    // ============================================
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }

}, {
    timestamps: true
});

// ============================================
// AUTO GENERATE BOOKING CODE
// ============================================
bookingSchema.pre('save', function(next) {
    if (!this.bookingCode) {
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const timestamp = Date.now().toString(36).toUpperCase().slice(-3);
        // ✅ WI prefix for walk-in, CW for online
        const prefix = this.bookingType === 'walkin' ? 'WI' : 'CW';
        this.bookingCode = `${prefix}-${timestamp}${random}`;
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
bookingSchema.index({ bookingType: 1 });

// ✅ Unique index to prevent race condition double booking
bookingSchema.index(
    { serviceId: 1, bookingDate: 1, timeSlot: 1 },
    { unique: true }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;