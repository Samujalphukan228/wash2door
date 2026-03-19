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
            name, category, subcategory, tier,
            price, discountPrice, duration
        } = req.body;

        // ✅ Validate required fields
        if (!name || !category || !subcategory || !price || !duration) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({
                success: false,
                message: 'Name, category, subcategory, price and duration are required'
            });
        }

        if (!isValidObjectId(category) || !isValidObjectId(subcategory)) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Invalid category or subcategory ID' });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Category not found' });
        }
        if (!categoryExists.isActive) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Cannot add service to inactive category' });
        }

        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Subcategory not found' });
        }
        if (!subcategoryExists.isActive) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Cannot add service to inactive subcategory' });
        }
        if (subcategoryExists.category.toString() !== category) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Subcategory does not belong to selected category' });
        }

        const validTiers = ['basic', 'standard', 'premium', 'custom'];
        const serviceTier = validTiers.includes(tier) ? tier : 'basic';

        // Check subcategory + tier uniqueness
        const existingService = await Service.findOne({ subcategory, tier: serviceTier });
        if (existingService) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({
                success: false,
                message: `A ${serviceTier} service already exists for ${subcategoryExists.name}`
            });
        }

        // Process images (OPTIONAL - MAX 3)
        const serviceImages = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach((file, index) => {
                serviceImages.push({
                    url: file.path,
                    publicId: file.filename,
                    isPrimary: index === 0
                });
            });
        }

        const service = await Service.create({
            name: name.trim(),
            category,
            subcategory,
            tier: serviceTier,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            duration: Number(duration),
            images: serviceImages,
            createdBy: req.user._id
        });

        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');
        await updateCategoryCounts(category);

        emitServiceUpdate(service, 'created');

        res.status(201).json({ success: true, message: 'Service created successfully', data: service });

    } catch (error) {
        console.error('createService ERROR:', error.message);
        if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);

        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A service with this configuration already exists' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
        }
        res.status(500).json({ success: false, message: 'Error creating service' });
    }
};

// ============================================
// UPDATE SERVICE (ADMIN)
// ============================================
export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(400).json({ success: false, message: 'Invalid service ID' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        const {
            name, category, subcategory, tier,
            price, discountPrice, duration,
            isActive, isFeatured, removeImages
        } = req.body;

        const oldCategoryId = service.category;
        const oldSubcategoryId = service.subcategory;

        // Category change
        if (category && category !== service.category.toString()) {
            if (!isValidObjectId(category)) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Invalid category ID' });
            }
            const categoryExists = await Category.findById(category);
            if (!categoryExists || !categoryExists.isActive) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Category not found or inactive' });
            }
            service.category = category;
        }

        // Subcategory change
        if (subcategory && subcategory !== service.subcategory.toString()) {
            if (!isValidObjectId(subcategory)) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Invalid subcategory ID' });
            }
            const subcategoryExists = await Subcategory.findById(subcategory);
            if (!subcategoryExists || !subcategoryExists.isActive) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Subcategory not found or inactive' });
            }
            const targetCategory = category || service.category.toString();
            if (subcategoryExists.category.toString() !== targetCategory) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Subcategory does not belong to selected category' });
            }
            service.subcategory = subcategory;
        }

        // Tier change - check uniqueness
        if (tier && tier !== service.tier) {
            const existingService = await Service.findOne({
                subcategory: subcategory || service.subcategory,
                tier,
                _id: { $ne: serviceId }
            });
            if (existingService) {
                if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: `A ${tier} service already exists for this subcategory` });
            }
            service.tier = tier;
        }

        // Remove images
        if (removeImages) {
            const imagesToRemove = Array.isArray(removeImages) ? removeImages : [removeImages];
            for (const publicId of imagesToRemove) {
                await deleteCloudinaryImage(publicId);
                service.images = service.images.filter(img => img.publicId !== publicId);
            }
        }

        // Add new images
        if (req.files && req.files.length > 0) {
            const availableSlots = 3 - service.images.length;
            if (availableSlots <= 0) {
                for (const f of req.files) await deleteCloudinaryImage(f.filename);
                return res.status(400).json({ success: false, message: 'Maximum 3 images allowed. Remove existing images first.' });
            }
            req.files.slice(0, availableSlots).forEach((file, index) => {
                service.images.push({
                    url: file.path,
                    publicId: file.filename,
                    isPrimary: service.images.length === 0 && index === 0
                });
            });
            for (const f of req.files.slice(availableSlots)) await deleteCloudinaryImage(f.filename);
        }

        // Update fields
        if (name) service.name = name.trim();
        if (price !== undefined) service.price = Number(price);
        if (discountPrice !== undefined) service.discountPrice = discountPrice ? Number(discountPrice) : null;
        if (duration !== undefined) service.duration = Number(duration);
        if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;
        if (isFeatured !== undefined) service.isFeatured = isFeatured === 'true' || isFeatured === true;

        await service.save();
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        if (category && category !== oldCategoryId.toString()) {
            await updateCategoryCounts(oldCategoryId);
            await updateCategoryCounts(category);
        } else {
            await updateCategoryCounts(service.category);
        }

        if (subcategory && subcategory !== oldSubcategoryId.toString()) {
            await updateSubcategoryServiceCount(oldSubcategoryId);
            await updateSubcategoryServiceCount(subcategory);
        } else {
            await updateSubcategoryServiceCount(service.subcategory);
        }

        emitServiceUpdate(service, 'updated');

        res.status(200).json({ success: true, message: 'Service updated successfully', data: service });

    } catch (error) {
        console.error('updateService ERROR:', error.message);
        if (req.files) for (const f of req.files) await deleteCloudinaryImage(f.filename);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'A service with this configuration already exists' });
        }
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