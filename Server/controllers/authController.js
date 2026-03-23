// controllers/authController.js - Link-Based Registration

import crypto from 'crypto';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { deleteCloudinaryImage, getPublicIdFromUrl } from '../config/cloudinary.js';
import {
    generateTokens,
    setTokenCookies,
    clearTokenCookies,
    verifyRefreshToken
} from '../utils/generateToken.js';
import {
    sendRegistrationVerificationEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangeConfirmation
} from '../utils/sendEmail.js';

// ============================================
// REGISTER (Link-Based)
// ============================================

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        // 1. Check if user exists
        const registrationCheck = await User.findForRegistration(normalizedEmail);

        // 2. If registration exists and is NOT completed, delete it to allow a fresh start
        if (registrationCheck.exists && registrationCheck.user.registrationStatus !== 'completed') {
            await User.deleteOne({ _id: registrationCheck.user._id });
        } 
        // If registration is truly completed, we block them
        else if (registrationCheck.exists && registrationCheck.user.registrationStatus === 'completed') {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // 3. Create new user
        let user;
        try {
            user = await User.create({
                firstName,
                lastName,
                email: normalizedEmail,
                password,
                registrationStatus: 'pending'
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use. Please try again.'
                });
            }
            throw createError;
        }

        // 4. Generate verification token
        const verificationToken = user.generateEmailVerificationToken();
        user.registrationStatus = 'verification-sent';
        await user.save({ validateBeforeSave: false });

        // 5. Send verification email with link
        try {
            await sendRegistrationVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Verification email failed:', emailError.message);
            user.registrationStatus = 'failed';
            await user.save({ validateBeforeSave: false });

            return res.status(503).json({
                success: false,
                message: 'Failed to send verification email. Please try again.',
                error: 'email_failed'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration initiated! Check your email for verification link.',
            data: {
                email: user.email,
                nextStep: 'verify-email',
                linkExpiresIn: '1 hour'
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// ============================================
// VERIFY REGISTRATION (Link-Based)
// ============================================

export const verifyRegistration = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
            registrationStatus: { $ne: 'completed' }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification link. Please register again.'
            });
        }

        // Complete registration
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        user.registrationStatus = 'completed';
        user.registrationCompletedAt = new Date();
        await user.save({ validateBeforeSave: false });

        // Generate tokens and log user in
        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        // Send welcome email
        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Welcome email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Email verified! Registration complete.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role
                },
                accessToken
            }
        });

    } catch (error) {
        console.error('Verify registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed. Please try again.'
        });
    }
};

// ============================================
// RESEND REGISTRATION EMAIL
// ============================================

export const resendRegistrationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        if (user.registrationStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'This account is already registered. Please login.'
            });
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        user.registrationStatus = 'verification-sent';
        await user.save({ validateBeforeSave: false });

        // Send verification email
        try {
            await sendRegistrationVerificationEmail(user, verificationToken);
        } catch (emailError) {
            return res.status(503).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New verification link sent to your email',
            data: {
                email: user.email,
                linkExpiresIn: '1 hour'
            }
        });

    } catch (error) {
        console.error('Resend registration email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend verification email.'
        });
    }
};

