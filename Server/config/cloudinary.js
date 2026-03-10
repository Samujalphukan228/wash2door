import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// SERVICE IMAGES STORAGE (3 images)
// ============================================
const serviceStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/services',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'fill', quality: 'auto' }]
    }
});

// ============================================
// VEHICLE TYPE IMAGE STORAGE (1 image per vehicle)
// ============================================
const vehicleStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/vehicles',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

// ============================================
// PROFILE AVATAR STORAGE
// ============================================
const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'wash2door/avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG, PNG, WEBP images are allowed!'), false);
    }
};

// Multer instances
export const uploadServiceImages = multer({
    storage: serviceStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).array('images', 3);

export const uploadVehicleImage = multer({
    storage: vehicleStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

export const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
}).single('avatar');

// ✅ FIXED: Accept publicId directly instead of URL
export const deleteCloudinaryImage = async (publicId) => {
    try {
        if (!publicId || publicId.includes('default')) return;
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Deleted image: ${publicId}`);
    } catch (error) {
        console.error('Error deleting cloudinary image:', error.message);
    }
};

export default cloudinary;