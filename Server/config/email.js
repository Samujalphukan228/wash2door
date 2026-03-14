// config/email.js - Brevo API Configuration

import brevo from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

// Validate Brevo API key
if (!process.env.BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY missing in environment variables');
    process.exit(1);
}

// Initialize Brevo API
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// Verify configuration
console.log('✅ Brevo API configured successfully');

export default apiInstance;