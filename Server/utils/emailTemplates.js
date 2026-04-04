export const getRegistrationVerificationEmailTemplate = (userName, verificationLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Registration</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 60px 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                max-width: 420px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.8;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 18px 60px; 
                text-decoration: none; 
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
                border-radius: 0;
                transition: all 0.3s ease;
            }
            .button:hover {
                background-color: #333333;
            }
            .validity {
                color: #999999;
                font-size: 14px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
            }
            .validity strong {
                color: #333333;
            }
            .security-note {
                background-color: #fafafa;
                padding: 25px 30px;
                margin: 40px 0 0 0;
                text-align: left;
                border-left: 3px solid #000000;
            }
            .security-note p {
                color: #666666;
                font-size: 14px;
                line-height: 1.7;
            }
            .security-note strong {
                color: #333333;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Email Verification</div>
            </div>
            <div class="content">
                <div class="icon-circle">✉</div>
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Thank you for registering with Wash2Door! Please verify your email address to complete your registration and start using our services.</p>
                
                <a href="${verificationLink}" class="button">Verify My Email</a>
                
                <p class="validity">This verification link expires in <strong>15 minutes</strong></p>
                
                <div class="security-note">
                    <p><strong>Didn't sign up?</strong> If you didn't create an account with Wash2Door, you can safely ignore this email.</p>
                </div>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getAdminWelcomeEmailTemplate = (firstName, tempPassword, adminEmail) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome Admin</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .badge {
                display: inline-block;
                background-color: #ffffff;
                color: #000000;
                padding: 5px 15px;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: 1px;
                margin-top: 15px;
            }
            .content { 
                padding: 50px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                line-height: 1.8;
            }
            .credentials-box { 
                background-color: #fafafa; 
                border: 1px solid #e0e0e0;
                padding: 35px; 
                margin: 30px 0; 
            }
            .credentials-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #333333;
                margin: 0 0 30px 0;
                font-weight: 600;
                text-align: center;
            }
            .credential-row { 
                margin: 25px 0;
            }
            .credential-label { 
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #999999;
                margin-bottom: 10px;
            }
            .credential-value { 
                font-family: 'Courier New', monospace; 
                color: #000000; 
                font-size: 18px;
                background: #ffffff;
                padding: 15px 20px;
                border: 1px solid #e0e0e0;
                letter-spacing: 1px;
            }
            .warning-box { 
                background-color: #ffffff; 
                border-left: 4px solid #000000; 
                padding: 25px 30px; 
                margin: 35px 0;
            }
            .warning-title {
                font-size: 13px;
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
                margin: 10px 0;
                line-height: 1.6;
            }
            .steps-section {
                margin: 40px 0;
            }
            .steps-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 25px 0;
                font-weight: 600;
            }
            .step-item {
                display: flex;
                align-items: flex-start;
                margin: 15px 0;
            }
            .step-number {
                width: 30px;
                height: 30px;
                background-color: #000000;
                color: #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: 600;
                margin-right: 15px;
                flex-shrink: 0;
            }
            .step-text {
                color: #666666;
                font-size: 15px;
                padding-top: 4px;
            }
            .button-wrapper {
                text-align: center;
                margin: 40px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 18px 50px; 
                text-decoration: none; 
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Admin Access Granted</div>
                <div class="badge">ADMINISTRATOR</div>
            </div>
            <div class="content">
                <p class="greeting">Welcome, ${firstName}</p>
                <p class="message">You have been granted administrator access to the Wash2Door Management System. Below are your login credentials.</p>
                
                <div class="credentials-box">
                    <p class="credentials-title">Your Login Credentials</p>
                    
                    <div class="credential-row">
                        <div class="credential-label">Email Address</div>
                        <div class="credential-value">${adminEmail}</div>
                    </div>
                    
                    <div class="credential-row">
                        <div class="credential-label">Temporary Password</div>
                        <div class="credential-value">${tempPassword}</div>
                    </div>
                </div>
                
                <div class="warning-box">
                    <p class="warning-title">Security Notice</p>
                    <ul>
                        <li>This temporary password is for one-time use only</li>
                        <li>Change your password immediately after first login</li>
                        <li>Never share your credentials with anyone</li>
                        <li>Keep your account information secure</li>
                    </ul>
                </div>
                
                <div class="steps-section">
                    <p class="steps-title">Getting Started</p>
                    <div class="step-item">
                        <span class="step-number">1</span>
                        <span class="step-text">Click the button below to access the admin panel</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">2</span>
                        <span class="step-text">Login with the credentials provided above</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">3</span>
                        <span class="step-text">Change your password to something secure</span>
                    </div>
                    <div class="step-item">
                        <span class="step-number">4</span>
                        <span class="step-text">Start managing your services</span>
                    </div>
                </div>
                
                <div class="button-wrapper">
                    <a href="${process.env.FRONTEND_URL}/admin/login" class="button">Access Admin Panel</a>
                </div>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getAdminPasswordResetEmailTemplate = (firstName, tempPassword) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                line-height: 1.8;
            }
            .password-box { 
                background-color: #000000; 
                padding: 40px 50px; 
                margin: 30px 0;
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
                font-size: 28px;
                letter-spacing: 4px;
                font-weight: 600;
            }
            .warning-box { 
                background-color: #fafafa; 
                border-left: 4px solid #000000; 
                padding: 25px 30px; 
                margin: 35px 0;
                text-align: left;
            }
            .warning-title {
                font-size: 13px;
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
                margin: 10px 0;
                line-height: 1.6;
            }
            .note {
                color: #999999;
                font-size: 14px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
                line-height: 1.7;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Password Reset</div>
            </div>
            <div class="content">
                <div class="icon-circle">🔐</div>
                <p class="greeting">Hello, ${firstName}</p>
                <p class="message">Your admin password has been reset. Use the temporary password below to login to your account.</p>
                
                <div class="password-box">
                    <div class="password-label">Your Temporary Password</div>
                    <div class="password-value">${tempPassword}</div>
                </div>
                
                <div class="warning-box">
                    <p class="warning-title">Important Instructions</p>
                    <ul>
                        <li>Use this temporary password to login</li>
                        <li>Change your password immediately after login</li>
                        <li>This password is valid for one-time use only</li>
                        <li>Keep this information confidential</li>
                    </ul>
                </div>
                
                <p class="note">If you did not request this password reset, please contact the system administrator immediately as your account may be compromised.</p>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getVerificationEmailTemplate = (userName, verificationLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 60px 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                max-width: 420px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.8;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 18px 60px; 
                text-decoration: none; 
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .validity {
                color: #999999;
                font-size: 14px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
            }
            .validity strong {
                color: #333333;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Verify Email</div>
            </div>
            <div class="content">
                <div class="icon-circle">✓</div>
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Please verify your email address to access all features of your account.</p>
                
                <a href="${verificationLink}" class="button">Verify Email Address</a>
                
                <p class="validity">This link expires in <strong>24 hours</strong></p>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getPasswordResetEmailTemplate = (userName, resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 60px 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                max-width: 420px;
                margin-left: auto;
                margin-right: auto;
                line-height: 1.8;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 18px 60px; 
                text-decoration: none; 
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .warning-box { 
                background-color: #fafafa; 
                border-left: 4px solid #000000; 
                padding: 20px 25px; 
                margin: 40px 0;
                text-align: left;
            }
            .warning-box p {
                color: #666666;
                font-size: 14px;
                line-height: 1.7;
            }
            .warning-box strong {
                color: #333333;
            }
            .note {
                color: #999999;
                font-size: 14px;
                margin-top: 30px;
                padding-top: 30px;
                border-top: 1px solid #e0e0e0;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Reset Password</div>
            </div>
            <div class="content">
                <div class="icon-circle">🔑</div>
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">We received a request to reset your password. Click the button below to create a new password for your account.</p>
                
                <a href="${resetLink}" class="button">Reset My Password</a>
                
                <div class="warning-box">
                    <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
                </div>
                
                <p class="note">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getWelcomeEmailTemplate = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 60px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 32px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 4px;
                margin-bottom: 20px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 20px; 
                font-weight: 300;
                letter-spacing: 3px;
                text-transform: uppercase;
            }
            .content { 
                padding: 60px 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 90px;
                height: 90px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 42px;
            }
            .greeting { 
                color: #333333; 
                font-size: 26px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 40px;
                line-height: 1.8;
            }
            .features { 
                background-color: #fafafa; 
                padding: 35px; 
                margin: 30px 0;
                text-align: left;
            }
            .features-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #333333;
                margin: 0 0 25px 0;
                font-weight: 600;
                text-align: center;
            }
            .feature-item { 
                display: flex; 
                align-items: center; 
                margin: 18px 0;
                color: #666666;
                font-size: 15px;
            }
            .feature-bullet {
                width: 8px;
                height: 8px;
                background-color: #000000;
                margin-right: 18px;
                flex-shrink: 0;
            }
            .button-wrapper {
                margin: 40px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 18px 60px; 
                text-decoration: none; 
                font-size: 14px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Welcome Aboard</div>
            </div>
            <div class="content">
                <div class="icon-circle">🎉</div>
                <p class="greeting">Hello, ${userName}!</p>
                <p class="message">Your registration is complete. Welcome to Wash2Door – your trusted partner for premium car care services.</p>
                
                <div class="features">
                    <p class="features-title">What You Can Do Now</p>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Browse our premium car washing services</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Book appointments at your convenience</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Track your bookings in real-time</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-bullet"></span>
                        <span>Receive updates and exclusive offers</span>
                    </div>
                </div>
                
                <div class="button-wrapper">
                    <a href="${process.env.FRONTEND_URL}/services" class="button">Explore Services</a>
                </div>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getPasswordChangeConfirmationTemplate = (userName) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 60px 50px; 
                text-align: center;
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
            }
            .greeting { 
                color: #333333; 
                font-size: 24px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .success-box { 
                background-color: #fafafa; 
                border-left: 4px solid #000000; 
                padding: 25px 30px; 
                margin: 30px 0;
                text-align: left;
            }
            .success-box p {
                color: #333333;
                font-size: 16px;
                font-weight: 500;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin: 30px 0;
                line-height: 1.8;
                text-align: left;
            }
            .warning-box { 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
                padding: 25px 30px; 
                margin: 30px 0;
                text-align: left;
            }
            .warning-title {
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #333333;
                margin: 0 0 12px 0;
                font-weight: 600;
            }
            .warning-box p.warning-text {
                color: #666666;
                font-size: 14px;
                line-height: 1.7;
            }
            .details {
                color: #999999;
                font-size: 13px;
                margin-top: 35px;
                padding-top: 25px;
                border-top: 1px solid #e0e0e0;
            }
            .details strong {
                color: #666666;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Security Update</div>
            </div>
            <div class="content">
                <div class="icon-circle">✓</div>
                <p class="greeting">Hello, ${userName}</p>
                
                <div class="success-box">
                    <p>Your password has been changed successfully.</p>
                </div>
                
                <p class="message">Your account password was recently updated. If you made this change, no further action is required. Your account is now secured with your new password.</p>
                
                <div class="warning-box">
                    <p class="warning-title">Wasn't You?</p>
                    <p class="warning-text">If you did not make this change, please contact our support team immediately and take steps to secure your account.</p>
                </div>
                
                <p class="details"><strong>Changed at:</strong> ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</p>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

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
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .booking-code-section {
                background-color: #fafafa;
                padding: 30px;
                text-align: center;
                border-bottom: 1px solid #e0e0e0;
            }
            .booking-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #999999;
                margin-bottom: 10px;
            }
            .booking-code {
                font-size: 32px;
                font-weight: 700;
                color: #000000;
                letter-spacing: 4px;
                font-family: 'Courier New', monospace;
            }
            .content { 
                padding: 40px 50px; 
            }
            .greeting { 
                color: #333333; 
                font-size: 20px;
                font-weight: 500;
                margin-bottom: 10px;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin-bottom: 35px;
            }
            .section {
                margin: 30px 0;
            }
            .section-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #333333;
                font-weight: 600;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e0e0e0;
            }
            .info-grid {
                display: table;
                width: 100%;
            }
            .info-row {
                display: table-row;
            }
            .info-label {
                display: table-cell;
                padding: 12px 0;
                color: #888888;
                font-size: 14px;
                width: 40%;
            }
            .info-value {
                display: table-cell;
                padding: 12px 0;
                color: #333333;
                font-size: 14px;
                font-weight: 500;
            }
            .price-box {
                background-color: #000000;
                padding: 25px 30px;
                margin: 30px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .price-label {
                color: #888888;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .price-value {
                color: #ffffff;
                font-size: 28px;
                font-weight: 700;
            }
            .note {
                background-color: #fafafa;
                border-left: 4px solid #000000;
                padding: 20px 25px;
                margin: 30px 0;
            }
            .note p {
                color: #666666;
                font-size: 14px;
                line-height: 1.7;
            }
            .button-wrapper {
                text-align: center;
                margin: 35px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 16px 50px; 
                text-decoration: none; 
                font-size: 13px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Booking Confirmed</div>
            </div>
            
            <div class="booking-code-section">
                <div class="booking-label">Booking Reference</div>
                <div class="booking-code">${booking.bookingCode}</div>
            </div>
            
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">Your booking has been confirmed. Here are your appointment details:</p>
                
                <div class="section">
                    <div class="section-title">Service Details</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Service</span>
                            <span class="info-value">${booking.serviceName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Category</span>
                            <span class="info-value">${booking.serviceCategory}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration</span>
                            <span class="info-value">${booking.duration} minutes</span>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Schedule</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Date</span>
                            <span class="info-value">${bookingDateFormatted}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Time Slot</span>
                            <span class="info-value">${booking.timeSlot}</span>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Location</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Address</span>
                            <span class="info-value">${booking.location.address}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">City</span>
                            <span class="info-value">${booking.location.city}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Contact</span>
                            <span class="info-value">${booking.phone}</span>
                        </div>
                    </div>
                </div>
                
                <div class="price-box">
                    <span class="price-label">Total Amount</span>
                    <span class="price-value">₹${booking.price}</span>
                </div>
                
                <div class="note">
                    <p>Please ensure you are available at the scheduled time. Our team will arrive at your location as per the booking.</p>
                </div>
                
                <div class="button-wrapper">
                    <a href="${process.env.FRONTEND_URL}/bookings" class="button">View My Bookings</a>
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getBookingCancellationTemplate = (userName, booking) => {
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
        <title>Booking Cancelled</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px; 
            }
            .icon-circle {
                width: 80px;
                height: 80px;
                border: 2px solid #000000;
                border-radius: 50%;
                margin: 0 auto 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 22px;
                font-weight: 500;
                margin-bottom: 15px;
                text-align: center;
            }
            .cancel-notice { 
                background-color: #fafafa; 
                border-left: 4px solid #000000; 
                padding: 25px 30px; 
                margin: 30px 0;
            }
            .cancel-notice p {
                color: #333333;
                font-size: 16px;
                margin-bottom: 10px;
            }
            .cancel-notice .reason {
                color: #666666;
                font-size: 14px;
                margin-top: 10px;
                font-style: italic;
            }
            .section-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #333333;
                font-weight: 600;
                margin: 35px 0 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e0e0e0;
            }
            .info-box { 
                background-color: #fafafa; 
                padding: 25px 30px; 
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
                font-size: 14px;
            }
            .info-value { 
                color: #333333; 
                font-size: 14px;
                font-weight: 500;
            }
            .message { 
                color: #666666; 
                font-size: 15px;
                margin: 35px 0;
                text-align: center;
                line-height: 1.8;
            }
            .button-wrapper {
                text-align: center;
                margin: 30px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 16px 50px; 
                text-decoration: none; 
                font-size: 13px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Booking Cancelled</div>
            </div>
            <div class="content">
                <div class="icon-circle">✕</div>
                <p class="greeting">Hello, ${userName}</p>
                
                <div class="cancel-notice">
                    <p>Your booking has been cancelled.</p>
                    ${booking.cancellationReason ? `<p class="reason">Reason: ${booking.cancellationReason}</p>` : ''}
                </div>
                
                <div class="section-title">Cancelled Booking Details</div>
                <div class="info-box">
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
                        <span class="info-value">${bookingDateFormatted}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Time Slot</span>
                        <span class="info-value">${booking.timeSlot}</span>
                    </div>
                </div>
                
                <p class="message">We're sorry to see this booking cancelled. If you'd like to reschedule or book a new appointment, we're here to help.</p>
                
                <div class="button-wrapper">
                    <a href="${process.env.FRONTEND_URL}/services" class="button">Book New Service</a>
                </div>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getBookingStatusTemplate = (userName, booking) => {
    const statusMessages = {
        'pending': 'Your booking is pending confirmation.',
        'confirmed': 'Great news! Your booking has been confirmed.',
        'in-progress': 'Your service is currently in progress.',
        'completed': 'Your service has been completed successfully.',
        'cancelled': 'Your booking has been cancelled.'
    };

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Status Update</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Helvetica Neue', Arial, sans-serif; 
                background-color: #f5f5f5; 
                line-height: 1.6;
                padding: 40px 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                border: 1px solid #e0e0e0;
            }
            .header { 
                background-color: #000000; 
                padding: 50px 30px; 
                text-align: center; 
            }
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 3px;
                margin-bottom: 15px;
            }
            .header-title { 
                color: #ffffff; 
                font-size: 18px; 
                font-weight: 300;
                letter-spacing: 2px;
                text-transform: uppercase;
            }
            .content { 
                padding: 50px; 
                text-align: center;
            }
            .greeting { 
                color: #333333; 
                font-size: 22px;
                font-weight: 500;
                margin-bottom: 15px;
            }
            .message { 
                color: #666666; 
                font-size: 16px;
                margin-bottom: 35px;
                line-height: 1.7;
            }
            .status-box {
                background-color: #000000;
                padding: 30px 50px;
                display: inline-block;
                margin: 25px 0;
            }
            .status-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #888888;
                margin-bottom: 12px;
            }
            .status-value { 
                color: #ffffff; 
                font-size: 24px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 3px;
            }
            .section-title {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #333333;
                font-weight: 600;
                margin: 35px 0 20px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e0e0e0;
                text-align: left;
            }
            .info-box { 
                background-color: #fafafa; 
                padding: 25px 30px; 
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
                font-size: 14px;
            }
            .info-value { 
                color: #333333; 
                font-size: 14px;
                font-weight: 500;
            }
            .button-wrapper {
                text-align: center;
                margin: 35px 0;
            }
            .button { 
                display: inline-block; 
                background-color: #000000; 
                color: #ffffff !important; 
                padding: 16px 50px; 
                text-decoration: none; 
                font-size: 13px;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .footer { 
                background-color: #000000; 
                padding: 40px 30px; 
                text-align: center; 
            }
            .footer-brand {
                font-size: 18px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: 2px;
                margin-bottom: 10px;
            }
            .footer p { 
                color: #888888; 
                font-size: 12px; 
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">WASH2DOOR</div>
                <div class="header-title">Status Update</div>
            </div>
            <div class="content">
                <p class="greeting">Hello, ${userName}</p>
                <p class="message">${statusMessages[booking.status] || 'Your booking status has been updated.'}</p>
                
                <div class="status-box">
                    <div class="status-label">Current Status</div>
                    <div class="status-value">${booking.status.replace('-', ' ')}</div>
                </div>
                
                <div class="section-title">Booking Details</div>
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
                        <span class="info-value">${new Date(booking.bookingDate).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Time</span>
                        <span class="info-value">${booking.timeSlot}</span>
                    </div>
                </div>
                
                <div class="button-wrapper">
                    <a href="${process.env.FRONTEND_URL}/bookings" class="button">View Booking Details</a>
                </div>
            </div>
            <div class="footer">
                <div class="footer-brand">WASH2DOOR</div>
                <p>&copy; ${new Date().getFullYear()} All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
};