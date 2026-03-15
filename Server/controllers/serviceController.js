// controllers/serviceController.js - COMPLETE with subcategory

import Service from '../models/Service.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { deleteCloudinaryImage } from '../config/cloudinary.js';
import { emitServiceUpdate, emitVariantUpdate } from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);

const parseArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        return JSON.parse(value);
    } catch {
        return [value];
    }
};

// ============================================
// GET ALL SERVICES (ADMIN)
// ============================================
export const getAllServicesAdmin = async (req, res) => {
    try {
        const {
            category,
            subcategory,
            tier,
            isActive,
            isFeatured,
            search,
            page = 1,
            limit = 12,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;

        const query = {};

        if (category && category !== '' && isValidObjectId(category)) {
            query.category = category;
        }

        if (subcategory && subcategory !== '' && isValidObjectId(subcategory)) {
            query.subcategory = subcategory;
        }

        if (tier && tier !== '') {
            query.tier = tier;
        }

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        if (isFeatured !== undefined && isFeatured !== '') {
            query.isFeatured = isFeatured === 'true';
        }

        if (search && search.trim() !== '') {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
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
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            data: services
        });

    } catch (error) {
        console.error('getAllServicesAdmin ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching services',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE SERVICE (ADMIN)
// ============================================
export const getServiceById = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId)
            .populate('category', 'name slug icon image')
            .populate('subcategory', 'name slug icon image')
            .populate('createdBy', 'firstName lastName');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Get booking stats
        const bookingStats = await Booking.aggregate([
            { $match: { serviceId: new mongoose.Types.ObjectId(serviceId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                service,
                bookingStats
            }
        });

    } catch (error) {
        console.error('getServiceById ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching service'
        });
    }
};

// ============================================
// CREATE SERVICE (ADMIN)
// ============================================
export const createService = async (req, res) => {
    try {
        const {
            name,
            description,
            shortDescription,
            category,
            subcategory,
            tier,
            highlights,
            includes,
            excludes,
            displayOrder,
            isFeatured,
            variants
        } = req.body;

        // Validate required fields
        if (!name || !description || !category || !subcategory) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Name, description, category and subcategory are required'
            });
        }

        // Validate category
        if (!isValidObjectId(category)) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Category not found'
            });
        }

        if (!categoryExists.isActive) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Cannot add service to inactive category'
            });
        }

        // Validate subcategory
        if (!isValidObjectId(subcategory)) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID'
            });
        }

        const subcategoryExists = await Subcategory.findById(subcategory);
        if (!subcategoryExists) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        if (!subcategoryExists.isActive) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Cannot add service to inactive subcategory'
            });
        }

        // Verify subcategory belongs to category
        if (subcategoryExists.category.toString() !== category) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Subcategory does not belong to selected category'
            });
        }

        // Parse variants
        let parsedVariants = [];
        if (variants) {
            try {
                parsedVariants = typeof variants === 'string'
                    ? JSON.parse(variants)
                    : variants;
            } catch (e) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Invalid variants format. Must be valid JSON array.'
                });
            }
        }

        if (!parsedVariants || parsedVariants.length === 0) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'At least one variant is required'
            });
        }

        // Validate and clean each variant
        for (let i = 0; i < parsedVariants.length; i++) {
            const variant = parsedVariants[i];

            if (!variant.name || variant.name.trim() === '') {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `Variant ${i + 1}: name is required`
                });
            }

            if (variant.price === undefined || variant.price === null || Number(variant.price) < 0) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `Variant "${variant.name}": valid price is required`
                });
            }

            if (!variant.duration || Number(variant.duration) < 1) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `Variant "${variant.name}": duration must be at least 1 minute`
                });
            }

            // Clean variant data
            parsedVariants[i] = {
                name: variant.name.trim(),
                description: variant.description || '',
                price: Number(variant.price),
                discountPrice: variant.discountPrice ? Number(variant.discountPrice) : null,
                duration: Number(variant.duration),
                features: parseArray(variant.features),
                isActive: variant.isActive !== false,
                displayOrder: Number(variant.displayOrder) || i
            };
        }

        // Process images
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

        // Validate tier
        const validTiers = ['basic', 'standard', 'premium', 'custom'];
        const serviceTier = validTiers.includes(tier) ? tier : 'basic';

        // Check duplicate: subcategory + tier must be unique
        const existingService = await Service.findOne({
            subcategory,
            tier: serviceTier
        });

        if (existingService) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: `A ${serviceTier} service already exists for ${subcategoryExists.name}`
            });
        }

        // Create service
        const service = await Service.create({
            name: name.trim(),
            description,
            shortDescription: shortDescription || '',
            category,
            subcategory,
            tier: serviceTier,
            images: serviceImages,
            variants: parsedVariants,
            highlights: parseArray(highlights),
            includes: parseArray(includes),
            excludes: parseArray(excludes),
            displayOrder: Number(displayOrder) || 0,
            isFeatured: isFeatured === 'true' || isFeatured === true,
            createdBy: req.user._id
        });

        // Populate category and subcategory
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        // Update category service count
        await updateCategoryCounts(category);

        // Socket event
        emitServiceUpdate(service, 'created');

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('createService ERROR:', error.message);

        if (req.files) {
            for (const file of req.files) {
                await deleteCloudinaryImage(file.filename);
            }
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this configuration already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: messages
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating service',
            error: error.message
        });
    }
};