// ============================================
// LOGIN
// ============================================

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (user.registrationStatus !== 'completed') {
            return res.status(403).json({
                success: false,
                message: 'Registration incomplete. Please verify your email.',
                registrationStatus: user.registrationStatus,
                nextStep: 'verify-email'
            });
        }

        if (user.isLocked()) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Account locked. Try again in ${lockTimeRemaining} minutes.`
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account deactivated. Contact support.'
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Account blocked. Contact support.',
                reason: user.blockedReason
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            const updatedAttempts = user.loginAttempts + 1;
            const remainingAttempts = Math.max(0, 5 - updatedAttempts);

            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                remainingAttempts: remainingAttempts > 0 ? remainingAttempts : undefined
            });
        }

        await user.resetLoginAttempts();

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role,
                    avatar: user.avatar
                },
                accessToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed.'
        });
    }
};

// ============================================
// LOGOUT
// ============================================

export const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $unset: { refreshToken: 1 }
        });

        clearTokenCookies(res);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
};

// ============================================
// REFRESH TOKEN
// ============================================

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token not provided'
            });
        }

        const decoded = verifyRefreshToken(token);

        if (!decoded) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        const user = await User.findOne({
            _id: decoded.id,
            refreshToken: token,
            registrationStatus: 'completed'
        });

        if (!user || !user.isActive) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, newRefreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed',
            data: { accessToken }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        clearTokenCookies(res);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
};

// ============================================
// VERIFY EMAIL (For existing users)
// ============================================

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
            registrationStatus: 'completed'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed'
        });
    }
};

// ============================================
// RESEND VERIFICATION EMAIL (For existing users)
// ============================================

export const resendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            return res.status(503).json({
                success: false,
                message: 'Unable to send verification email'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification email sent!'
        });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification email'
        });
    }
};

// ============================================
// FORGOT PASSWORD
// ============================================

export const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const successMessage = 'If an account exists, a reset link has been sent';

        const user = await User.findOne({
            email: email.toLowerCase(),
            registrationStatus: 'completed'
        });

        if (!user || !user.isActive) {
            return res.status(200).json({
                success: true,
                message: successMessage
            });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user, resetToken);
        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(503).json({
                success: false,
                message: 'Email could not be sent'
            });
        }

        res.status(200).json({
            success: true,
            message: successMessage
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process request'
        });
    }
};

// ============================================
// RESET PASSWORD
// ============================================

export const resetPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { token } = req.params;
        const { password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpire: { $gt: Date.now() },
            registrationStatus: 'completed'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        user.refreshToken = undefined;
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        clearTokenCookies(res);

        try {
            await sendPasswordChangeConfirmation(user);
        } catch (emailError) {
            console.error('Password change email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed'
        });
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================

export const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        user.refreshToken = undefined;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        try {
            await sendPasswordChangeConfirmation(user);
        } catch (emailError) {
            console.error('Password change email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            data: { accessToken }
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password change failed'
        });
    }
};

// ============================================
// GET ME
// ============================================

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    isBlocked: user.isBlocked,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
};

// ============================================
// UPDATE PROFILE
// ============================================

export const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, avatar } = req.body;

        const updateFields = {};
        if (firstName) updateFields.firstName = firstName.trim();
        if (lastName) updateFields.lastName = lastName.trim();
        if (avatar) updateFields.avatar = avatar;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    avatar: user.avatar,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Profile update failed'
        });
    }
};

// ============================================
// UPDATE AVATAR
// ============================================

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image uploaded'
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            if (req.file.filename) {
                await deleteCloudinaryImage(req.file.filename);
            }
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old avatar if exists
        if (user.avatar && !user.avatar.includes('default')) {
            const publicId = user.avatar.startsWith('http') 
                ? getPublicIdFromUrl(user.avatar)
                : user.avatar;
            
            if (publicId) {
                await deleteCloudinaryImage(publicId);
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { avatar: req.file.path },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: { 
                avatar: updatedUser.avatar,
                avatarPublicId: req.file.filename
            }
        });

    } catch (error) {
        console.error('Update avatar error:', error);
        
        if (req.file?.filename) {
            await deleteCloudinaryImage(req.file.filename);
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update avatar'
        });
    }
};

// ============================================
// DEACTIVATE ACCOUNT
// ============================================

export const deactivateAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password required to deactivate account'
            });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }

        user.isActive = false;
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        clearTokenCookies(res);

        res.status(200).json({
            success: true,
            message: 'Account deactivated. Contact support to reactivate.'
        });

    } catch (error) {
        console.error('Deactivate error:', error);
        res.status(500).json({
            success: false,
            message: 'Account deactivation failed'
        });
    }
};

// ============================================
// GET USER STATS
// ============================================

export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const [
            totalBookings,
            pendingBookings,
            confirmedBookings,
            inProgressBookings,
            completedBookings,
            cancelledBookings,
            totalReviews
        ] = await Promise.all([
            Booking.countDocuments({ customerId: userId }),
            Booking.countDocuments({ customerId: userId, status: 'pending' }),
            Booking.countDocuments({ customerId: userId, status: 'confirmed' }),
            Booking.countDocuments({ customerId: userId, status: 'in-progress' }),
            Booking.countDocuments({ customerId: userId, status: 'completed' }),
            Booking.countDocuments({ customerId: userId, status: 'cancelled' }),
            Review.countDocuments({ customerId: userId })
        ]);

        const totalSpentData = await Booking.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(userId),
                    status: 'completed'
                }
            },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);

        const mostUsedService = await Booking.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(userId),
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const recentBookings = await Booking.find({ customerId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('bookingCode serviceName bookingDate timeSlot status price');

        const activeBookings = await Booking.find({
            customerId: userId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        })
            .sort({ bookingDate: 1 })
            .select('bookingCode serviceName bookingDate timeSlot status price location');

        res.status(200).json({
            success: true,
            data: {
                bookings: {
                    total: totalBookings,
                    pending: pendingBookings,
                    confirmed: confirmedBookings,
                    inProgress: inProgressBookings,
                    completed: completedBookings,
                    cancelled: cancelledBookings
                },
                totalSpent: totalSpentData[0]?.total || 0,
                totalReviews,
                mostUsedService: mostUsedService[0] || null,
                recentBookings,
                activeBookings
            }
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user stats',
            error: error.message
        });
    }
};

// ============================================
// CHECK REGISTRATION STATUS
// ============================================

export const checkRegistrationStatus = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(200).json({
                success: true,
                exists: false,
                canRegister: true
            });
        }

        res.status(200).json({
            success: true,
            exists: true,
            registrationStatus: user.registrationStatus,
            isEmailVerified: user.isEmailVerified,
            canRetry: user.registrationStatus !== 'completed'
        });

    } catch (error) {
        console.error('Check registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check registration status'
        });
    }
};