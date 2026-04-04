import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.BREVO_API_KEY) {
    process.exit(1);
}

const brevoAPI = axios.create({
    baseURL: 'https://api.brevo.com/v3',
    headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

export const emailConfig = {
    apiKey: process.env.BREVO_API_KEY,
    emailFrom: process.env.EMAIL_FROM,
    adminEmail: process.env.ADMIN_EMAIL
};

export default brevoAPI;