// ============================================
// UPDATE SERVICE (ADMIN)
// ============================================
export const updateService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const {
            name,
            description,
            shortDescription,
            category,
            subcategory,
            tier,
            highlights,
            includes,
            excludes,
            displayOrder,
            isActive,
            isFeatured,
            variants,
            removeImages
        } = req.body;

        const oldCategoryId = service.category;
        const oldSubcategoryId = service.subcategory;

        // Handle category change
        if (category && category !== service.category.toString()) {
            if (!isValidObjectId(category)) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category ID'
                });
            }

            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            if (!categoryExists.isActive) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Cannot move service to inactive category'
                });
            }

            service.category = category;
        }

        // Handle subcategory change
        if (subcategory && subcategory !== service.subcategory.toString()) {
            if (!isValidObjectId(subcategory)) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subcategory ID'
                });
            }

            const subcategoryExists = await Subcategory.findById(subcategory);
            if (!subcategoryExists) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory not found'
                });
            }

            if (!subcategoryExists.isActive) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Cannot move service to inactive subcategory'
                });
            }

            // Verify subcategory belongs to the current/new category
            const targetCategory = category || service.category.toString();
            if (subcategoryExists.category.toString() !== targetCategory) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory does not belong to selected category'
                });
            }

            service.subcategory = subcategory;
        }

        // Handle tier change - check uniqueness
        const newTier = tier || service.tier;
        const newSubcategory = subcategory || service.subcategory.toString();

        if (tier && tier !== service.tier) {
            const validTiers = ['basic', 'standard', 'premium', 'custom'];
            if (!validTiers.includes(tier)) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: 'Invalid tier value'
                });
            }

            // Check if new subcategory + tier combination already exists
            const existingService = await Service.findOne({
                subcategory: newSubcategory,
                tier: tier,
                _id: { $ne: serviceId }
            });

            if (existingService) {
                if (req.files) {
                    for (const file of req.files) {
                        await deleteCloudinaryImage(file.filename);
                    }
                }
                return res.status(400).json({
                    success: false,
                    message: `A ${tier} service already exists for this subcategory`
                });
            }

            service.tier = tier;
        }

        // Handle image removal
        if (removeImages) {
            const imagesToRemove = parseArray(removeImages);
            for (const publicId of imagesToRemove) {
                await deleteCloudinaryImage(publicId);
                service.images = service.images.filter(
                    img => img.publicId !== publicId
                );
            }
        }

        // Add new images
        if (req.files && req.files.length > 0) {
            const currentCount = service.images.length;
            const availableSlots = 3 - currentCount;

            if (availableSlots <= 0) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 3 images allowed. Remove existing images first.'
                });
            }

            const filesToAdd = req.files.slice(0, availableSlots);

            // Delete extra uploaded files
            const extraFiles = req.files.slice(availableSlots);
            for (const file of extraFiles) {
                await deleteCloudinaryImage(file.filename);
            }

            filesToAdd.forEach((file, index) => {
                service.images.push({
                    url: file.path,
                    publicId: file.filename,
                    isPrimary: currentCount === 0 && index === 0
                });
            });
        }

        // Update basic fields
        if (name) service.name = name.trim();
        if (description) service.description = description;
        if (shortDescription !== undefined) service.shortDescription = shortDescription;
        if (displayOrder !== undefined) service.displayOrder = Number(displayOrder);
        if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;
        if (isFeatured !== undefined) service.isFeatured = isFeatured === 'true' || isFeatured === true;

        // Update arrays
        if (highlights !== undefined) service.highlights = parseArray(highlights);
        if (includes !== undefined) service.includes = parseArray(includes);
        if (excludes !== undefined) service.excludes = parseArray(excludes);

        // Update variants
        if (variants) {
            let parsedVariants;
            try {
                parsedVariants = typeof variants === 'string'
                    ? JSON.parse(variants)
                    : variants;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid variants format'
                });
            }

            if (parsedVariants && parsedVariants.length > 0) {
                service.variants = parsedVariants.map((v, i) => ({
                    _id: v._id || undefined,
                    name: v.name?.trim() || 'Unnamed',
                    description: v.description || '',
                    price: Number(v.price) || 0,
                    discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
                    duration: Number(v.duration) || 30,
                    features: parseArray(v.features),
                    image: v.image || { url: 'default-variant.jpg', publicId: '' },
                    isActive: v.isActive !== undefined
                        ? (v.isActive === 'true' || v.isActive === true)
                        : true,
                    displayOrder: Number(v.displayOrder) || i
                }));
            }
        }

        await service.save();
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        // Update counts for old and new categories/subcategories if changed
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

        // Socket event
        emitServiceUpdate(service, 'updated');

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('updateService ERROR:', error.message);

        if (req.files) {
            for (const file of req.files) {
                await deleteCloudinaryImage(file.filename);
            }
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this configuration already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating service',
            error: error.message
        });
    }
};

