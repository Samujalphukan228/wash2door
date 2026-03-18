// models/Service.js - NO VARIANTS

import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
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
    images: {
        type: [
            {
                url: { type: String, required: true },
                publicId: { type: String, default: '' },
                isPrimary: { type: Boolean, default: false }
            }
        ],
        validate: {
            validator: function (images) {
                return images.length <= 3;
            },
            message: 'Maximum 3 images allowed'
        },
        default: []
    },
    highlights: { type: [String], default: [] },
    includes: { type: [String], default: [] },
    excludes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
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
serviceSchema.index({ subcategory: 1, tier: 1 }, { unique: true });

// Pre save
serviceSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    if (this.images && this.images.length > 0) {
        const hasPrimary = this.images.some(img => img.isPrimary);
        if (!hasPrimary) this.images[0].isPrimary = true;
    }
    next();
});

// Post save - update subcategory service count
serviceSchema.post('save', async function () {
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

// Post delete
serviceSchema.post('findOneAndDelete', async function (doc) {
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
serviceSchema.virtual('primaryImage').get(function () {
    if (!this.images || this.images.length === 0) return 'default-service.jpg';
    const primary = this.images.find(img => img.isPrimary);
    return primary ? primary.url : this.images[0].url;
});

serviceSchema.virtual('finalPrice').get(function () {
    return this.discountPrice !== null && this.discountPrice !== undefined
        ? this.discountPrice
        : this.price;
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;