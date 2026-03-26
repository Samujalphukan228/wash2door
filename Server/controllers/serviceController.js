import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { deleteCloudinaryImage } from '../config/cloudinary.js';
import { emitServiceUpdate } from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL SERVICES (ADMIN)
// ============================================
export const getAllServicesAdmin = async (req, res) => {
    try {
        const {
            category, subcategory, tier, isActive, isFeatured,
            search, page = 1, limit = 12,
            sortBy = 'displayOrder', sortOrder = 'asc'
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;
        const query = {};

        if (category && isValidObjectId(category)) query.category = category;
        if (subcategory && isValidObjectId(subcategory)) query.subcategory = subcategory;
        if (tier) query.tier = tier;
        if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
        if (isFeatured !== undefined && isFeatured !== '') query.isFeatured = isFeatured === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const total = await Service.countDocuments(query);
        const services = await Service.find(query)
            .populate('category', 'name slug icon')
            .populate('subcategory', 'name slug icon')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        res.status(200).json({
            success: true, total,
            pages: Math.ceil(total / limitNum),
            page: pageNum, data: services
        });

    } catch (error) {
        console.error('getAllServicesAdmin ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching services' });
    }
};

// ============================================
// GET SINGLE SERVICE (ADMIN)
// ============================================
export const getServiceById = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId)
            .populate('category', 'name slug icon')
            .populate('subcategory', 'name slug icon')
            .populate('createdBy', 'firstName lastName');

        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        res.status(200).json({ success: true, data: service });

    } catch (error) {
        console.error('getServiceById ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching service' });
    }
};

// ============================================
// CREATE SERVICE (ADMIN)
// ============================================
export const createService = async (req, res) => {
    try {
        const {
            category,
            subcategory,
            name,
            tier,
            price,
            discountPrice,
            duration,
            features,
            isActive,
            isFeatured,
            displayOrder
        } = req.body;

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Validate subcategory exists
        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check duplicate tier in same subcategory
        const existingService = await Service.findOne({ subcategory, tier });
        if (existingService) {
            return res.status(400).json({
                success: false,
                message: `Service with tier '${tier}' already exists in this subcategory`
            });
        }

        // Handle images
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                isPrimary: index === 0
            }));
        }

        // Parse features if sent as string
        let parsedFeatures = [];
        if (features) {
            parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
        }

        const service = await Service.create({
            category,
            subcategory,
            name,
            tier,
            price,
            discountPrice,
            duration,
            features: parsedFeatures,
            images,
            isActive,
            isFeatured,
            displayOrder,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('createService ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error creating service' });
    }
};

// ============================================
// UPDATE SERVICE (ADMIN)
// ============================================
export const updateService = async (req, res) => {
    try {
        const { serviceId: id } = req.params;
        const {
            category,
            subcategory,
            name,
            tier,
            price,
            discountPrice,
            duration,
            features,
            isActive,
            isFeatured,
            displayOrder
        } = req.body;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check duplicate tier if tier or subcategory changed
        if (tier || subcategory) {
            const checkSubcategory = subcategory || service.subcategory;
            const checkTier = tier || service.tier;

            const existingService = await Service.findOne({
                subcategory: checkSubcategory,
                tier: checkTier,
                _id: { $ne: id }
            });

            if (existingService) {
                return res.status(400).json({
                    success: false,
                    message: `Service with tier '${checkTier}' already exists in this subcategory`
                });
            }
        }

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map((file, index) => ({
                url: file.path,
                publicId: file.filename,
                isPrimary: service.images.length === 0 && index === 0
            }));
            service.images.push(...newImages);
        }

        // Parse features if sent as string
        let parsedFeatures;
        if (features) {
            parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
        }

        // Update fields
        if (category) service.category = category;
        if (subcategory) service.subcategory = subcategory;
        if (name) service.name = name;
        if (tier) service.tier = tier;
        if (price !== undefined) service.price = price;
        if (discountPrice !== undefined) service.discountPrice = discountPrice;
        if (duration) service.duration = duration;
        if (parsedFeatures) service.features = parsedFeatures;
        if (isActive !== undefined) service.isActive = isActive;
        if (isFeatured !== undefined) service.isFeatured = isFeatured;
        if (displayOrder !== undefined) service.displayOrder = displayOrder;

        await service.save();

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('updateService ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error updating service' });
    }
};

