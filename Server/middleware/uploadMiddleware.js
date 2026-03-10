// middleware/uploadMiddleware.js

import { uploadServiceImages, uploadVehicleImage, uploadAvatar } from '../config/cloudinary.js';

// Handle multer errors
const handleMulterError = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 5MB'
        });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 3 images allowed'
        });
    }
    if (err.message) {
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next(err);
};

// Service images upload middleware (max 3)
export const handleServiceImageUpload = (req, res, next) => {
    uploadServiceImages(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
};

// Vehicle image upload middleware (1 image)
export const handleVehicleImageUpload = (req, res, next) => {
    uploadVehicleImage(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
};

// Avatar upload middleware
export const handleAvatarUpload = (req, res, next) => {
    uploadAvatar(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
    });
};