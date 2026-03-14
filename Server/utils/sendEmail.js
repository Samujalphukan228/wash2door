// utils/sendEmail.js - Brevo REST API Email Sender

import axios from 'axios';
import brevoConfig from '../config/email.js';
import {
    getOTPEmailTemplate,
    getAdminWelcomeEmailTemplate,
    getAdminPasswordResetEmailTemplate,
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordChangeConfirmationTemplate,
    getBookingConfirmationTemplate,
    getAdminNewBookingTemplate,
    getBookingCancellationTemplate,
    getBookingStatusTemplate
} from './emailTemplates.js';

// Create axios instance for Brevo API
const brevoAPI = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: {
        'api-key': brevoConfig.apiKey,
        'Content-Type': 'application/json'
    },
    timeout: 10000
});

// Base email sending function
const sendEmail = async (options) => {
    const payload = {
        sender: {
            name: 'Wash2Door',
            email: brevoConfig.emailFrom
        },
        to: [
            {
                email: options.email,
                name: options.name || options.email
            }
        ],
        subject: options.subject,
        htmlContent: options.html
    };

    try {
        const startTime = Date.now();
        const response = await brevoAPI.post('/smtp/email', payload);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Email sent to ${options.email} in ${duration}ms | ID: ${response.data.messageId}`);
        return { success: true, messageId: response.data.messageId };
    } catch (error) {
        console.error(`❌ Brevo API error:`, error.response?.data || error.message);
        throw new Error('Email could not be sent');
    }
};

// OTP Email
export const sendOTPEmail = async (user, otp) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🔐 Your Verification Code - Wash2Door',
        html: getOTPEmailTemplate(user.firstName, otp)
    });
};

// Admin Welcome Email
export const sendAdminWelcomeEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🎉 Welcome Admin! - Wash2Door',
        html: getAdminWelcomeEmailTemplate(user.firstName, tempPassword)
    });
};

// Admin Password Reset Email
export const sendAdminPasswordResetEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🔑 Admin Password Reset - Wash2Door',
        html: getAdminPasswordResetEmailTemplate(user.firstName, tempPassword)
    });
};

// Email Verification
export const sendVerificationEmail = async (user, verificationToken) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '✅ Verify Your Email - Wash2Door',
        html: getVerificationEmailTemplate(user.firstName, verificationLink)
    });
};

// Password Reset
export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🔑 Password Reset Request - Wash2Door',
        html: getPasswordResetEmailTemplate(user.firstName, resetLink)
    });
};

// Welcome Email
export const sendWelcomeEmail = async (user) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🎉 Welcome to Wash2Door!',
        html: getWelcomeEmailTemplate(user.firstName)
    });
};

// Password Change Confirmation
export const sendPasswordChangeConfirmation = async (user) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🔒 Password Changed - Wash2Door',
        html: getPasswordChangeConfirmationTemplate(user.firstName)
    });
};

// ============================================
// BOOKING EMAILS
// ============================================

// Customer Booking Confirmation
export const sendBookingConfirmationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: `✅ Booking Confirmed - ${booking.bookingCode} | Wash2Door`,
        html: getBookingConfirmationTemplate(user.firstName, booking)
    });
};

// Admin New Booking Notification
export const sendAdminNewBookingEmail = async (booking, customer) => {
    const adminEmail = brevoConfig.adminEmail;

    if (!adminEmail) {
        console.error('❌ ADMIN_EMAIL not set in environment variables');
        return;
    }

    return await sendEmail({
        email: adminEmail,
        name: 'Admin',
        subject: `🔔 New Booking - ${booking.bookingCode} | ${booking.timeSlot} | Wash2Door`,
        html: getAdminNewBookingTemplate(booking, customer)
    });
};

// Customer Booking Cancellation
export const sendBookingCancellationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: `❌ Booking Cancelled - ${booking.bookingCode} | Wash2Door`,
        html: getBookingCancellationTemplate(user.firstName, booking)
    });
};

// Booking Status Update
export const sendBookingStatusEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: `📋 Booking Update - ${booking.bookingCode} - ${booking.status} | Wash2Door`,
        html: getBookingStatusTemplate(user.firstName, booking)
    });
};

export default sendEmail;