// ============================================
// DELETE SERVICE (ADMIN)
// ============================================
export const deleteService = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check for active bookings
        const activeBookings = await Booking.countDocuments({
            serviceId: serviceId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete service with ${activeBookings} active booking(s). Cancel or complete them first.`
            });
        }

        // Store data for socket emission and count updates
        const deletedServiceData = {
            _id: service._id,
            name: service.name,
            category: service.category,
            subcategory: service.subcategory
        };

        const categoryId = service.category;
        const subcategoryId = service.subcategory;

        // Delete service images
        for (const image of service.images) {
            if (image.publicId) {
                await deleteCloudinaryImage(image.publicId);
            }
        }

        // Delete variant images
        for (const variant of service.variants) {
            if (variant.image && variant.image.publicId) {
                await deleteCloudinaryImage(variant.image.publicId);
            }
        }

        await service.deleteOne();

        // Update counts
        await updateCategoryCounts(categoryId);
        await updateSubcategoryServiceCount(subcategoryId);

        // Socket event
        emitServiceUpdate(deletedServiceData, 'deleted');

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('deleteService ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting service',
            error: error.message
        });
    }
};


// ============================================
// ADD VARIANT (ADMIN)
// ============================================
export const addVariant = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const { name, description, price, duration, discountPrice, features, displayOrder } = req.body;

        if (!name || price === undefined || !duration) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Name, price and duration are required'
            });
        }

        // Check duplicate variant name in this service
        const exists = service.variants.find(
            v => v.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (exists) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: `Variant "${name}" already exists in this service`
            });
        }

        // Process image
        const variantImage = {
            url: 'default-variant.jpg',
            publicId: ''
        };

        if (req.file) {
            variantImage.url = req.file.path;
            variantImage.publicId = req.file.filename;
        }

        const newVariant = {
            name: name.trim(),
            description: description || '',
            image: variantImage,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            duration: Number(duration),
            features: parseArray(features),
            displayOrder: Number(displayOrder) || service.variants.length,
            isActive: true
        };

        service.variants.push(newVariant);
        await service.save();
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        // Get the added variant
        const addedVariant = service.variants[service.variants.length - 1];

        // Socket event
        emitVariantUpdate(serviceId, addedVariant, 'added');

        res.status(200).json({
            success: true,
            message: `Variant "${name}" added successfully`,
            data: service
        });

    } catch (error) {
        console.error('addVariant ERROR:', error.message);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error adding variant'
        });
    }
};

// ============================================
// UPDATE VARIANT (ADMIN)
// ============================================
export const updateVariant = async (req, res) => {
    try {
        const { serviceId, variantId } = req.params;

        if (!isValidObjectId(serviceId)) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const variant = service.variants.id(variantId);

        if (!variant) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Variant not found'
            });
        }

        const { name, description, price, duration, discountPrice, features, isActive, displayOrder } = req.body;

        // Handle image update
        if (req.file) {
            if (variant.image && variant.image.publicId) {
                await deleteCloudinaryImage(variant.image.publicId);
            }
            variant.image = {
                url: req.file.path,
                publicId: req.file.filename
            };
        }

        // Check duplicate name (excluding current variant)
        if (name && name.trim().toLowerCase() !== variant.name.toLowerCase()) {
            const exists = service.variants.find(
                v => v._id.toString() !== variantId &&
                    v.name.toLowerCase() === name.trim().toLowerCase()
            );

            if (exists) {
                if (req.file) await deleteCloudinaryImage(req.file.filename);
                return res.status(400).json({
                    success: false,
                    message: `Variant "${name}" already exists in this service`
                });
            }
        }

        // Update fields
        if (name) variant.name = name.trim();
        if (description !== undefined) variant.description = description;
        if (price !== undefined) variant.price = Number(price);
        if (duration !== undefined) variant.duration = Number(duration);
        if (discountPrice !== undefined) {
            variant.discountPrice = discountPrice ? Number(discountPrice) : null;
        }
        if (isActive !== undefined) variant.isActive = isActive === 'true' || isActive === true;
        if (displayOrder !== undefined) variant.displayOrder = Number(displayOrder);
        if (features !== undefined) variant.features = parseArray(features);

        await service.save();
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        // Socket event
        emitVariantUpdate(serviceId, variant, 'updated');

        res.status(200).json({
            success: true,
            message: 'Variant updated successfully',
            data: service
        });

    } catch (error) {
        console.error('updateVariant ERROR:', error.message);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error updating variant'
        });
    }
};

// ============================================
// DELETE VARIANT (ADMIN)
// ============================================
export const deleteVariant = async (req, res) => {
    try {
        const { serviceId, variantId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        if (service.variants.length <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the only variant. Service must have at least one variant.'
            });
        }

        const variant = service.variants.id(variantId);

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: 'Variant not found'
            });
        }

        // Check for active bookings with this variant
        const activeBookings = await Booking.countDocuments({
            serviceId: serviceId,
            variantId: variantId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete variant with ${activeBookings} active booking(s)`
            });
        }

        // Store variant data for socket emission
        const deletedVariantData = {
            _id: variant._id,
            name: variant.name,
            isActive: false
        };

        // Delete variant image
        if (variant.image && variant.image.publicId) {
            await deleteCloudinaryImage(variant.image.publicId);
        }

        service.variants.pull(variantId);
        await service.save();
        await service.populate('category', 'name slug icon');
        await service.populate('subcategory', 'name slug icon');

        // Socket event
        emitVariantUpdate(serviceId, deletedVariantData, 'deleted');

        res.status(200).json({
            success: true,
            message: 'Variant deleted successfully',
            data: service
        });

    } catch (error) {
        console.error('deleteVariant ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting variant'
        });
    }
};

