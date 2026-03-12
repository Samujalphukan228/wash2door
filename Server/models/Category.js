// models/Category.js

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
        // e.g "Car Wash", "Sofa Cleaning", "Shoe Cleaning"
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    icon: {
        type: String,
        default: ''
        // icon name or emoji for frontend
        // e.g "🚗", "🛋️", "👟" or "car-icon"
    },
    image: {
        url: {
            type: String,
            default: 'default-category.jpg'
        },
        publicId: {
            type: String,
            default: ''
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    totalServices: {
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
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

// Auto generate slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual: get services in this category
categorySchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'category',
    justOne: false
});

const Category = mongoose.model('Category', categorySchema);

export default Category;