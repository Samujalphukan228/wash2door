// models/Service.js - COMPLETE REBUILD

import mongoose from 'mongoose';

// ============================================
// VEHICLE TYPE SUB-SCHEMA
// ============================================
const vehicleTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'],
        required: [true, 'Vehicle type is required']
    },
    label: {
        type: String,
        required: [true, 'Vehicle label is required'],
        trim: true
        // e.g "Sedan", "SUV / MUV", "Hatchback"
    },
    description: {
        type: String,
        trim: true,
        default: ''
        // e.g "Perfect for sedans up to 5 seater"
    },
    image: {
        type: String,
        default: 'default-vehicle.jpg'
        // 1 image per vehicle type
    },
    imagePublicId: {
        type: String,
        default: ''
        // cloudinary public_id for deletion
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute']
        // in minutes
    },
    features: {
        type: [String],
        default: []
        // Different features per vehicle type
        // e.g ["Exterior Wash", "Tire Cleaning", "Window Clean"]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
        // for sorting in frontend
    }
});

// ============================================
// MAIN SERVICE SCHEMA
// ============================================
const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true,
        unique: true
        // e.g "Basic Car Wash", "Standard Wash", "Premium Wash"
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
        // e.g "basic-car-wash" - auto generated
    },
    description: {
        type: String,
        required: [true, 'Service description is required'],
        trim: true
        // Detailed about the service
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [200, 'Short description max 200 characters'],
        default: ''
        // Short summary for cards
    },
    category: {
        type: String,
        enum: ['basic', 'standard', 'premium'],
        required: [true, 'Category is required']
    },

    // ============================================
    // 3 SERVICE IMAGES
    // ============================================
    images: {
        type: [
            {
                url: { type: String, required: true },
                publicId: { type: String, default: '' },
                isPrimary: { type: Boolean, default: false }
            }
        ],
        validate: {
            validator: function(images) {
                return images.length <= 3;
            },
            message: 'Maximum 3 images allowed per service'
        },
        default: []
    },

    // ============================================
    // VEHICLE TYPES (Sub-services)
    // ============================================
    vehicleTypes: {
        type: [vehicleTypeSchema],
        validate: {
            validator: function(types) {
                return types.length > 0;
            },
            message: 'At least one vehicle type is required'
        }
    },

    // ============================================
    // GENERAL SERVICE FEATURES
    // (Overall what service includes)
    // ============================================
    highlights: {
        type: [String],
        default: []
        // e.g ["Eco-friendly products", "30-day guarantee", "Expert staff"]
    },

    // ============================================
    // WHAT'S INCLUDED (for display)
    // ============================================
    includes: {
        type: [String],
        default: []
        // e.g ["Free re-wash if not satisfied", "Microfiber cloth wipe"]
    },

    // ============================================
    // WHAT'S NOT INCLUDED
    // ============================================
    excludes: {
        type: [String],
        default: []
        // e.g ["Engine cleaning", "Paint correction"]
    },

    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },

    // ============================================
    // STATS (auto calculated)
    // ============================================
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalBookings: {
        type: Number,
        default: 0
    },

    // Starting price (auto set from cheapest vehicle type)
    startingPrice: {
        type: Number,
        default: 0
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================
// INDEXES
// ============================================
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ startingPrice: 1 });

// ============================================
// PRE SAVE - Auto generate slug & startingPrice
// ============================================
serviceSchema.pre('save', function(next) {
    // Auto generate slug from name
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Auto calculate starting price from vehicle types
    if (this.vehicleTypes && this.vehicleTypes.length > 0) {
        const prices = this.vehicleTypes
            .filter(v => v.isActive)
            .map(v => v.price);

        this.startingPrice = prices.length > 0 ? Math.min(...prices) : 0;
    }

    // Set first image as primary if none set
    if (this.images && this.images.length > 0) {
        const hasPrimary = this.images.some(img => img.isPrimary);
        if (!hasPrimary) {
            this.images[0].isPrimary = true;
        }
    }

    next();
});

// ============================================
// VIRTUAL - Primary image
// ============================================
serviceSchema.virtual('primaryImage').get(function() {
    if (!this.images || this.images.length === 0) {
        return 'default-service.jpg';
    }
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
});

// ============================================
// VIRTUAL - Price range
// ============================================
serviceSchema.virtual('priceRange').get(function() {
    if (!this.vehicleTypes || this.vehicleTypes.length === 0) {
        return { min: 0, max: 0 };
    }
    const prices = this.vehicleTypes
        .filter(v => v.isActive)
        .map(v => v.price);

    return {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;