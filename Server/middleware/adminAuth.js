// middleware/adminAuth.js - FIXED: Wrong isAdmin check

import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized. Please login first.'
            });
        }

        const user = await User.findById(req.user._id);

        // ✅ FIXED: Changed user.isAdmin to user.role === 'admin'
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your admin account has been blocked.'
            });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Admin verification failed'
        });
    }
};

// ✅ FIXED: Changed user.isAdmin to role check
export const isNotAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admins cannot access this resource'
        });
    }
    next();
};