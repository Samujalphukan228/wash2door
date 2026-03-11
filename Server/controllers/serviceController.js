import Service from '../models/Service.js';
import mongoose from 'mongoose';

// Check if Booking model exists, if not create a dummy
let Booking;
try {
    Booking = (await import('../models/Booking.js')).default;
} catch (e) {
    console.log('⚠️ Booking model not found, skipping booking checks');
    Booking = null;
}

// Import cloudinary delete function safely
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
    console.log('📦 Query params:', req.query);

    try {
        const {
            category,
            isActive,
            page = 1,
            limit = 12
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 12;

        // Build query
        const query = {};

        if (category && category !== '') {
            query.category = category;
        }

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        console.log('📦 MongoDB query:', query);

        // Get total count
        const total = await Service.countDocuments(query);
        console.log('📦 Total services:', total);

        // Get services
        const services = await Service.find(query)
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
        console.error('Stack:', error.stack);

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

        // Parse vehicleTypes
        let parsedVehicleTypes = [];
        if (vehicleTypes) {
            try {
                parsedVehicleTypes = typeof vehicleTypes === 'string'
                    ? JSON.parse(vehicleTypes)
                    : vehicleTypes;
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid vehicle types format'
                });
            }
        }

        if (!parsedVehicleTypes || parsedVehicleTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one vehicle type is required'
            });
        }

        // Validate vehicle types
        const validVehicleTypes = ['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'];

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
            // Set defaults
            vehicle.label = vehicle.label || vehicle.type;
            vehicle.price = Number(vehicle.price);
            vehicle.duration = Number(vehicle.duration);
            vehicle.features = parseArray(vehicle.features);
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
            displayOrder: Number(displayOrder) || 0,
            createdBy: req.user._id
        });

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
                    message: 'Maximum 3 images allowed'
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

        // Update fields
        if (name) service.name = name;
        if (description) service.description = description;
        if (shortDescription !== undefined) service.shortDescription = shortDescription;
        if (category) service.category = category;
        if (displayOrder !== undefined) service.displayOrder = Number(displayOrder);
        if (isActive !== undefined) service.isActive = isActive === 'true' || isActive === true;

        if (highlights !== undefined) service.highlights = parseArray(highlights);
        if (includes !== undefined) service.includes = parseArray(includes);
        if (excludes !== undefined) service.excludes = parseArray(excludes);

        if (vehicleTypes) {
            const parsedVehicleTypes = parseArray(vehicleTypes);
            if (parsedVehicleTypes && parsedVehicleTypes.length > 0) {
                service.vehicleTypes = parsedVehicleTypes.map(v => ({
                    ...v,
                    label: v.label || v.type,
                    price: Number(v.price),
                    duration: Number(v.duration),
                    features: parseArray(v.features)
                }));
            }
        }

        await service.save();

        console.log('✅ Service updated:', service._id);

        res.status(200).json({
            success: true,
            message: 'Service updated successfully',
            data: service
        });

    } catch (error) {
        console.error('❌ updateService ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error updating service'
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

        // Check for active bookings (if Booking model exists)
        if (Booking) {
            const activeBookings = await Booking.countDocuments({
                service: serviceId,
                status: { $in: ['pending', 'confirmed', 'in-progress'] }
            });

            if (activeBookings > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete service with ${activeBookings} active booking(s)`
                });
            }
        }

        // Delete images
        for (const image of service.images) {
            if (image.publicId) {
                await deleteCloudinaryImage(image.publicId);
            }
        }

        for (const vehicle of service.vehicleTypes) {
            if (vehicle.imagePublicId) {
                await deleteCloudinaryImage(vehicle.imagePublicId);
            }
        }

        await service.deleteOne();

        console.log('✅ Service deleted:', serviceId);

        res.status(200).json({
            success: true,
            message: 'Service deleted successfully'
        });

    } catch (error) {
        console.error('❌ deleteService ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting service'
        });
    }
};

// ============================================
// ADD VEHICLE TYPE (ADMIN)
// ============================================
export const addVehicleType = async (req, res) => {
    console.log('🔥 addVehicleType CALLED');

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

        const { type, label, description, price, duration, features, displayOrder } = req.body;

        if (!type || !price || !duration) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Type, price and duration are required'
            });
        }

        const exists = service.vehicleTypes.find(v => v.type === type);
        if (exists) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: `Vehicle type "${type}" already exists`
            });
        }

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
            displayOrder: Number(displayOrder) || 0,
            isActive: true
        });

        await service.save();

        console.log('✅ Vehicle type added:', type);

        res.status(200).json({
            success: true,
            message: `Vehicle type "${type}" added`,
            data: service
        });

    } catch (error) {
        console.error('❌ addVehicleType ERROR:', error.message);
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
    console.log('🔥 updateVehicleType CALLED');

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

        const { label, description, price, duration, features, isActive, displayOrder } = req.body;

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
        if (isActive !== undefined) vehicleType.isActive = isActive === 'true' || isActive === true;
        if (displayOrder !== undefined) vehicleType.displayOrder = Number(displayOrder);
        if (features !== undefined) vehicleType.features = parseArray(features);

        await service.save();

        console.log('✅ Vehicle type updated');

        res.status(200).json({
            success: true,
            message: 'Vehicle type updated',
            data: service
        });

    } catch (error) {
        console.error('❌ updateVehicleType ERROR:', error.message);
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
    console.log('🔥 deleteVehicleType CALLED');

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
                message: 'Cannot delete the only vehicle type'
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

        console.log('✅ Vehicle type deleted');

        res.status(200).json({
            success: true,
            message: 'Vehicle type deleted',
            data: service
        });

    } catch (error) {
        console.error('❌ deleteVehicleType ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting vehicle type'
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