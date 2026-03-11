import User from '../models/User.js';
import { verifyAccessToken } from '../utils/generateToken.js';

export const protect = async (req, res, next) => {
    console.log('🔐 Protect middleware called');
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    
    try {
        let token;

        // Check for token in header or cookie
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('✅ Token from header');
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
            console.log('✅ Token from cookie');
        }

        if (!token) {
            console.log('❌ No token found');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        console.log('🔑 Verifying token...');
        const decoded = verifyAccessToken(token);

        if (!decoded) {
            console.log('❌ Token verification failed');
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        console.log('✅ Token valid, user ID:', decoded.id);

        // Find user
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ User not active');
            return res.status(401).json({
                success: false,
                message: 'Account has been deactivated'
            });
        }

        // Check if user is blocked
        if (user.isBlocked) {
            console.log('❌ User blocked');
            return res.status(403).json({
                success: false,
                message: 'Account has been blocked. Please contact support.',
                reason: user.blockedReason || 'No reason provided'
            });
        }

        // Check if password was changed after token was issued
        if (typeof user.changedPasswordAfter === 'function') {
            if (user.changedPasswordAfter(decoded.iat)) {
                console.log('❌ Password changed after token issued');
                return res.status(401).json({
                    success: false,
                    message: 'Password recently changed. Please login again.'
                });
            }
        }

        console.log('✅ Auth successful:', user.email, '| Role:', user.role);
        req.user = user;
        next();

    } catch (error) {
        console.error('❌ Auth middleware error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const isAdmin = (req, res, next) => {
    console.log('👑 isAdmin check for:', req.user?.email, '| Role:', req.user?.role);
    
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.user.role !== 'admin') {
        console.log('❌ Not admin');
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    console.log('✅ Admin verified');
    next();
};

export const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.user.role !== 'user') {
        return res.status(403).json({
            success: false,
            message: 'User access required'
        });
    }

    next();
};

// Optional: Middleware that doesn't require auth but attaches user if token exists
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }

        if (token) {
            const decoded = verifyAccessToken(token);
            if (decoded) {
                const user = await User.findById(decoded.id).select('-password');
                if (user && user.isActive && !user.isBlocked) {
                    req.user = user;
                }
            }
        }

        next();
    } catch (error) {
        // Silently continue without auth
        next();
    }
};