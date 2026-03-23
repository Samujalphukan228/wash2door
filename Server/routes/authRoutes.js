// routes/authRoutes.js - Link-Based Registration with All Features

import express from 'express';
import {
    register,
    verifyRegistration,
    resendRegistrationEmail,
    login,
    logout,
    refreshToken,
    verifyEmail,
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    getMe,
    updateProfile,
    updateAvatar,
    deactivateAccount,
    getUserStats,
    checkRegistrationStatus
} from '../controllers/authController.js';

import { protect } from '../middleware/auth.js';
import {
    authLimiter,
    passwordResetLimiter,
    emailVerificationLimiter
} from '../middleware/rateLimiter.js';
import {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator,
    verifyEmailValidator
} from '../validators/authValidator.js';
import { handleAvatarUpload } from '../middleware/uploadMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// ============================================
// REGISTRATION (Link-Based - NEW)
// ============================================
router.post('/register', authLimiter, registerValidator, register);
router.get('/verify-registration/:token', emailVerificationLimiter, verifyRegistration);
router.post('/resend-registration-email', authLimiter, resendRegistrationEmail);

// ============================================
// AUTHENTICATION
// ============================================
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

// ============================================
// EMAIL VERIFICATION (For existing users)
// ============================================
router.get(
    '/verify-email/:token',
    emailVerificationLimiter,
    verifyEmailValidator,
    verifyEmail
);
router.post(
    '/resend-verification',
    protect,
    emailVerificationLimiter,
    resendVerificationEmail
);

// ============================================
// PASSWORD
// ============================================
router.post(
    '/forgot-password',
    passwordResetLimiter,
    forgotPasswordValidator,
    forgotPassword
);
router.post(
    '/reset-password/:token',
    resetPasswordValidator,
    resetPassword
);
router.put(
    '/change-password',
    protect,
    changePasswordValidator,
    changePassword
);

// ============================================
// USER PROFILE
// ============================================
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-avatar', protect, handleAvatarUpload, updateAvatar);
router.delete('/deactivate', protect, deactivateAccount);

// ============================================
// USER STATS
// ============================================
router.get('/me/stats', protect, getUserStats);

// ============================================
// UTILITY
// ============================================
router.post('/check-registration', checkRegistrationStatus);

// ============================================
// SETUP FIRST ADMIN (Protected - Dev/Setup Only)
// ============================================
if (process.env.NODE_ENV === 'development' || process.env.ALLOW_ADMIN_SETUP === 'true') {
    router.post('/setup-admin', async (req, res) => {
        try {
            const adminExists = await User.findOne({ role: 'admin' });

            if (adminExists) {
                return res.status(403).json({
                    success: false,
                    message: 'Admin already exists. This route is disabled.'
                });
            }

            const { email, password, setupKey } = req.body;

            // Require setup key in production
            if (process.env.NODE_ENV !== 'development') {
                if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
                    return res.status(403).json({
                        success: false,
                        message: 'Invalid setup key'
                    });
                }
            }

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const user = await User.findOne({
                email: email.toLowerCase(),
                registrationStatus: 'completed'
            });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found. Register first.'
                });
            }

            const userWithPassword = await User.findById(user._id).select('+password');

            const isValid = await userWithPassword.comparePassword(password);

            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid password'
                });
            }

            user.role = 'admin';
            await user.save({ validateBeforeSave: false });

            res.status(200).json({
                success: true,
                message: `${user.email} is now an admin!`,
                data: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Setup admin error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to setup admin'
            });
        }
    });
}

// ============================================
// DEBUG ROUTES (Development only)
// ============================================
if (process.env.NODE_ENV === 'development') {
    // Debug user status
    router.get('/debug/:email', async (req, res) => {
        try {
            const { email } = req.params;
            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    debug: { email, exists: false }
                });
            }

            res.status(200).json({
                success: true,
                debug: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    registrationStatus: user.registrationStatus,
                    isEmailVerified: user.isEmailVerified,
                    isActive: user.isActive,
                    isBlocked: user.isBlocked,
                    role: user.role,
                    createdAt: user.createdAt
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Debug failed',
                error: error.message
            });
        }
    });

    // Delete user completely
    router.delete('/delete-user/:email', async (req, res) => {
        try {
            const { email } = req.params;
            const { confirm } = req.query;

            if (confirm !== 'yes') {
                return res.status(400).json({
                    success: false,
                    message: 'Add ?confirm=yes to confirm deletion'
                });
            }

            const user = await User.findOne({ email: email.toLowerCase() });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            await User.deleteOne({ _id: user._id });

            res.status(200).json({
                success: true,
                message: `User ${email} deleted successfully`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to delete user',
                error: error.message
            });
        }
    });
}

export default router;