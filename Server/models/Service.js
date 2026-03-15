// models/Service.js - COMPLETE WITH SUBCATEGORY

import mongoose from 'mongoose';

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

const serviceSchema = new mongoose.Schema({
    // Parent references
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        required: [true, 'Subcategory is required']
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

    tier: {
        type: String,
        enum: ['basic', 'standard', 'premium', 'custom'],
        default: 'basic'
    },

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

    variants: {
        type: [variantSchema],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'At least one variant is required'
        }
    },

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

// Indexes
serviceSchema.index({ category: 1, subcategory: 1, isActive: 1 });
serviceSchema.index({ subcategory: 1, isActive: 1, displayOrder: 1 });
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1, displayOrder: 1 });
serviceSchema.index({ isFeatured: 1, isActive: 1 });
serviceSchema.index({ startingPrice: 1 });
serviceSchema.index({ subcategory: 1, tier: 1 }, { unique: true });

// Pre save hooks
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

// Post save - update subcategory service count
serviceSchema.post('save', async function() {
    try {
        const count = await this.constructor.countDocuments({
            subcategory: this.subcategory,
            isActive: true
        });
        await mongoose.model('Subcategory').findByIdAndUpdate(
            this.subcategory,
            { totalServices: count }
        );
    } catch (err) {
        console.error('Error updating subcategory count:', err);
    }
});

// Post delete - update subcategory service count
serviceSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        try {
            const count = await mongoose.model('Service').countDocuments({
                subcategory: doc.subcategory,
                isActive: true
            });
            await mongoose.model('Subcategory').findByIdAndUpdate(
                doc.subcategory,
                { totalServices: count }
            );
        } catch (err) {
            console.error('Error updating subcategory count:', err);
        }
    }
});

// Virtuals
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