// models/WalkInCustomer.js

import mongoose from 'mongoose';

const walkInCustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^\+?[\d\s\-]{7,15}$/, 'Please enter a valid phone number']
    },

    // ✅ NEW
    address: {
        type: String,
        default: 'Walk-in / At Shop',
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },

    // ✅ NEW
    city: {
        type: String,
        default: 'Duliajan',
        trim: true,
        maxlength: [100, 'City cannot exceed 100 characters']
    },

    notes: {
        type: String,
        default: '',
        maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    lastBookingDate: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes
walkInCustomerSchema.index({ name: 'text', phone: 'text' });
walkInCustomerSchema.index({ phone: 1 }, { unique: true });
walkInCustomerSchema.index({ createdAt: -1 });
walkInCustomerSchema.index({ totalBookings: -1 });

// Static: Search customers
walkInCustomerSchema.statics.search = async function (query, limit = 10) {
    const searchRegex = new RegExp(query, 'i');
    return this.find({
        isActive: true,
        $or: [
            { name: searchRegex },
            { phone: searchRegex }
        ]
    })
        .sort({ totalBookings: -1, lastBookingDate: -1 })
        .limit(limit);
};

// Static: Increment booking count
walkInCustomerSchema.statics.incrementBookingCount = async function (customerId) {
    return this.findByIdAndUpdate(
        customerId,
        {
            $inc: { totalBookings: 1 },
            $set: { lastBookingDate: new Date() }
        },
        { new: true }
    );
};

const WalkInCustomer = mongoose.model('WalkInCustomer', walkInCustomerSchema);

export default WalkInCustomer;