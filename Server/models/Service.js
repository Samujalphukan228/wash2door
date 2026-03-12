// models/Service.js

import mongoose from 'mongoose';

// ============================================
// VARIANT SUB-SCHEMA
// Generic: works for any category
// Car Wash → "Sedan", "SUV", "Hatchback"
// Sofa     → "2 Seater", "3 Seater", "L-Shape"
// Shoes    → "Sneakers", "Leather", "Boots"
// ============================================
const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Variant name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    image: {
        url: {
            type: String,
            default: 'default-variant.jpg'
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    discountPrice: {
        type: Number,
        default: null
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
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    }
});

// ============================================
// MAIN SERVICE SCHEMA
// ============================================
const serviceSchema = new mongoose.Schema({
    // Reference to Category
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },

    name: {
        type: String,
        required: [true, 'Service name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: [200, 'Short description max 200 characters'],
        default: ''
    },

    // Service tier for visual badges
    tier: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'custom'],
        default: 'basic'
    },

    // Service images (max 3)
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
            message: 'Maximum 3 images allowed'
        },
        default: []
    },

    // Variants (the pricing options)
    variants: {
        type: [variantSchema],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one variant is required'
        }
    },

    // Service info lists
    highlights: {
        type: [String],
        default: []
    },
    includes: {
        type: [String],
        default: []
    },
    excludes: {
        type: [String],
        default: []
    },

    // Meta
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },

    // Stats
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

    // Auto calculated from cheapest active variant
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
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, displayOrder: 1 });
serviceSchema.index({ isFeatured: 1, isActive: 1 });
serviceSchema.index({ startingPrice: 1 });
serviceSchema.index({ category: 1, name: 1 }, { unique: true });

// ============================================
// PRE SAVE
// ============================================
serviceSchema.pre('save', function(next) {
    // Auto generate slug
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Auto calculate starting price
    if (this.variants && this.variants.length > 0) {
        const activePrices = this.variants
            .filter(v => v.isActive)
            .map(v => v.discountPrice !== null && v.discountPrice !== undefined
                ? v.discountPrice
                : v.price
            );

        this.startingPrice = activePrices.length > 0
            ? Math.min(...activePrices)
            : 0;
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
// POST SAVE - Update category service count
// ============================================
serviceSchema.post('save', async function() {
    try {
        const count = await this.constructor.countDocuments({
            category: this.category,
            isActive: true
        });
        await mongoose.model('Category').findByIdAndUpdate(
            this.category,
            { totalServices: count }
        );
    } catch (err) {
        console.error('Error updating category count:', err);
    }
});

// ============================================
// POST DELETE - Update category service count
// ============================================
serviceSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        try {
            const count = await mongoose.model('Service').countDocuments({
                category: doc.category,
                isActive: true
            });
            await mongoose.model('Category').findByIdAndUpdate(
                doc.category,
                { totalServices: count }
            );
        } catch (err) {
            console.error('Error updating category count:', err);
        }
    }
});

// ============================================
// VIRTUALS
// ============================================
serviceSchema.virtual('primaryImage').get(function() {
    if (!this.images || this.images.length === 0) {
        return 'default-service.jpg';
    }
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
});

serviceSchema.virtual('priceRange').get(function() {
    if (!this.variants || this.variants.length === 0) {
        return { min: 0, max: 0 };
    }
    const prices = this.variants
        .filter(v => v.isActive)
        .map(v => v.discountPrice !== null && v.discountPrice !== undefined
            ? v.discountPrice
            : v.price
        );

    return {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0
    };
});

serviceSchema.virtual('activeVariants').get(function() {
    if (!this.variants) return [];
    return this.variants.filter(v => v.isActive);
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;