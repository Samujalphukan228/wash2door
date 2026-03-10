import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';
import { deleteCloudinaryImage } from '../config/cloudinary.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

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
            highlights,
            includes,
            excludes,
            displayOrder,
            vehicleTypes
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

        // Validate category
        const validCategories = ['basic', 'standard', 'premium'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be: ${validCategories.join(', ')}`
            });
        }

        // Parse vehicleTypes from JSON string
        let parsedVehicleTypes = [];
        if (vehicleTypes) {
            try {
                parsedVehicleTypes = typeof vehicleTypes === 'string'
                    ? JSON.parse(vehicleTypes)
                    : vehicleTypes;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vehicle types format. Must be valid JSON.'
                });
            }
        }

        // Validate vehicle types
        if (!parsedVehicleTypes || parsedVehicleTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one vehicle type is required'
            });
        }

        // Validate each vehicle type
        const validVehicleTypes = [
            'sedan', 'suv', 'hatchback',
            'truck', 'van', 'bike', 'other'
        ];

        for (const vehicle of parsedVehicleTypes) {
            if (!vehicle.type || !validVehicleTypes.includes(vehicle.type)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid vehicle type: ${vehicle.type}`
                });
            }
            if (!vehicle.price || vehicle.price < 0) {
                return res.status(400).json({
                    success: false,
                    message: `Price is required for vehicle type: ${vehicle.type}`
                });
            }
            if (!vehicle.duration || vehicle.duration < 1) {
                return res.status(400).json({
                    success: false,
                    message: `Duration is required for vehicle type: ${vehicle.type}`
                });
            }
        }

        // Process uploaded service images (max 3)
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

        // Parse arrays helper
        const parseArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            try { return JSON.parse(value); } catch { return [value]; }
        };

        // Create service
        const service = await Service.create({
            name,
            description,
            shortDescription: shortDescription || '',
            category,
            images: serviceImages,
            vehicleTypes: parsedVehicleTypes,
            highlights: parseArray(highlights),
            includes: parseArray(includes),
            excludes: parseArray(excludes),
            displayOrder: displayOrder || 0,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            data: service
        });

    } catch (error) {
        console.error('Create service error:', error);

        // Cleanup uploaded images on error
        if (req.files) {
            for (const file of req.files) {
                await deleteCloudinaryImage(file.filename);
            }
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A service with this name already exists'
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
            message: 'Error creating service'
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

        const {
            name,
            description,
            shortDescription,
            category,
            highlights,
            includes,
            excludes,
            displayOrder,
            isActive,
            vehicleTypes,
            removeImages
        } = req.body;

        // Parse arrays helper
        const parseArray = (value) => {
            if (!value) return undefined;
            if (Array.isArray(value)) return value;
            try { return JSON.parse(value); } catch { return [value]; }
        };

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

        // Add new uploaded images
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
            filesToAdd.forEach((file, index) => {
                service.images.push({
                    url: file.path,
                    publicId: file.filename,
                    isPrimary: currentCount === 0 && index === 0
                });
            });
        }

        // Update basic fields
        if (name) service.name = name;
        if (description) service.description = description;
        if (shortDescription !== undefined) {
            service.shortDescription = shortDescription;
        }
        if (category) service.category = category;
        if (displayOrder !== undefined) service.displayOrder = displayOrder;
        if (isActive !== undefined) service.isActive = isActive;

        const parsedHighlights = parseArray(highlights);
        const parsedIncludes = parseArray(includes);
        const parsedExcludes = parseArray(excludes);

        if (parsedHighlights) service.highlights = parsedHighlights;
        if (parsedIncludes) service.includes = parsedIncludes;
        if (parsedExcludes) service.excludes = parsedExcludes;

        if (vehicleTypes) {
            const parsedVehicleTypes = parseArray(vehicleTypes);
            if (parsedVehicleTypes && parsedVehicleTypes.length > 0) {
                service.vehicleTypes = parsedVehicleTypes;
            }
        }

        await service.save();

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating service'
        });
    }
};

// ============================================
// ADD VEHICLE TYPE TO SERVICE (ADMIN)
// ============================================

