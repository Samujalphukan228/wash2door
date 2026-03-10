// controllers/reviewController.js

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// ============================================
// CREATE REVIEW
// ============================================

export const createReview = async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        if (!bookingId || !rating) {
            return res.status(400).json({
                success: false,
                message: 'Booking ID and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if booking exists and belongs to user
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: req.user._id
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Can only review completed bookings
        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'You can only review completed bookings'
            });
        }

        // Check if already reviewed
        if (booking.isReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        // Create review
        const review = await Review.create({
            bookingId,
            customerId: req.user._id,
            serviceId: booking.serviceId,
            rating,
            comment: comment || ''
        });

        // Mark booking as reviewed
        booking.isReviewed = true;
        await booking.save();

        const populatedReview = await Review.findById(review._id)
            .populate('customerId', 'firstName lastName avatar');

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully!',
            data: populatedReview
        });

    } catch (error) {
        console.error('Create review error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to submit review'
        });
    }
};

// ============================================
// GET MY REVIEWS
// ============================================

export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ customerId: req.user._id })
            .populate('serviceId', 'name image')
            .populate('bookingId', 'bookingCode bookingDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews'
        });
    }
};

// ============================================
// UPDATE MY REVIEW
// ============================================

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findOne({
            _id: reviewId,
            customerId: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: review
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review'
        });
    }
};

// ============================================
// DELETE MY REVIEW
// ============================================

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findOneAndDelete({
            _id: reviewId,
            customerId: req.user._id
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Mark booking as not reviewed
        await Booking.findByIdAndUpdate(review.bookingId, {
            isReviewed: false
        });

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete review'
        });
    }
};