// utils/sendEmail.js

import transporter from '../config/email.js';
import {
    getOTPEmailTemplate,
    getVerificationEmailTemplate,
    getPasswordResetEmailTemplate,
    getWelcomeEmailTemplate,
    getPasswordChangeConfirmationTemplate
} from './emailTemplates.js';

const sendEmail = async (options) => {
    const mailOptions = {
        from: `"Auth System" <${process.env.EMAIL_FROM}>`,
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
        subject: '🔐 Your Verification Code - Auth System',
        html: getOTPEmailTemplate(user.firstName, otp),
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
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
        subject: '🎉 Welcome to Auth System!',
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

export default sendEmail;