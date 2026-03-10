// utils/cleanup.js

import User from '../models/User.js';

export const cleanupUnverifiedRegistrations = async () => {
    try {
        const deletedCount = await User.cleanupUnverifiedRegistrations();
        
        if (deletedCount > 0) {
            console.log(`🧹 Cleanup: Removed ${deletedCount} unverified registration(s) older than 1 hour`);
        }
        
        return deletedCount;
    } catch (error) {
        console.error('❌ Unverified registration cleanup error:', error.message);
        return 0;
    }
};

export const cleanupExpiredTokens = async () => {
    try {
        const result = await User.updateMany(
            {
                $or: [
                    { emailVerificationExpire: { $lt: Date.now() } },
                    { passwordResetExpire: { $lt: Date.now() } },
                    { otpExpire: { $lt: Date.now() } }
                ]
            },
            {
                $unset: {
                    emailVerificationToken: 1,
                    emailVerificationExpire: 1,
                    passwordResetToken: 1,
                    passwordResetExpire: 1,
                    otp: 1,
                    otpExpire: 1
                }
            }
        );
        
        if (result.modifiedCount > 0) {
            console.log(`🧹 Cleanup: Cleared expired tokens for ${result.modifiedCount} user(s)`);
        }
        
        return result.modifiedCount;
    } catch (error) {
        console.error('❌ Token cleanup error:', error.message);
        return 0;
    }
};

export const runAllCleanupTasks = async () => {
    console.log('🔄 Running cleanup tasks...');
    
    await cleanupUnverifiedRegistrations();
    await cleanupExpiredTokens();
    
    console.log('✅ Cleanup tasks completed');
};

export const startCleanupScheduler = () => {
    setTimeout(() => {
        runAllCleanupTasks();
    }, 5000);
    
    const ONE_HOUR = 60 * 60 * 1000;
    setInterval(runAllCleanupTasks, ONE_HOUR);
    
    console.log('⏰ Cleanup scheduler started (runs every hour)');
};

export default {
    cleanupUnverifiedRegistrations,
    cleanupExpiredTokens,
    runAllCleanupTasks,
    startCleanupScheduler
};