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
    getBookingCancellationTemplate,
    getBookingStatusTemplate
} from './emailTemplates.js';

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"Car Washing Service" <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
        text: options.text
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${options.email}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`❌ Email error: ${error.message}`);
        throw new Error('Email could not be sent');
    }
};

export const sendOTPEmail = async (user, otp) => {
    return await sendEmail({
        email: user.email,
        subject: '🔐 Your Verification Code - Car Washing Service',
        html: getOTPEmailTemplate(user.firstName, otp),
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    });
};

export const sendAdminWelcomeEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        subject: '🎉 Welcome Admin! - Car Washing Service',
        html: getAdminWelcomeEmailTemplate(user.firstName, tempPassword),
        text: `Welcome to admin panel! Your temporary password is: ${tempPassword}`
    });
};

export const sendAdminPasswordResetEmail = async (user, tempPassword) => {
    return await sendEmail({
        email: user.email,
        subject: '🔑 Admin Password Reset - Car Washing Service',
        html: getAdminPasswordResetEmailTemplate(user.firstName, tempPassword),
        text: `Your password has been reset. Temporary password: ${tempPassword}`
    });
};

export const sendVerificationEmail = async (user, verificationToken) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    return await sendEmail({
        email: user.email,
        subject: '✅ Verify Your Email Address',
        html: getVerificationEmailTemplate(user.firstName, verificationLink),
        text: `Please verify your email by visiting: ${verificationLink}`
    });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    return await sendEmail({
        email: user.email,
        subject: '🔑 Password Reset Request',
        html: getPasswordResetEmailTemplate(user.firstName, resetLink),
        text: `Reset your password by visiting: ${resetLink}`
    });
};

export const sendWelcomeEmail = async (user) => {
    return await sendEmail({
        email: user.email,
        subject: '🎉 Welcome to Car Washing Service!',
        html: getWelcomeEmailTemplate(user.firstName),
        text: `Welcome ${user.firstName}! Your registration is complete.`
    });
};

export const sendPasswordChangeConfirmation = async (user) => {
    return await sendEmail({
        email: user.email,
        subject: '🔒 Password Changed Successfully',
        html: getPasswordChangeConfirmationTemplate(user.firstName),
        text: `Your password was changed successfully.`
    });
};

export const sendBookingConfirmationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `🚗 Booking Confirmed - ${booking.bookingCode}`,
        html: getBookingConfirmationTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} has been confirmed!`
    });
};

export const sendBookingCancellationEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `❌ Booking Cancelled - ${booking.bookingCode}`,
        html: getBookingCancellationTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} has been cancelled.`
    });
};

export const sendBookingStatusEmail = async (user, booking) => {
    return await sendEmail({
        email: user.email,
        subject: `📋 Booking Update - ${booking.bookingCode} - ${booking.status}`,
        html: getBookingStatusTemplate(user.firstName, booking),
        text: `Your booking ${booking.bookingCode} status: ${booking.status}`
    });
};

export default sendEmail;