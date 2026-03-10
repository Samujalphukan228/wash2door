// controllers/authController.js

import crypto from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/User.js';
import {
    generateTokens,
    setTokenCookies,
    clearTokenCookies,
    verifyRefreshToken
} from '../utils/generateToken.js';
import {
    sendOTPEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendPasswordChangeConfirmation
} from '../utils/sendEmail.js';

// ============================================
// REGISTRATION FLOW
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

        const registrationCheck = await User.findForRegistration(email);
        
        if (!registrationCheck.canRegister) {
            return res.status(409).json({
                success: false,
                message: registrationCheck.message,
                canRetry: registrationCheck.isPending,
                registrationStatus: registrationCheck.registrationStatus
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password,
            registrationStatus: 'pending'
        });

        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        let otpSent = false;
        try {
            await sendOTPEmail(user, otp);
            otpSent = true;
            
            user.registrationStatus = 'otp-sent';
            await user.save({ validateBeforeSave: false });
        } catch (emailError) {
            console.error('OTP email failed:', emailError.message);
            
            user.registrationStatus = 'failed';
            await user.save({ validateBeforeSave: false });
            
            return res.status(503).json({
                success: false,
                message: 'Failed to send OTP. Please try again.',
                error: 'email_failed'
            });
        }

        res.status(201).json({
            success: true,
            message: 'Registration initiated! Check your email for the OTP code.',
            data: {
                email: user.email,
                nextStep: 'verify-otp',
                otpExpiresIn: '10 minutes'
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

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
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
                message: 'This account is already registered.'
            });
        }

        const otpResult = await user.verifyOTP(otp);

        if (!otpResult.success) {
            return res.status(400).json({
                success: false,
                message: otpResult.message,
                attemptsRemaining: otpResult.attemptsRemaining
            });
        }

        user.isEmailVerified = true;
        user.registrationStatus = 'otp-verified';
        await user.save({ validateBeforeSave: false });

        const { accessToken, refreshToken } = generateTokens(user._id);
        user.refreshToken = refreshToken;
        user.registrationStatus = 'completed';
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, refreshToken);

        try {
            await sendWelcomeEmail(user);
        } catch (emailError) {
            console.error('Welcome email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully! Registration complete.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified,
                    role: user.role
                },
                accessToken,
                nextStep: 'dashboard'
            }
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'OTP verification failed. Please try again.'
        });
    }
};

export const resendOTP = async (req, res) => {
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
                message: 'This account is already registered.'
            });
        }

        const otp = user.generateOTP();
        await user.save({ validateBeforeSave: false });

        try {
            await sendOTPEmail(user, otp);
        } catch (emailError) {
            console.error('Resend OTP email failed:', emailError.message);
            return res.status(503).json({
                success: false,
                message: 'Failed to send OTP. Please try again.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent to your email',
            data: {
                email: user.email,
                otpExpiresIn: '10 minutes'
            }
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to resend OTP. Please try again.'
        });
    }
};

// ============================================
// LOGIN & AUTHENTICATION
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
                message: `Registration incomplete. Status: ${user.registrationStatus}. Please complete OTP verification.`,
                registrationStatus: user.registrationStatus,
                nextStep: 'verify-otp'
            });
        }

        if (user.isLocked()) {
            const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(423).json({
                success: false,
                message: `Account is locked due to too many failed login attempts. Try again in ${lockTimeRemaining} minutes.`
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated. Please contact support.'
            });
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            
            const remainingAttempts = Math.max(0, 5 - (user.loginAttempts + 1));
            
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
                    role: user.role
                },
                accessToken
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

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
                message: 'Invalid or expired refresh token. Please login again.'
            });
        }

        const user = await User.findOne({
            _id: decoded.id,
            refreshToken: token,
            registrationStatus: 'completed'
        });

        if (!user) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token. Please login again.'
            });
        }

        if (!user.isActive) {
            clearTokenCookies(res);
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        setTokenCookies(res, accessToken, newRefreshToken);

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: { accessToken }
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        clearTokenCookies(res);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed. Please login again.'
        });
    }
};

// ============================================
// EMAIL VERIFICATION
// ============================================

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
            registrationStatus: 'completed'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token.'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
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
            message: 'Email verification failed. Please try again.'
        });
    }
};

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
                message: 'Email is already verified'
            });
        }

        const verificationToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendVerificationEmail(user, verificationToken);
        } catch (emailError) {
            console.error('Resend verification email failed:', emailError.message);
            return res.status(503).json({
                success: false,
                message: 'Unable to send verification email. Please try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully. Please check your inbox.'
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
// PASSWORD MANAGEMENT
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

        const user = await User.findOne({ 
            email: email.toLowerCase(),
            registrationStatus: 'completed'
        });

        const successMessage = 'If an account with that email exists, a password reset link has been sent';

        if (!user) {
            return res.status(200).json({
                success: true,
                message: successMessage
            });
        }

        if (!user.isActive) {
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
            console.error('Password reset email failed:', emailError.message);
            
            user.passwordResetToken = undefined;
            user.passwordResetExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(503).json({
                success: false,
                message: 'Email could not be sent. Please try again later.'
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
            message: 'Failed to process password reset request'
        });
    }
};

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

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpire: { $gt: Date.now() },
            registrationStatus: 'completed'
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token. Please request a new password reset.'
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
            console.error('Password change confirmation email failed:', emailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Password reset failed. Please try again.'
        });
    }
};

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
            console.error('Password change confirmation email failed:', emailError.message);
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
            message: 'Password change failed. Please try again.'
        });
    }
};

// ============================================
// USER PROFILE
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
                    twoFactorEnabled: user.twoFactorEnabled,
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
        
        let message = 'Profile update failed';
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(e => e.message).join(', ');
        }
        
        res.status(500).json({
            success: false,
            message
        });
    }
};

export const deactivateAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required to deactivate account'
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
            message: 'Account deactivated successfully. You can reactivate by contacting support.'
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
// UTILITY ENDPOINTS
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
        console.error('Check registration status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check registration status'
        });
    }
};

export const debugUserStatus = async (req, res) => {
    try {
        const { email } = req.params;

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
                message: 'User not found in database',
                debug: { email: email, exists: false }
            });
        }

        res.status(200).json({
            success: true,
            message: 'User found',
            debug: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                registrationStatus: user.registrationStatus,
                otpVerified: user.otpVerified,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug failed',
            error: error.message
        });
    }
};

export const deleteUserCompletely = async (req, res) => {
    try {
        const { email } = req.params;
        const { confirm } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        if (confirm !== 'yes') {
            return res.status(400).json({
                success: false,
                message: 'This action requires confirmation. Add ?confirm=yes to the URL',
                example: `/api/auth/delete-user/${email}?confirm=yes`
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const deletedData = {
            id: user._id,
            email: user.email,
            previousStatus: user.registrationStatus
        };

        await User.deleteOne({ _id: user._id });

        res.status(200).json({
            success: true,
            message: `User ${email} has been completely removed from the database.`,
            data: {
                ...deletedData,
                deletedAt: new Date()
            }
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
};