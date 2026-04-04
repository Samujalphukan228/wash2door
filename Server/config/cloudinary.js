import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const getPublicIdFromUrl = (url) => {
    if (!url || url.includes('default')) return null;
    try {
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        if (uploadIndex === -1) return null;
        const pathAfterUpload = parts.slice(uploadIndex + 2).join('/');
        return pathAfterUpload.replace(/\.[^/.]+$/, '');
    } catch (error) {
        return null;
    }
};

export const deleteCloudinaryImage = async (publicIdOrUrl) => {
    try {
        if (!publicIdOrUrl || publicIdOrUrl.includes('default')) return;
        
        let publicId = publicIdOrUrl;
        
        if (publicIdOrUrl.startsWith('http')) {
            publicId = getPublicIdFromUrl(publicIdOrUrl);
            if (!publicId) return;
        }
        
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        return null;
    }
};

export const deleteMultipleImages = async (publicIds) => {
    try {
        const validIds = publicIds.filter(id => id && !id.includes('default'));
        if (validIds.length === 0) return;
        
        const result = await cloudinary.api.delete_resources(validIds);
        return result;
    } catch (error) {
        return null;
    }
};

export default cloudinary;