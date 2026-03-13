// config/cloudinary.js - CLEANED UP (removed duplicate storage definitions)

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Extract publicId from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
    if (!url || url.includes('default')) return null;
    try {
        // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.jpg
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex === -1) return null;
        
        // Get everything after 'upload/v123/'
        const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return pathAfterUpload.replace(/\.[^/.]+$/, '');
    } catch (error) {
        console.error('Error extracting publicId:', error.message);
        return null;
    }
};

// Delete image by publicId or URL
export const deleteCloudinaryImage = async (publicIdOrUrl) => {
    try {
        if (!publicIdOrUrl || publicIdOrUrl.includes('default')) return;
        
        let publicId = publicIdOrUrl;
        
        // If it's a URL, extract the publicId
        if (publicIdOrUrl.startsWith('http')) {
            publicId = getPublicIdFromUrl(publicIdOrUrl);
            if (!publicId) return;
        }
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            console.log(`🗑️ Deleted image: ${publicId}`);
        } else {
            console.log(`⚠️ Image not found or already deleted: ${publicId}`);
        }
        
        return result;
    } catch (error) {
        console.error('Error deleting cloudinary image:', error.message);
    }
};

// Delete multiple images
export const deleteMultipleImages = async (publicIds) => {
    try {
        const validIds = publicIds.filter(id => id && !id.includes('default'));
        if (validIds.length === 0) return;
        
        const result = await cloudinary.api.delete_resources(validIds);
        console.log(`🗑️ Deleted ${Object.keys(result.deleted).length} images`);
        return result;
    } catch (error) {
        console.error('Error deleting multiple images:', error.message);
    }
};

export default cloudinary;