// ============================================
// SET PRIMARY IMAGE (ADMIN)
// ============================================
export const setPrimaryImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Reset all images to non-primary
        service.images.forEach(img => {
            img.isPrimary = false;
        });

        const image = service.images.id(imageId);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        image.isPrimary = true;
        await service.save();

        res.status(200).json({
            success: true,
            message: 'Primary image updated',
            data: service
        });

    } catch (error) {
        console.error('setPrimaryImage ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error setting primary image'
        });
    }
};

// ============================================
// DELETE IMAGE (ADMIN)
// ============================================
export const deleteImage = async (req, res) => {
    try {
        const { serviceId, imageId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const image = service.images.id(imageId);
        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete from Cloudinary
        if (image.publicId) {
            await deleteCloudinaryImage(image.publicId);
        }

        // Check if this was the primary image
        const wasPrimary = image.isPrimary;

        // Remove from array
        service.images.pull(imageId);

        // If deleted image was primary and there are other images, make first one primary
        if (wasPrimary && service.images.length > 0) {
            service.images[0].isPrimary = true;
        }

        await service.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            data: service
        });

    } catch (error) {
        console.error('deleteImage ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting image'
        });
    }
};

// ============================================
// TOGGLE SERVICE FEATURED (ADMIN)
// ============================================
export const toggleFeatured = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        service.isFeatured = !service.isFeatured;
        await service.save();

        // Socket event
        emitServiceUpdate(service, 'updated');

        res.status(200).json({
            success: true,
            message: `Service ${service.isFeatured ? 'featured' : 'unfeatured'}`,
            data: service
        });

    } catch (error) {
        console.error('toggleFeatured ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error toggling featured status'
        });
    }
};

