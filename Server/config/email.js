// config/email.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email configuration error:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

export default transporter;