// routes/authRoutes.js - UPDATED with protected setup-admin

import express from 'express';
import {
    register,
    verifyOTP,
    resendOTP,
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
    checkRegistrationStatus,
    debugUserStatus,
    deleteUserCompletely
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
// REGISTRATION
// ============================================
router.post('/register', authLimiter, registerValidator, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);

// ============================================
// AUTHENTICATION
// ============================================
router.post('/login', authLimiter, loginValidator, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);

// ============================================
// EMAIL VERIFICATION
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
    router.get('/debug/:email', debugUserStatus);
    router.delete('/delete-user/:email', deleteUserCompletely);
}

export default router;