// ============================================
// DELETE SERVICE (ADMIN)
// ============================================
export const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const activeBookings = await Booking.countDocuments({
            serviceId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete service with ${activeBookings} active booking(s). Cancel or complete them first.`
            });
        }

        const categoryId = service.category;
        const subcategoryId = service.subcategory;

        for (const image of service.images) {
            if (image.publicId) await deleteCloudinaryImage(image.publicId);
        }

        await service.deleteOne();
        await updateCategoryCounts(categoryId);
        await updateSubcategoryServiceCount(subcategoryId);

        emitServiceUpdate({ _id: service._id, name: service.name, category: categoryId, subcategory: subcategoryId }, 'deleted');

        res.status(200).json({ success: true, message: 'Service deleted successfully' });

    } catch (error) {
        console.error('deleteService ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error deleting service' });
    }
};

// ============================================
// SET PRIMARY IMAGE
// ============================================
export const setPrimaryImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        service.images.forEach(img => img.isPrimary = false);
        const image = service.images.id(imageId);
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

        image.isPrimary = true;
        await service.save();

        res.status(200).json({ success: true, message: 'Primary image updated', data: service });

    } catch (error) {
        console.error('setPrimaryImage ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error setting primary image' });
    }
};

// ============================================
// DELETE IMAGE
// ============================================
export const deleteImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        const image = service.images.id(imageId);
        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

        if (image.publicId) await deleteCloudinaryImage(image.publicId);

        const wasPrimary = image.isPrimary;
        service.images.pull(imageId);
        if (wasPrimary && service.images.length > 0) service.images[0].isPrimary = true;

        await service.save();

        res.status(200).json({ success: true, message: 'Image deleted successfully', data: service });

    } catch (error) {
        console.error('deleteImage ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error deleting image' });
    }
};

// ============================================
// TOGGLE FEATURED
// ============================================
export const toggleFeatured = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        service.isFeatured = !service.isFeatured;
        await service.save();
        emitServiceUpdate(service, 'updated');

        res.status(200).json({ success: true, message: `Service ${service.isFeatured ? 'featured' : 'unfeatured'}`, data: service });

    } catch (error) {
        console.error('toggleFeatured ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error toggling featured status' });
    }
};

// ============================================
// TOGGLE ACTIVE
// ============================================
export const toggleActive = async (req, res) => {
    try {
        const { serviceId } = req.params;
        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        if (!service.isActive) {
            const parentCategory = await Category.findById(service.category);
            if (!parentCategory || !parentCategory.isActive) {
                return res.status(400).json({ success: false, message: 'Cannot activate service when parent category is inactive' });
            }
            const parentSubcategory = await Subcategory.findById(service.subcategory);
            if (!parentSubcategory || !parentSubcategory.isActive) {
                return res.status(400).json({ success: false, message: 'Cannot activate service when parent subcategory is inactive' });
            }
        }

        if (service.isActive) {
            const activeBookings = await Booking.countDocuments({
                serviceId,
                status: { $in: ['pending', 'confirmed', 'in-progress'] }
            });
            if (activeBookings > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot deactivate service with ${activeBookings} active booking(s)`
                });
            }
        }

        service.isActive = !service.isActive;
        await service.save();
        await updateCategoryCounts(service.category);
        await updateSubcategoryServiceCount(service.subcategory);
        emitServiceUpdate(service, 'updated');

        res.status(200).json({ success: true, message: `Service ${service.isActive ? 'activated' : 'deactivated'}`, data: service });

    } catch (error) {
        console.error('toggleActive ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error toggling active status' });
    }
};

// ============================================
// REORDER SERVICES
// ============================================
export const reorderServices = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: 'orderedIds array is required' });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: { filter: { _id: id }, update: { displayOrder: index } }
        }));

        await Service.bulkWrite(bulkOps);

        res.status(200).json({ success: true, message: 'Services reordered successfully' });

    } catch (error) {
        console.error('reorderServices ERROR:', error.message);
        res.status(500).json({ success: false, message: 'Error reordering services' });
    }
};

// ============================================
// HELPERS
// ============================================
const updateCategoryCounts = async (categoryId) => {
    try {
        const subcategoryCount = await Subcategory.countDocuments({ category: categoryId, isActive: true });
        const serviceCount = await Service.countDocuments({ category: categoryId, isActive: true });
        await Category.findByIdAndUpdate(categoryId, { totalSubcategories: subcategoryCount, totalServices: serviceCount });
    } catch (err) {
        console.error('Error updating category counts:', err);
    }
};

const updateSubcategoryServiceCount = async (subcategoryId) => {
    try {
        const count = await Service.countDocuments({ subcategory: subcategoryId, isActive: true });
        await Subcategory.findByIdAndUpdate(subcategoryId, { totalServices: count });
    } catch (err) {
        console.error('Error updating subcategory service count:', err);
    }
};

export default {
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    setPrimaryImage,
    deleteImage,
    toggleFeatured,
    toggleActive,
    reorderServices
};