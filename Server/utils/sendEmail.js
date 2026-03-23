// utils/sendEmail.js - Brevo API Email Sender

import brevoAPI, { emailConfig } from '../config/email.js';
import {
    getRegistrationVerificationEmailTemplate,
    getAdminWelcomeEmailTemplate,
    getAdminPasswordResetEmailTemplate,
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordChangeConfirmationTemplate,
    getBookingConfirmationTemplate,
    getBookingCancellationTemplate,
    getBookingStatusTemplate
} from './emailTemplates.js';

// Base email sending function with retry
const sendEmail = async (options, retries = 2) => {
    const payload = {
        sender: {
            name: 'Wash2Door',
            email: emailConfig.emailFrom
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

    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            const startTime = Date.now();
            const response = await brevoAPI.post('/smtp/email', payload);
            const duration = Date.now() - startTime;
            
            console.log(`✅ Email sent to ${options.email} in ${duration}ms | ID: ${response.data.messageId}`);
            return { success: true, messageId: response.data.messageId };
        } catch (error) {
            console.error(`❌ Brevo API error (Attempt ${attempt}/${retries + 1}):`, error.message);
            
            if (attempt <= retries) {
                console.log(`⏳ Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            } else {
                console.error(`❌ Failed after ${retries + 1} attempts`);
                throw new Error('Email could not be sent after retries');
            }
        }
    }
};

// ============================================
// REGISTRATION (NEW - Link Based)
// ============================================
export const sendRegistrationVerificationEmail = async (user, verificationToken) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-registration/${verificationToken}`;
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '✅ Verify Your Email - Wash2Door',
        html: getRegistrationVerificationEmailTemplate(user.firstName, verificationLink)
    });
};

// ============================================
// ADMIN EMAILS
// ============================================

// Admin Welcome Email
export const sendAdminWelcomeEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        subject: '🎉 Welcome Admin! - Wash2Door',
        html: getAdminWelcomeEmailTemplate(user.firstName, tempPassword, user.email)
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

// ============================================
// USER EMAILS
// ============================================

// Email Verification (for existing users)
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
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
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
// BOOKING EMAILS (Customer Only)
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