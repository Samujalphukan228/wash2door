// config/email.js - Brevo SMTP Configuration

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Validate email config
const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials missing in environment variables');
        console.error('Required: EMAIL_USER, EMAIL_PASS');
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // Use TLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Verify connection
    transporter.verify((error, success) => {
        if (error) {
            console.error('❌ Brevo SMTP configuration error:', error.message);
        } else {
            console.log('✅ Brevo SMTP server is ready to send messages');
        }
    });

    return transporter;
};

const transporter = createTransporter();

export default transporter;