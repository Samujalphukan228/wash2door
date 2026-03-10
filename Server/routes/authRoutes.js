// routes/authRoutes.js

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
    deactivateAccount,
    checkRegistrationStatus,
    debugUserStatus,
    deleteUserCompletely
} from '../controllers/authController.js';

import { protect, requireVerifiedEmail } from '../middleware/auth.js';
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

const router = express.Router();

// ============================================
// REGISTRATION FLOW
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

router.get('/verify-email/:token', emailVerificationLimiter, verifyEmailValidator, verifyEmail);

router.post('/resend-verification', protect, emailVerificationLimiter, resendVerificationEmail);

// ============================================
// PASSWORD MANAGEMENT
// ============================================

router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidator, forgotPassword);

router.post('/reset-password/:token', resetPasswordValidator, resetPassword);

router.put('/change-password', protect, changePasswordValidator, changePassword);

// ============================================
// USER PROFILE
// ============================================

router.get('/me', protect, getMe);

router.put('/update-profile', protect, updateProfile);

router.delete('/deactivate', protect, deactivateAccount);

// ============================================
// DEVELOPMENT/DEBUG ROUTES
// ============================================

router.post('/check-registration', checkRegistrationStatus);

router.get('/debug/:email', debugUserStatus);

router.delete('/delete-user/:email', deleteUserCompletely);

// ============================================
// VERIFIED EMAIL ROUTES
// ============================================

router.get('/verified-only', protect, requireVerifiedEmail, (req, res) => {
    res.json({
        success: true,
        message: 'You have access to verified-only content!',
        user: req.user.fullName
    });
});

export default router;