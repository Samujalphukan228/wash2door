// models/Review.js - UPDATED

import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },

    // Extra info from booking
    serviceName: {
        type: String,
        default: ''
    },
    categoryName: {
        type: String,
        default: ''
    },
    variantName: {
        type: String,
        default: ''
    },

    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Review cannot exceed 500 characters'],
        default: ''
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

reviewSchema.index({ serviceId: 1 });
reviewSchema.index({ customerId: 1 });
reviewSchema.index({ isVisible: 1 });
reviewSchema.index({ rating: 1 });

// Auto update service rating after save
reviewSchema.post('save', async function() {
    try {
        const Review = this.constructor;
        const Service = mongoose.model('Service');

        const stats = await Review.aggregate([
            {
                $match: {
                    serviceId: this.serviceId,
                    isVisible: true
                }
            },
            {
                $group: {
                    _id: '$serviceId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);

        if (stats.length > 0) {
            await Service.findByIdAndUpdate(this.serviceId, {
                averageRating: Math.round(stats[0].averageRating * 10) / 10,
                totalReviews: stats[0].totalReviews
            });
        }
    } catch (error) {
        console.error('Error updating service rating:', error);
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;