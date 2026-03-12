// controllers/serviceController.js

import Service from '../models/Service.js';
import Category from '../models/Category.js';
import mongoose from 'mongoose';

let Booking;
try {
    Booking = (await import('../models/Booking.js')).default;
} catch (e) {
    console.log('⚠️ Booking model not found, skipping booking checks');
    Booking = null;
}

let deleteCloudinaryImage;
try {
    const cloudinaryModule = await import('../config/cloudinary.js');
    deleteCloudinaryImage = cloudinaryModule.deleteCloudinaryImage;
} catch (e) {
    console.log('⚠️ Cloudinary config not found');
    deleteCloudinaryImage = async () => {};
}

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
    console.log('🔥 getAllServicesAdmin CALLED');

    try {
        const {
            category,
            tier,
            isActive,
            isFeatured,
            search,
            page = 1,
            limit = 12
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;

        const query = {};

        if (category && category !== '' && isValidObjectId(category)) {
            query.category = category;
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

        console.log('📦 MongoDB query:', query);

        const total = await Service.countDocuments(query);

        const services = await Service.find(query)
            .populate('category', 'name slug icon image')
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        console.log('📦 Services found:', services.length);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            data: services
        });

    } catch (error) {
        console.error('❌ getAllServicesAdmin ERROR:', error.message);
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
    console.log('🔥 getServiceById CALLED:', req.params.serviceId);

    try {
        const { serviceId } = req.params;

        if (!isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service ID'
            });
        }

        const service = await Service.findById(serviceId)
            .populate('category', 'name slug icon image');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });

    } catch (error) {
        console.error('❌ getServiceById ERROR:', error.message);
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
    console.log('🔥 createService CALLED');
    console.log('📦 Body:', req.body);
    console.log('📦 Files:', req.files?.length || 0);

    try {
        const {
            name,
            description,
            shortDescription,
            category,
            tier,
            highlights,
            includes,
            excludes,
            displayOrder,
            isFeatured,
            variants
        } = req.body;

        // Validate required fields
        if (!name || !description || !category) {
            if (req.files) {
                for (const file of req.files) {
                    await deleteCloudinaryImage(file.filename);
                }
            }
            return res.status(400).json({
                success: false,
                message: 'Name, description and category are required'
            });
        }

        // Validate category exists
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

            if (!variant.price || Number(variant.price) < 0) {
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
            variant.name = variant.name.trim();
            variant.price = Number(variant.price);
            variant.duration = Number(variant.duration);
            variant.discountPrice = variant.discountPrice
                ? Number(variant.discountPrice)
                : null;
            variant.features = parseArray(variant.features);
            variant.description = variant.description || '';
            variant.displayOrder = Number(variant.displayOrder) || i;
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

        // Create service
        const service = await Service.create({
            name: name.trim(),
            description,
            shortDescription: shortDescription || '',
            category,
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

        // Populate category before sending response
        await service.populate('category', 'name slug icon');

        console.log('✅ Service created:', service._id);

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ createService ERROR:', error.message);

        if (req.files) {
            for (const file of req.files) {
                await deleteCloudinaryImage(file.filename);
            }
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this name already exists in this category'
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
    console.log('🔥 updateService CALLED:', req.params.serviceId);

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

        // Validate category if being changed
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

            service.category = category;
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

        // Update tier
        const validTiers = ['basic', 'standard', 'premium', 'custom'];
        if (tier && validTiers.includes(tier)) {
            service.tier = tier;
        }

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
                    ...v,
                    _id: v._id || undefined, // preserve existing IDs
                    name: v.name?.trim() || 'Unnamed',
                    price: Number(v.price) || 0,
                    duration: Number(v.duration) || 30,
                    discountPrice: v.discountPrice ? Number(v.discountPrice) : null,
                    features: parseArray(v.features),
                    description: v.description || '',
                    isActive: v.isActive !== undefined
                        ? (v.isActive === 'true' || v.isActive === true)
                        : true,
                    displayOrder: Number(v.displayOrder) || i
                }));
            }
        }

        await service.save();
        await service.populate('category', 'name slug icon');

        console.log('✅ Service updated:', service._id);

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ updateService ERROR:', error.message);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this name already exists in this category'
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
    console.log('🔥 deleteService CALLED:', req.params.serviceId);

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
        if (Booking) {
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
        }

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

        const categoryId = service.category;
        await service.deleteOne();

        // Update category count
        try {
            const count = await Service.countDocuments({
                category: categoryId,
                isActive: true
            });
            await Category.findByIdAndUpdate(categoryId, { totalServices: count });
        } catch (err) {
            console.error('Error updating category count:', err);
        }

        console.log('✅ Service deleted:', serviceId);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('❌ deleteService ERROR:', error.message);
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
    console.log('🔥 addVariant CALLED');

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
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        const { name, description, price, duration, discountPrice, features, displayOrder } = req.body;

        if (!name || !price || !duration) {
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

        service.variants.push({
            name: name.trim(),
            description: description || '',
            image: variantImage,
            price: Number(price),
            discountPrice: discountPrice ? Number(discountPrice) : null,
            duration: Number(duration),
            features: parseArray(features),
            displayOrder: Number(displayOrder) || service.variants.length,
            isActive: true
        });

        await service.save();
        await service.populate('category', 'name slug icon');

        console.log('✅ Variant added:', name);

        res.status(200).json({
            success: true,
            message: `Variant "${name}" added successfully`,
            data: service
        });

    } catch (error) {
        console.error('❌ addVariant ERROR:', error.message);
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
    console.log('🔥 updateVariant CALLED');

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
        if (price) variant.price = Number(price);
        if (duration) variant.duration = Number(duration);
        if (discountPrice !== undefined) {
            variant.discountPrice = discountPrice ? Number(discountPrice) : null;
        }
        if (isActive !== undefined) variant.isActive = isActive === 'true' || isActive === true;
        if (displayOrder !== undefined) variant.displayOrder = Number(displayOrder);
        if (features !== undefined) variant.features = parseArray(features);

        await service.save();
        await service.populate('category', 'name slug icon');

        console.log('✅ Variant updated');

        res.status(200).json({
            success: true,
            message: 'Variant updated successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ updateVariant ERROR:', error.message);
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
    console.log('🔥 deleteVariant CALLED');

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
        if (Booking) {
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
        }

        // Delete variant image
        if (variant.image && variant.image.publicId) {
            await deleteCloudinaryImage(variant.image.publicId);
        }

        service.variants.pull(variantId);
        await service.save();
        await service.populate('category', 'name slug icon');

        console.log('✅ Variant deleted');

        res.status(200).json({
            success: true,
            message: 'Variant deleted successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ deleteVariant ERROR:', error.message);
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
    console.log('🔥 setPrimaryImage CALLED');

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

        // Reset all
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

        console.log('✅ Primary image set');

        res.status(200).json({
            success: true,
            message: 'Primary image updated',
            data: service
        });

    } catch (error) {
        console.error('❌ setPrimaryImage ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error setting primary image'
        });
    }
};

// ============================================
// TOGGLE SERVICE FEATURED (ADMIN)
// ============================================
export const toggleFeatured = async (req, res) => {
    console.log('🔥 toggleFeatured CALLED:', req.params.serviceId);

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

        console.log('✅ Featured toggled:', service.isFeatured);

        res.status(200).json({
            success: true,
            message: `Service ${service.isFeatured ? 'featured' : 'unfeatured'}`,
            data: service
        });

    } catch (error) {
        console.error('❌ toggleFeatured ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error toggling featured status'
        });
    }
};