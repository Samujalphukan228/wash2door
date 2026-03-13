// middleware/uploadMiddleware.js - COMPLETE FILE (Single source for all uploads)

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Ensure cloudinary is configured
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// FILE FILTER
// ============================================
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP images are allowed!'), false);
    }
};

// ============================================
// CLOUDINARY STORAGES
// ============================================
const categoryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/categories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

const serviceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/services',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }]
    }
});

const variantStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/variants',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }]
    }
});

// ============================================
// MULTER INSTANCES
// ============================================
const uploadCategoryImage = multer({
    storage: categoryStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

const uploadServiceImages = multer({
    storage: serviceStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array('images', 3);

const uploadVariantImage = multer({
    storage: variantStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
}).single('avatar');

// ============================================
// MIDDLEWARE HANDLERS
// ============================================

export const handleCategoryImageUpload = (req, res, next) => {
    uploadCategoryImage(req, res, (err) => {
        if (err) {
            console.error('❌ Category upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.'
                });
            }

            if (err.message.includes('Only')) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Image upload failed'
            });
        }

        next();
    });
};

export const handleServiceImageUpload = (req, res, next) => {
    uploadServiceImages(req, res, (err) => {
        if (err) {
            console.error('❌ Service upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB per image.'
                });
            }

            if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 3 images allowed.'
                });
            }

            if (err.message.includes('Only')) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Image upload failed'
            });
        }

        next();
    });
};

export const handleVariantImageUpload = (req, res, next) => {
    uploadVariantImage(req, res, (err) => {
        if (err) {
            console.error('❌ Variant upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 5MB.'
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Image upload failed'
            });
        }

        next();
    });
};

export const handleAvatarUpload = (req, res, next) => {
    uploadAvatar(req, res, (err) => {
        if (err) {
            console.error('❌ Avatar upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Maximum size is 2MB.'
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Avatar upload failed'
            });
        }

        next();
    });
};

// Export raw multer instances if needed elsewhere
export {
    uploadCategoryImage,
    uploadServiceImages,
    uploadVariantImage,
    uploadAvatar
};