export const addVehicleType = async (req, res) => {
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

        const {
            type,
            label,
            description,
            price,
            duration,
            features,
            displayOrder
        } = req.body;

        if (!type || !price || !duration) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Vehicle type, price and duration are required'
            });
        }

        const exists = service.vehicleTypes.find(v => v.type === type);
        if (exists) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: `Vehicle type "${type}" already exists in this service`
            });
        }

        const parseArray = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            try { return JSON.parse(value); } catch { return [value]; }
        };

        let vehicleImage = 'default-vehicle.jpg';
        let vehicleImagePublicId = '';
        if (req.file) {
            vehicleImage = req.file.path;
            vehicleImagePublicId = req.file.filename;
        }

        service.vehicleTypes.push({
            type,
            label: label || type,
            description: description || '',
            image: vehicleImage,
            imagePublicId: vehicleImagePublicId,
            price: Number(price),
            duration: Number(duration),
            features: parseArray(features),
            displayOrder: displayOrder || 0
        });

        await service.save();

        res.status(200).json({
            success: true,
            message: `Vehicle type "${type}" added successfully`,
            data: service
        });

    } catch (error) {
        console.error('Add vehicle type error:', error);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error adding vehicle type'
        });
    }
};

// ============================================
// UPDATE VEHICLE TYPE (ADMIN)
// ============================================

export const updateVehicleType = async (req, res) => {
    try {
        const { serviceId, vehicleTypeId } = req.params;

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

        const vehicleType = service.vehicleTypes.id(vehicleTypeId);

        if (!vehicleType) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle type not found'
            });
        }

        const {
            label,
            description,
            price,
            duration,
            features,
            isActive,
            displayOrder
        } = req.body;

        const parseArray = (value) => {
            if (!value) return undefined;
            if (Array.isArray(value)) return value;
            try { return JSON.parse(value); } catch { return [value]; }
        };

        if (req.file) {
            if (vehicleType.imagePublicId) {
                await deleteCloudinaryImage(vehicleType.imagePublicId);
            }
            vehicleType.image = req.file.path;
            vehicleType.imagePublicId = req.file.filename;
        }

        if (label) vehicleType.label = label;
        if (description !== undefined) vehicleType.description = description;
        if (price) vehicleType.price = Number(price);
        if (duration) vehicleType.duration = Number(duration);
        if (isActive !== undefined) vehicleType.isActive = isActive;
        if (displayOrder !== undefined) {
            vehicleType.displayOrder = Number(displayOrder);
        }

        const parsedFeatures = parseArray(features);
        if (parsedFeatures) vehicleType.features = parsedFeatures;

        await service.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle type updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Update vehicle type error:', error);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error updating vehicle type'
        });
    }
};

// ============================================
// DELETE VEHICLE TYPE (ADMIN)
// ============================================

export const deleteVehicleType = async (req, res) => {
    try {
        const { serviceId, vehicleTypeId } = req.params;

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

        if (service.vehicleTypes.length <= 1) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete the only vehicle type. Service must have at least one.'
            });
        }

        const vehicleType = service.vehicleTypes.id(vehicleTypeId);

        if (!vehicleType) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle type not found'
            });
        }

        if (vehicleType.imagePublicId) {
            await deleteCloudinaryImage(vehicleType.imagePublicId);
        }

        service.vehicleTypes.pull(vehicleTypeId);
        await service.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle type deleted successfully',
            data: service
        });

    } catch (error) {
        console.error('Delete vehicle type error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle type'
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

        // ✅ ADDED: Check for active bookings before deleting
        const activeBookings = await Booking.countDocuments({
            serviceId,
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        });

        if (activeBookings > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete service with ${activeBookings} active booking(s). Cancel them first.`
            });
        }

        // Delete all service images from cloudinary
        for (const image of service.images) {
            if (image.publicId) {
                await deleteCloudinaryImage(image.publicId);
            }
        }

        // Delete all vehicle type images from cloudinary
        for (const vehicle of service.vehicleTypes) {
            if (vehicle.imagePublicId) {
                await deleteCloudinaryImage(vehicle.imagePublicId);
            }
        }

        await service.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Service and all images deleted successfully'
        });

    } catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting service'
        });
    }
};

// ============================================
// GET ALL SERVICES (ADMIN)
// ============================================

export const getAllServicesAdmin = async (req, res) => {
    try {
        const {
            category,
            isActive,
            page = 1,
            limit = 10
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const total = await Service.countDocuments(query);

        const services = await Service.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: services
        });

    } catch (error) {
        console.error('Get all services error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching services'
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

        const service = await Service.findById(serviceId);

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
        console.error('Get service error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service'
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

        service.images.forEach(img => { img.isPrimary = false; });

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
        console.error('Set primary image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating primary image'
        });
    }
};