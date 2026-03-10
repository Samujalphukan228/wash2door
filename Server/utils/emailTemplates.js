// utils/emailTemplates.js

export const getOTPEmailTemplate = (userName, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; text-align: center; }
            .content h2 { color: #333333; margin-top: 0; }
            .content p { color: #666666; line-height: 1.6; font-size: 16px; }
            .otp-box { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                border-radius: 12px; 
                padding: 30px; 
                margin: 30px 0; 
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            .otp-code { 
                font-size: 48px; 
                font-weight: bold; 
                color: #ffffff; 
                letter-spacing: 8px; 
                margin: 0;
                font-family: 'Courier New', monospace;
            }
            .otp-subtitle { color: #e0e0ff; font-size: 14px; margin-top: 10px; }
            .warning-box { 
                background-color: #fff3cd; 
                border-left: 4px solid #ffc107; 
                padding: 15px; 
                margin: 20px 0; 
                border-radius: 4px;
                text-align: left;
            }
            .timer { color: #f5576c; font-weight: bold; font-size: 18px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Verification Code</h1>
            </div>
            <div class="content">
                <h2>Hello, ${userName}! 👋</h2>
                <p>Your one-time verification code is:</p>
                
                <div class="otp-box">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-subtitle">Valid for 10 minutes</div>
                </div>
                
                <div class="warning-box">
                    <strong>⏰ Time Limit:</strong> This code expires in <span class="timer">10 minutes</span>
                </div>
                
                <p><strong>🔒 Security Tips:</strong></p>
                <ul style="text-align: left; color: #666666; display: inline-block;">
                    <li>Never share this code with anyone</li>
                    <li>Auth System will never ask for your OTP</li>
                    <li>If you didn't request this, ignore this email</li>
                </ul>
                
                <p style="margin-top: 30px; font-size: 14px; color: #999999;">
                    If the code doesn't work, request a new one from the registration page.
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Auth System. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333333; margin-top: 0; }
            .content p { color: #666666; line-height: 1.6; font-size: 16px; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
            .code-box { background-color: #f8f9fa; border: 2px dashed #667eea; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 14px; font-weight: bold; color: #667eea; word-break: break-all; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Confirm Your Email</h1>
            </div>
            <div class="content">
                <h2>Hello, ${userName}! 👋</h2>
                <p>Thank you for signing up! Please verify your email address to complete your registration and access all features.</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" class="button">✅ Verify Email</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <div class="code-box">
                    <span class="code">${verificationLink}</span>
                </div>
                <p><strong>⚠️ This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Auth System. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
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
        <title>Reset Your Password</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333333; margin-top: 0; }
            .content p { color: #666666; line-height: 1.6; font-size: 16px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
            .warning-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔑 Password Reset</h1>
            </div>
            <div class="content">
                <h2>Hello, ${userName}!</h2>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="${resetLink}" class="button">🔄 Reset Password</a>
                </p>
                <div class="warning-box">
                    <strong>⏰ Important:</strong> This link will expire in <strong>1 hour</strong> for security reasons.
                </div>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px; color: #f5576c;">${resetLink}</p>
                <p>If you didn't request a password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Auth System. All rights reserved.</p>
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
        <title>Welcome!</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333333; margin-top: 0; }
            .content p { color: #666666; line-height: 1.6; font-size: 16px; }
            .features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin: 10px 0; }
            .feature-icon { font-size: 20px; margin-right: 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
                <h2>Hello, ${userName}! 👋</h2>
                <p>Your registration is complete! Welcome to our platform.</p>
                <div class="features">
                    <h3 style="margin-top: 0;">What you can do now:</h3>
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span>Access all platform features</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🔐</span>
                        <span>Secure your account with 2FA</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">📧</span>
                        <span>Receive important updates</span>
                    </div>
                </div>
                <p style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" class="button">🚀 Get Started</a>
                </p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Auth System. All rights reserved.</p>
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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f7fa; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .alert-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .warning-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Changed</h1>
            </div>
            <div class="content">
                <h2>Hello, ${userName}!</h2>
                <div class="alert-box">
                    <strong>✅ Success!</strong> Your password has been changed successfully.
                </div>
                <p>Your account password was recently changed. If you made this change, you can safely ignore this email.</p>
                <div class="warning-box">
                    <strong>⚠️ Didn't change your password?</strong><br>
                    If you didn't make this change, please contact our support team immediately and secure your account.
                </div>
                <p><strong>Changed at:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} Auth System. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};