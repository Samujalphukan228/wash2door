// utils/emailTemplates.js

// ============================================
// REGISTRATION VERIFICATION (NEW - Link Based)
// ============================================
export const getRegistrationVerificationEmailTemplate = (userName, verificationLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Registration</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 18px 50px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 20px 0;
            }
            .divider {
                width: 60px;
                height: 1px;
                background-color: #e0e0e0;
                margin: 40px auto;
            }
            .link-section {
                text-align: left;
                max-width: 450px;
                margin: 0 auto;
            }
            .link-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999999;
                margin-bottom: 10px;
            }
            .link-box { 
                background-color: #fafafa; 
                border: 1px solid #e0e0e0;
                padding: 15px; 
                word-break: break-all;
                font-size: 12px;
                color: #666666;
                font-family: 'Courier New', monospace;
            }
            .validity {
                color: #999999;
                font-size: 13px;
                margin-top: 30px;
            }
            .security-note {
                background-color: #fafafa;
                border-left: 3px solid #000000;
                padding: 15px 20px;
                margin: 30px auto;
                max-width: 400px;
                text-align: left;
            }
            .security-note p {
                margin: 0;
                color: #666666;
                font-size: 13px;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Thank you for registering with Wash2Door! Please click the button below to verify your email address and complete your registration.</p>
                
                <a href="${verificationLink}" class="button">Verify & Complete Registration</a>
                
                <div class="divider"></div>
                
                <div class="link-section">
                    <p class="link-label">Or copy this link to your browser</p>
                    <div class="link-box">${verificationLink}</div>
                </div>
                
                <p class="validity">This link will expire in 15 minutes</p>
                
                <div class="security-note">
                    <p><strong>Didn't sign up?</strong> If you didn't create an account with Wash2Door, please ignore this email.</p>
                </div>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// ADMIN WELCOME
// ============================================
export const getAdminWelcomeEmailTemplate = (firstName, tempPassword, adminEmail) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Admin</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
            }
            .credentials-box { 
                background-color: #fafafa; 
                border: 1px solid #e0e0e0;
                padding: 30px; 
                margin: 30px 0; 
            }
            .credentials-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 25px 0;
                font-weight: 600;
            }
            .credential-row { 
                margin: 20px 0;
            }
            .credential-label { 
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999999;
                margin-bottom: 8px;
            }
            .credential-value { 
                font-family: 'Courier New', monospace; 
                color: #000000; 
                font-size: 16px;
                background: #ffffff;
                padding: 12px 15px;
                border: 1px solid #e0e0e0;
            }
            .warning-box { 
                background-color: #ffffff; 
                border-left: 3px solid #000000; 
                padding: 20px 25px; 
                margin: 30px 0;
            }
            .warning-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 15px 0;
                font-weight: 600;
            }
            .warning-box ul {
                margin: 0;
                padding-left: 20px;
                color: #666666;
                font-size: 14px;
            }
            .warning-box li {
                margin: 8px 0;
            }
            .steps-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 40px 0 20px 0;
                font-weight: 600;
            }
            .steps {
                color: #666666;
                font-size: 14px;
                padding-left: 20px;
            }
            .steps li {
                margin: 10px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 15px 40px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 30px 0;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome Admin</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${firstName}</p>
                <p class="message">You have been granted administrator access to the Wash2Door Management System.</p>
                
                <div class="credentials-box">
                    <p class="credentials-title">Your Credentials</p>
                    
                    <div class="credential-row">
                        <div class="credential-label">Email</div>
                        <div class="credential-value">${adminEmail}</div>
                    </div>
                    
                    <div class="credential-row">
                        <div class="credential-label">Temporary Password</div>
                        <div class="credential-value">${tempPassword}</div>
                    </div>
                </div>
                
                <div class="warning-box">
                    <p class="warning-title">Important Security Notice</p>
                    <ul>
                        <li>This temporary password is valid for one-time use only</li>
                        <li>You must change your password immediately after first login</li>
                        <li>Never share this password with anyone</li>
                        <li>Keep your login credentials secure</li>
                    </ul>
                </div>
                
                <p class="steps-title">Next Steps</p>
                <ol class="steps">
                    <li>Go to the admin login page</li>
                    <li>Use the credentials provided above</li>
                    <li>Change your password to something secure</li>
                    <li>Start managing your services</li>
                </ol>
                
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/admin/login" class="button">Login to Admin Panel</a>
                </p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// ADMIN PASSWORD RESET
// ============================================
export const getAdminPasswordResetEmailTemplate = (firstName, tempPassword) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
            }
            .password-box { 
                background-color: #000000; 
                padding: 30px 40px; 
                margin: 30px 0;
                text-align: center;
            }
            .password-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #888888;
                margin-bottom: 15px;
            }
            .password-value { 
                font-family: 'Courier New', monospace; 
                color: #ffffff; 
                font-size: 24px;
                letter-spacing: 3px;
            }
            .warning-box { 
                background-color: #fafafa; 
                border-left: 3px solid #000000; 
                padding: 20px 25px; 
                margin: 30px 0;
            }
            .warning-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 15px 0;
                font-weight: 600;
            }
            .warning-box ul {
                margin: 0;
                padding-left: 20px;
                color: #666666;
                font-size: 14px;
            }
            .warning-box li {
                margin: 8px 0;
            }
            .steps-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 40px 0 20px 0;
                font-weight: 600;
            }
            .steps {
                color: #666666;
                font-size: 14px;
                padding-left: 20px;
            }
            .steps li {
                margin: 10px 0;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${firstName}</p>
                <p class="message">Your admin password has been reset. Please use the temporary password below to login.</p>
                
                <div class="password-box">
                    <div class="password-label">Temporary Password</div>
                    <div class="password-value">${tempPassword}</div>
                </div>
                
                <div class="warning-box">
                    <p class="warning-title">Important</p>
                    <ul>
                        <li>Use this temporary password to login</li>
                        <li>You must change it immediately after login</li>
                        <li>This password is valid for one-time use only</li>
                        <li>Keep this email secure and confidential</li>
                    </ul>
                </div>
                
                <p class="steps-title">What to do next</p>
                <ol class="steps">
                    <li>Login with your email and temporary password</li>
                    <li>Navigate to Profile and Change Password</li>
                    <li>Set a new secure password</li>
                    <li>Continue with your admin tasks</li>
                </ol>
                
                <p style="font-size: 13px; color: #999999; margin-top: 40px;">
                    If you did not request this password reset, please contact the system administrator immediately.
                </p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// EMAIL VERIFICATION (For existing users)
// ============================================
export const getVerificationEmailTemplate = (userName, verificationLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 18px 50px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 20px 0;
            }
            .divider {
                width: 60px;
                height: 1px;
                background-color: #e0e0e0;
                margin: 40px auto;
            }
            .link-section {
                text-align: left;
                max-width: 450px;
                margin: 0 auto;
            }
            .link-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999999;
                margin-bottom: 10px;
            }
            .link-box { 
                background-color: #fafafa; 
                border: 1px solid #e0e0e0;
                padding: 15px; 
                word-break: break-all;
                font-size: 12px;
                color: #666666;
                font-family: 'Courier New', monospace;
            }
            .validity {
                color: #999999;
                font-size: 13px;
                margin-top: 30px;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Email</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Please verify your email address to access all features.</p>
                
                <a href="${verificationLink}" class="button">Verify Email Address</a>
                
                <div class="divider"></div>
                
                <div class="link-section">
                    <p class="link-label">Or copy this link to your browser</p>
                    <div class="link-box">${verificationLink}</div>
                </div>
                
                <p class="validity">This link will expire in 24 hours</p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// PASSWORD RESET
// ============================================
export const getPasswordResetEmailTemplate = (userName, resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 18px 50px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 20px 0;
            }
            .warning-box { 
                background-color: #fafafa; 
                border-left: 3px solid #000000; 
                padding: 15px 20px; 
                margin: 30px 0;
                text-align: left;
                max-width: 400px;
                margin-left: auto;
                margin-right: auto;
            }
            .warning-box p {
                margin: 0;
                color: #666666;
                font-size: 13px;
            }
            .divider {
                width: 60px;
                height: 1px;
                background-color: #e0e0e0;
                margin: 40px auto;
            }
            .link-section {
                text-align: left;
                max-width: 450px;
                margin: 0 auto;
            }
            .link-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999999;
                margin-bottom: 10px;
            }
            .link-box { 
                background-color: #fafafa; 
                border: 1px solid #e0e0e0;
                padding: 15px; 
                word-break: break-all;
                font-size: 12px;
                color: #666666;
                font-family: 'Courier New', monospace;
            }
            .note {
                color: #999999;
                font-size: 13px;
                margin-top: 30px;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Reset Password</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">We received a request to reset your password. Click the button below to create a new password.</p>
                
                <a href="${resetLink}" class="button">Reset Password</a>
                
                <div class="warning-box">
                    <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                </div>
                
                <div class="divider"></div>
                
                <div class="link-section">
                    <p class="link-label">Or copy this link to your browser</p>
                    <div class="link-box">${resetLink}</div>
                </div>
                
                <p class="note">If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// WELCOME EMAIL
// ============================================
export const getWelcomeEmailTemplate = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 28px; 
                font-weight: 300;
                letter-spacing: 3px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 22px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 40px;
            }
            .features { 
                background-color: #fafafa; 
                padding: 30px; 
                margin: 30px 0;
                text-align: left;
            }
            .features-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 25px 0;
                font-weight: 600;
            }
            .feature-item { 
                display: flex; 
                align-items: center; 
                margin: 15px 0;
                color: #666666;
                font-size: 14px;
            }
            .feature-bullet {
                width: 6px;
                height: 6px;
                background-color: #000000;
                margin-right: 15px;
                flex-shrink: 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 18px 50px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 20px 0;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Your registration is complete. Welcome to Wash2Door.</p>
                
                <div class="features">
                    <p class="features-title">What you can do now</p>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Access all platform features</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Book car washing services</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Track your bookings in real-time</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Receive important updates</span>
                    </div>
                </div>
                
                <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// PASSWORD CHANGE CONFIRMATION
// ============================================
export const getPasswordChangeConfirmationTemplate = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .success-box { 
                background-color: #fafafa; 
                border-left: 3px solid #000000; 
                padding: 20px 25px; 
                margin: 30px 0;
            }
            .success-box p {
                margin: 0;
                color: #333333;
                font-size: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin: 25px 0;
            }
            .warning-box { 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
                padding: 20px 25px; 
                margin: 30px 0;
            }
            .warning-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 10px 0;
                font-weight: 600;
            }
            .warning-box p.warning-text {
                margin: 0;
                color: #666666;
                font-size: 14px;
            }
            .details {
                color: #999999;
                font-size: 13px;
                margin-top: 30px;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Changed</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                
                <div class="success-box">
                    <p>Your password has been changed successfully.</p>
                </div>
                
                <p class="message">Your account password was recently changed. If you made this change, you can safely ignore this email.</p>
                
                <div class="warning-box">
                    <p class="warning-title">Did not change your password?</p>
                    <p class="warning-text">If you did not make this change, please contact our support team immediately and secure your account.</p>
                </div>
                
                <p class="details">Changed at: ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// BOOKING CONFIRMATION (For Customer)
// ============================================
export const getBookingConfirmationTemplate = (userName, booking) => {
    const bookingDateFormatted = new Date(booking.bookingDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmed</title>
    </head>
    <body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
        
        <div style="max-width:600px;margin:auto;background:#fff;border:1px solid #ddd;padding:30px;">
            
            <h2 style="text-align:center;">Booking Confirmed</h2>

            <p>Hello, ${userName}</p>
            <p>Your booking is confirmed. Here are your details:</p>

            <h3 style="text-align:center;">${booking.bookingCode}</h3>

            <hr/>

            <h4>Service Details</h4>
            <p><strong>Service:</strong> ${booking.serviceName}</p>
            <p><strong>Category:</strong> ${booking.serviceCategory}</p>
            <p><strong>Duration:</strong> ${booking.duration} mins</p>
            <p><strong>Price:</strong> Rs. ${booking.price}</p>

            <hr/>

            <h4>Schedule</h4>
            <p><strong>Date:</strong> ${bookingDateFormatted}</p>
            <p><strong>Time:</strong> ${booking.timeSlot}</p>

            <hr/>

            <h4>Location</h4>
            <p>${booking.location.address}</p>
            <p>${booking.location.city}</p>

            <hr/>

            <h4>Contact</h4>
            <p><strong>Phone:</strong> ${booking.phone}</p>

            <hr/>

            <p>Please be available at your selected time.</p>

        </div>

    </body>
    </html>
    `;
};

// ============================================
// BOOKING CANCELLATION
// ============================================
export const getBookingCancellationTemplate = (userName, booking) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Cancelled</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .cancel-notice { 
                background-color: #fafafa; 
                border-left: 3px solid #000000; 
                padding: 20px 25px; 
                margin: 30px 0;
            }
            .cancel-notice p {
                margin: 0;
                color: #333333;
                font-size: 15px;
            }
            .cancel-notice .reason {
                margin-top: 10px;
                color: #666666;
                font-size: 14px;
            }
            .info-box { 
                background-color: #fafafa; 
                padding: 25px; 
                margin: 30px 0;
            }
            .info-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 20px 0;
                font-weight: 600;
            }
            .info-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child { 
                border-bottom: none; 
            }
            .info-label { 
                color: #888888;
                font-size: 13px;
            }
            .info-value { 
                color: #333333; 
                font-size: 13px;
                font-weight: 500;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin: 30px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff; 
                padding: 15px 40px; 
                text-decoration: none; 
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 20px 0;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Cancelled</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                
                <div class="cancel-notice">
                    <p>Your booking has been cancelled.</p>
                    ${booking.cancellationReason ? `<p class="reason">Reason: ${booking.cancellationReason}</p>` : ''}
                </div>
                
                <div class="info-box">
                    <p class="info-title">Cancelled Booking Details</p>
                    <div class="info-row">
                        <span class="info-label">Booking Code</span>
                        <span class="info-value">${booking.bookingCode}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Service</span>
                        <span class="info-value">${booking.serviceName || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date</span>
                        <span class="info-value">${new Date(booking.bookingDate).toLocaleDateString('en-IN', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Time Slot</span>
                        <span class="info-value">${booking.timeSlot}</span>
                    </div>
                </div>
                
                <p class="message">If you would like to book again, visit our website and schedule a new appointment.</p>
                
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/services" class="button">Book Again</a>
                </p>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// ============================================
// BOOKING STATUS UPDATE
// ============================================
export const getBookingStatusTemplate = (userName, booking) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Status Update</title>
        <style>
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                margin: 0; 
                padding: 0; 
                background-color: #f5f5f5; 
                line-height: 1.6;
            }
            .container { 
                max-width: 600px; 
                margin: 40px auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .header h1 { 
                color: #ffffff; 
                margin: 0; 
                font-size: 24px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px 40px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 400;
                margin-bottom: 20px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 30px;
            }
            .status-box {
                background-color: #000000;
                padding: 20px 40px;
                display: inline-block;
                margin: 20px 0;
            }
            .status-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #888888;
                margin-bottom: 10px;
            }
            .status-value { 
                color: #ffffff; 
                font-size: 20px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .info-box { 
                background-color: #fafafa; 
                padding: 25px; 
                margin: 30px 0;
                text-align: left;
            }
            .info-row { 
                display: flex; 
                justify-content: space-between; 
                padding: 12px 0; 
                border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child { 
                border-bottom: none; 
            }
            .info-label { 
                color: #888888;
                font-size: 13px;
            }
            .info-value { 
                color: #333333; 
                font-size: 13px;
                font-weight: 500;
            }
            .footer { 
                background-color: #fafafa; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e0e0e0;
            }
            .footer p { 
                color: #999999; 
                font-size: 12px; 
                margin: 5px 0;
            }
            .brand {
                font-weight: 600;
                color: #333333;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Booking Update</h1>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Your booking status has been updated.</p>
                
                <div class="status-box">
                    <div class="status-label">Current Status</div>
                    <div class="status-value">${booking.status.toUpperCase()}</div>
                </div>
                
                <div class="info-box">
                    <div class="info-row">
                        <span class="info-label">Booking Code</span>
                        <span class="info-value">${booking.bookingCode}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Service</span>
                        <span class="info-value">${booking.serviceId?.name || booking.serviceName || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Date</span>
                        <span class="info-value">${new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Time</span>
                        <span class="info-value">${booking.timeSlot}</span>
                    </div>
                </div>
            </div>
            <div class="footer">
                <p class="brand">Wash2Door</p>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};