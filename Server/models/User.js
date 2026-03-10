// models/User.js - FIXED: Removed duplicate email index

import mongoose from 'mongoose';
import argon2 from 'argon2';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please enter a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    registrationStatus: {
        type: String,
        enum: ['pending', 'otp-sent', 'otp-verified', 'completed', 'failed'],
        default: 'pending'
    },
    registrationCompletedAt: Date,

    // OTP
    otp: String,
    otpExpire: Date,
    otpAttempts: {
        type: Number,
        default: 0
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    otpVerifiedAt: Date,

    // EMAIL VERIFICATION
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // ACCOUNT STATUS
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: String,
    blockedAt: Date,

    // PASSWORD RESET
    passwordResetToken: String,
    passwordResetExpire: Date,

    // REFRESH TOKEN
    refreshToken: String,

    // SECURITY
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    lastLogin: Date,
    passwordChangedAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ============================================
// VIRTUALS
// ============================================

userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// ============================================
// INDEXES
// ✅ FIXED: Removed duplicate email index
// email index is auto created by unique: true above
// ============================================

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ registrationStatus: 1 });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        this.password = await argon2.hash(this.password, {
            type: argon2.argon2id,
            memoryCost: 65536,
            timeCost: 3,
            parallelism: 4,
            hashLength: 32
        });

        if (!this.isNew) {
            this.passwordChangedAt = Date.now() - 1000;
        }

        next();
    } catch (error) {
        next(error);
    }
});

// ============================================
// INSTANCE METHODS
// ============================================

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await argon2.verify(this.password, candidatePassword);
    } catch (error) {
        return false;
    }
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.generateOTP = function() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.otp = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    this.otpExpire = Date.now() + 10 * 60 * 1000;
    this.otpAttempts = 0;

    return otp;
};

userSchema.methods.verifyOTP = async function(candidateOTP) {
    try {
        if (this.otpExpire < Date.now()) {
            return {
                success: false,
                message: 'OTP has expired. Please request a new one.'
            };
        }

        if (this.otpAttempts >= 5) {
            return {
                success: false,
                message: 'Too many failed OTP attempts. Please request a new OTP.'
            };
        }

        const hashedCandidate = crypto
            .createHash('sha256')
            .update(candidateOTP)
            .digest('hex');

        const isValid = hashedCandidate === this.otp;

        if (!isValid) {
            this.otpAttempts += 1;
            await this.save({ validateBeforeSave: false });

            return {
                success: false,
                message: 'Invalid OTP',
                attemptsRemaining: 5 - this.otpAttempts
            };
        }

        this.otpVerified = true;
        this.otpVerifiedAt = new Date();
        this.otp = undefined;
        this.otpExpire = undefined;
        this.otpAttempts = 0;

        return {
            success: true,
            message: 'OTP verified successfully'
        };

    } catch (error) {
        return {
            success: false,
            message: 'OTP verification failed'
        };
    }
};

userSchema.methods.generateEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

userSchema.methods.generatePasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpire = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.incrementLoginAttempts = async function() {
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
        updates.$set = {
            lockUntil: Date.now() + 2 * 60 * 60 * 1000
        };
    }

    return await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function() {
    return await this.updateOne({
        $set: { loginAttempts: 0, lastLogin: Date.now() },
        $unset: { lockUntil: 1 }
    });
};

// ============================================
// STATIC METHODS
// ============================================

userSchema.statics.cleanupUnverifiedRegistrations = async function() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await this.deleteMany({
        registrationStatus: { $ne: 'completed' },
        otpVerified: false,
        createdAt: { $lt: oneHourAgo }
    });

    return result.deletedCount;
};

userSchema.statics.findForRegistration = async function(email) {
    const user = await this.findOne({ email: email.toLowerCase() });

    if (!user) {
        return {
            exists: false,
            canRegister: true,
            user: null
        };
    }

    if (user.registrationStatus === 'completed') {
        return {
            exists: true,
            canRegister: false,
            user,
            message: 'User with this email already exists'
        };
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    if (user.createdAt < oneHourAgo) {
        await user.deleteOne();
        return {
            exists: false,
            canRegister: true,
            user: null
        };
    }

    return {
        exists: true,
        canRegister: false,
        user,
        isPending: true,
        registrationStatus: user.registrationStatus,
        message: `Registration in progress. Current status: ${user.registrationStatus}.`
    };
};

const User = mongoose.model('User', userSchema);

export default User;