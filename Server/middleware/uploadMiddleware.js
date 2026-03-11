import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Service Images Storage
const serviceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'carwash/services',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }]
    }
});

// Vehicle Image Storage
const vehicleStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'carwash/vehicles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

// Avatar Storage  ← ADD THIS
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'carwash/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 300, height: 300, crop: 'fill', quality: 'auto' }]
    }
});

// Multer instances
const uploadServiceImages = multer({
    storage: serviceStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array('images', 3);

const uploadVehicleImage = multer({
    storage: vehicleStorage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

const uploadAvatar = multer({           // ← ADD THIS
    storage: avatarStorage,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single('avatar');

// Middleware handlers
export const handleServiceImageUpload = (req, res, next) => {
    console.log('📸 handleServiceImageUpload called');
    
    uploadServiceImages(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err.message);
            
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
        
        console.log('📸 Files uploaded:', req.files?.length || 0);
        next();
    });
};

export const handleVehicleImageUpload = (req, res, next) => {
    console.log('📸 handleVehicleImageUpload called');
    
    uploadVehicleImage(req, res, (err) => {
        if (err) {
            console.error('❌ Upload error:', err.message);
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }
        
        console.log('📸 File uploaded:', req.file ? 'Yes' : 'No');
        next();
    });
};

// ← ADD THIS WHOLE FUNCTION
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