// ============================================
// TOGGLE SERVICE ACTIVE STATUS (ADMIN)
// ============================================
export const toggleActive = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // If activating, check if parent category and subcategory are active
        if (!service.isActive) {
            const parentCategory = await Category.findById(service.category);
            if (!parentCategory || !parentCategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot activate service when parent category is inactive'
                });
            }

            const parentSubcategory = await Subcategory.findById(service.subcategory);
            if (!parentSubcategory || !parentSubcategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot activate service when parent subcategory is inactive'
                });
            }
        }

        // If deactivating, check for active bookings
        if (service.isActive) {
            const activeBookings = await Booking.countDocuments({
                serviceId: serviceId,
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

        // Update counts
        await updateCategoryCounts(service.category);
        await updateSubcategoryServiceCount(service.subcategory);

        // Socket event
        emitServiceUpdate(service, 'updated');

        res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'}`,
            data: service
        });

    } catch (error) {
        console.error('toggleActive ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error toggling active status'
        });
    }
};

// ============================================
// REORDER SERVICES (ADMIN)
// ============================================
export const reorderServices = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({
                success: false,
                message: 'orderedIds array is required'
            });
        }

        const bulkOps = orderedIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { displayOrder: index }
            }
        }));

        await Service.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            message: 'Services reordered successfully'
        });

    } catch (error) {
        console.error('reorderServices ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error reordering services'
        });
    }
};

// ============================================
// HELPER: Update category counts
// ============================================
const updateCategoryCounts = async (categoryId) => {
    try {
        const subcategoryCount = await Subcategory.countDocuments({
            category: categoryId,
            isActive: true
        });

        const serviceCount = await Service.countDocuments({
            category: categoryId,
            isActive: true
        });

        await Category.findByIdAndUpdate(categoryId, {
            totalSubcategories: subcategoryCount,
            totalServices: serviceCount
        });
    } catch (err) {
        console.error('Error updating category counts:', err);
    }
};

// ============================================
// HELPER: Update subcategory service count
// ============================================
const updateSubcategoryServiceCount = async (subcategoryId) => {
    try {
        const count = await Service.countDocuments({
            subcategory: subcategoryId,
            isActive: true
        });

        await Subcategory.findByIdAndUpdate(subcategoryId, {
            totalServices: count
        });
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
    addVariant,
    updateVariant,
    deleteVariant,
    setPrimaryImage,
    deleteImage,
    toggleFeatured,
    toggleActive,
    reorderServices
};