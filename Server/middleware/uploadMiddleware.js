// middleware/uploadMiddleware.js

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// STORAGES
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
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadServiceImages = multer({
    storage: serviceStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array('images', 3);

const uploadVariantImage = multer({
    storage: variantStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single('avatar');

// ============================================
// MIDDLEWARE HANDLERS
// ============================================

export const handleCategoryImageUpload = (req, res, next) => {
    console.log('📸 handleCategoryImageUpload called');

    uploadCategoryImage(req, res, (err) => {
        if (err) {
            console.error('❌ Category upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Max 5MB.'
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }

        console.log('📸 Category image uploaded:', req.file ? 'Yes' : 'No');
        next();
    });
};

export const handleServiceImageUpload = (req, res, next) => {
    console.log('📸 handleServiceImageUpload called');

    uploadServiceImages(req, res, (err) => {
        if (err) {
            console.error('❌ Service upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Max 5MB.'
                });
            }

            if (err.code === 'LIMIT_FILE_COUNT') {
                return res.status(400).json({
                    success: false,
                    message: 'Max 3 images allowed.'
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }

        console.log('📸 Service files uploaded:', req.files?.length || 0);
        next();
    });
};

export const handleVariantImageUpload = (req, res, next) => {
    console.log('📸 handleVariantImageUpload called');

    uploadVariantImage(req, res, (err) => {
        if (err) {
            console.error('❌ Variant upload error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }

        console.log('📸 Variant image uploaded:', req.file ? 'Yes' : 'No');
        next();
    });
};

export const handleAvatarUpload = (req, res, next) => {
    console.log('📸 handleAvatarUpload called');

    uploadAvatar(req, res, (err) => {
        if (err) {
            console.error('❌ Avatar upload error:', err.message);

            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File too large. Max 2MB.'
                });
            }

            return res.status(400).json({
                success: false,
                message: err.message || 'Avatar upload failed'
            });
        }

        console.log('📸 Avatar uploaded:', req.file ? 'Yes' : 'No');
        next();
    });
};