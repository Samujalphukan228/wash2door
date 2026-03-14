// config/email.js - Brevo REST API Configuration

import dotenv from 'dotenv';

dotenv.config();

// Validate API key
if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY missing in environment variables');
    process.exit(1);
}

// Store API key for use in sendEmail.js
export const brevoConfig = {
    apiKey: process.env.BREVO_API_KEY,
    apiUrl: 'https://api.brevo.com/v3/smtp/email',
    emailFrom: process.env.EMAIL_FROM,
    adminEmail: process.env.ADMIN_EMAIL
};

console.log('✅ Brevo API configured successfully');

export default brevoConfig;