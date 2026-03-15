// models/Subcategory.js

import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subcategory name is required'],
        trim: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    image: {
        url: {
            type: String,
            default: 'default-subcategory.jpg'
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
subcategorySchema.index({ category: 1, slug: 1 });
subcategorySchema.index({ category: 1, isActive: 1, displayOrder: 1 });
subcategorySchema.index({ category: 1, name: 1 }, { unique: true });

// Auto generate slug
subcategorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Virtual: get services in this subcategory
subcategorySchema.virtual('services', {
    ref: 'Service',
    localField: '_id',
    foreignField: 'subcategory',
    justOne: false
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory;