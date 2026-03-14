// utils/sendEmail.js

import transporter from '../config/email.js';
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

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"Wash2Door" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    try {
        const startTime = Date.now();
        const info = await transporter.sendMail(mailOptions);
        const duration = Date.now() - startTime;
        
        console.log(`✅ Email sent to ${options.email} in ${duration}ms | ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email error: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

// OTP Email
export const sendOTPEmail = async (user, otp) => {
    return await sendEmail({
        email: user.email,
        subject: '🔐 Your Verification Code - Wash2Door',
        html: getOTPEmailTemplate(user.firstName, otp),
        text: `Your verification code is: ${otp}. Expires in 10 minutes.`
    });
};

// Admin Welcome Email
export const sendAdminWelcomeEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        subject: '🎉 Welcome Admin! - Wash2Door',
        html: getAdminWelcomeEmailTemplate(user.firstName, tempPassword),
        text: `Welcome! Your temporary password is: ${tempPassword}`
    });
};

// Admin Password Reset Email
export const sendAdminPasswordResetEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        subject: '🔑 Admin Password Reset - Wash2Door',
        html: getAdminPasswordResetEmailTemplate(user.firstName, tempPassword),
        text: `Your password has been reset. Temporary password: ${tempPassword}`
    });
};

// Email Verification
export const sendVerificationEmail = async (user, verificationToken) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    return await sendEmail({
        email: user.email,
        subject: '✅ Verify Your Email - Wash2Door',
        html: getVerificationEmailTemplate(user.firstName, verificationLink),
        text: `Verify your email: ${verificationLink}`
    });
};

// Password Reset
export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetLink = `${process.env.FRONTEND_URL}/admin/reset-password/${resetToken}`;
    return await sendEmail({
        email: user.email,
        subject: '🔑 Password Reset Request - Wash2Door',
        html: getPasswordResetEmailTemplate(user.firstName, resetLink),
        text: `Reset your password: ${resetLink}`
    });
};

// Welcome Email
export const sendWelcomeEmail = async (user) => {
    return await sendEmail({
        email: user.email,
        subject: '🎉 Welcome to Wash2Door!',
        html: getWelcomeEmailTemplate(user.firstName),
        text: `Welcome ${user.firstName}! Your registration is complete.`
    });
};

// Password Change Confirmation
export const sendPasswordChangeConfirmation = async (user) => {
    return await sendEmail({
        email: user.email,
        subject: '🔒 Password Changed - Wash2Door',
        html: getPasswordChangeConfirmationTemplate(user.firstName),
        text: `Your password was changed successfully.`
    });
};

// ============================================
// BOOKING EMAILS
// ============================================

// Customer Booking Confirmation
export const sendBookingConfirmationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `✅ Booking Confirmed - ${booking.bookingCode} | Wash2Door`,
        html: getBookingConfirmationTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} is confirmed for ${booking.timeSlot} on ${new Date(booking.bookingDate).toLocaleDateString()}`
    });
};

// Admin New Booking Notification
export const sendAdminNewBookingEmail = async (booking, customer) => {
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
        console.error('❌ ADMIN_EMAIL not set in environment variables');
        return;
    }

    return await sendEmail({
        email: adminEmail,
        subject: `🔔 New Booking - ${booking.bookingCode} | ${booking.timeSlot} | Wash2Door`,
        html: getAdminNewBookingTemplate(booking, customer),
        text: `New booking ${booking.bookingCode} at ${booking.location.address}, ${booking.location.city} on ${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.timeSlot}`
    });
};

// Customer Booking Cancellation
export const sendBookingCancellationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `❌ Booking Cancelled - ${booking.bookingCode} | Wash2Door`,
        html: getBookingCancellationTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} has been cancelled.`
    });
};

// Booking Status Update
export const sendBookingStatusEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `📋 Booking Update - ${booking.bookingCode} - ${booking.status} | Wash2Door`,
        html: getBookingStatusTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} status: ${booking.status}`
    });
};

export default sendEmail;