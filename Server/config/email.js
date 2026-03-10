// config/email.js - FIXED: Added better error handling

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ FIXED: Validate email config before creating transporter
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials missing in environment variables');
        console.error('Required: EMAIL_USER, EMAIL_PASS');
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Email configuration error:', error.message);
        } else {
            console.log('✅ Email server is ready to send messages');
        }
    });

    return transporter;
};

const transporter = createTransporter();

export default transporter;