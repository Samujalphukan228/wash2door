// controllers/reviewController.js - FIXED

import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

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

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

        const ratingNum = Number(rating);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

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

        if (booking.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'You can only review completed bookings'
            });
        }

        if (booking.isReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this booking'
            });
        }

        const review = await Review.create({
            bookingId: booking._id,
            customerId: req.user._id,
            serviceId: booking.serviceId,
            rating: ratingNum,
            comment: comment || '',
            serviceName: booking.serviceName,
            categoryName: booking.categoryName,
            variantName: booking.variantName
        });

        booking.isReviewed = true;
        await booking.save();

        const populatedReview = await Review.findById(review._id)
            .populate('customerId', 'firstName lastName avatar')
            .populate('serviceId', 'name category');

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
            message: 'Failed to submit review',
            error: error.message
        });
    }
};

// ============================================
// CHECK IF CAN REVIEW
// ============================================

export const canReview = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking ID'
            });
        }

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

        const canReviewBooking = booking.status === 'completed' && !booking.isReviewed;

        res.status(200).json({
            success: true,
            data: {
                canReview: canReviewBooking,
                reason: !canReviewBooking
                    ? booking.isReviewed
                        ? 'Already reviewed'
                        : `Booking is ${booking.status}`
                    : null,
                booking: {
                    bookingCode: booking.bookingCode,
                    serviceName: booking.serviceName,
                    variantName: booking.variantName,
                    status: booking.status,
                    isReviewed: booking.isReviewed
                }
            }
        });

    } catch (error) {
        console.error('Can review error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking review status',
            error: error.message
        });
    }
};

// ============================================
// GET MY REVIEWS
// ============================================

export const getMyReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const total = await Review.countDocuments({
            customerId: req.user._id
        });

        const reviews = await Review.find({
            customerId: req.user._id
        })
            .populate('serviceId', 'name category images')
            .populate('bookingId', 'bookingCode bookingDate timeSlot')
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: reviews
        });

    } catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch reviews',
            error: error.message
        });
    }
};

// ============================================
// UPDATE REVIEW
// ============================================

export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }

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

        if (rating !== undefined) {
            const ratingNum = Number(rating);
            if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            review.rating = ratingNum;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate('customerId', 'firstName lastName avatar')
            .populate('serviceId', 'name category');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: updatedReview
        });

    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update review',
            error: error.message
        });
    }
};

// ============================================
// DELETE REVIEW
// ============================================

export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!isValidObjectId(reviewId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid review ID'
            });
        }

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
            message: 'Failed to delete review',
            error: error.message
        });
    }
};