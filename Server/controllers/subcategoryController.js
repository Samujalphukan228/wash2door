// controllers/subcategoryController.js

import Subcategory from '../models/Subcategory.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import { deleteCloudinaryImage } from '../config/cloudinary.js';
import { emitSubcategoryUpdate } from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL SUBCATEGORIES (ADMIN)
// ============================================
export const getAllSubcategories = async (req, res) => {
    try {
        const {
            category,
            isActive,
            page = 1,
            limit = 50,
            search,
            sortBy = 'displayOrder',
            sortOrder = 'asc'
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;

        const query = {};

        if (category && isValidObjectId(category)) {
            query.category = category;
        }

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const total = await Subcategory.countDocuments(query);

        const subcategories = await Subcategory.find(query)
            .populate('category', 'name slug icon')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        // Add service count
        const subcategoriesWithCount = await Promise.all(
            subcategories.map(async (sub) => {
                const serviceCount = await Service.countDocuments({
                    subcategory: sub._id,
                    isActive: true
                });
                return {
                    ...sub,
                    activeServices: serviceCount
                };
            })
        );

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            data: subcategoriesWithCount
        });

    } catch (error) {
        console.error('getAllSubcategories ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories',
            error: error.message
        });
    }
};

// ============================================
// GET SUBCATEGORIES BY CATEGORY (for dropdowns)
// ============================================
export const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { includeInactive } = req.query;

        console.log('📦 getSubcategoriesByCategory:', {
            categoryId,
            includeInactive,
            query: req.query
        });

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        // Build query
        const query = { category: categoryId };

        // Only filter by active if includeInactive is NOT true
        if (includeInactive !== 'true') {
            query.isActive = true;
        }

        console.log('📦 Query:', query);

        const subcategories = await Subcategory.find(query)
            .select('name slug icon image totalServices isActive displayOrder')
            .sort({ displayOrder: 1 })
            .lean();

        console.log('✅ Found subcategories:', {
            total: subcategories.length,
            items: subcategories.map(s => ({
                id: s._id,
                name: s.name,
                isActive: s.isActive
            }))
        });

        res.status(200).json({
            success: true,
            total: subcategories.length,
            data: subcategories
        });

    } catch (error) {
        console.error('getSubcategoriesByCategory ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategories',
            error: error.message
        });
    }
};
// ============================================
// GET SINGLE SUBCATEGORY
// ============================================
export const getSubcategoryById = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        if (!isValidObjectId(subcategoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID'
            });
        }

        const subcategory = await Subcategory.findById(subcategoryId)
            .populate('category', 'name slug icon image')
            .populate('createdBy', 'firstName lastName');

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Get services in this subcategory
        const services = await Service.find({ subcategory: subcategoryId })
            .select('name isActive tier startingPrice averageRating totalBookings')
            .sort({ displayOrder: 1 });

        const stats = {
            totalServices: services.length,
            activeServices: services.filter(s => s.isActive).length,
            totalBookings: services.reduce((sum, s) => sum + (s.totalBookings || 0), 0)
        };

        res.status(200).json({
            success: true,
            data: {
                subcategory,
                services,
                stats
            }
        });

    } catch (error) {
        console.error('getSubcategoryById ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching subcategory'
        });
    }
};

// ============================================
// CREATE SUBCATEGORY
// ============================================
export const createSubcategory = async (req, res) => {
    try {
        const { name, category, description, icon, displayOrder } = req.body;

        if (!name || !category) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Name and category are required'
            });
        }

        // Validate category
        if (!isValidObjectId(category)) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Category not found'
            });
        }

        if (!categoryExists.isActive) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Cannot add subcategory to inactive category'
            });
        }

        // Check duplicate in same category
        const existing = await Subcategory.findOne({
            category,
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existing) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Subcategory with this name already exists in this category'
            });
        }

        // Process image
        const subcategoryImage = {
            url: 'default-subcategory.jpg',
            publicId: ''
        };

        if (req.file) {
            subcategoryImage.url = req.file.path;
            subcategoryImage.publicId = req.file.filename;
        }

        // Get next display order
        let order = Number(displayOrder);
        if (!order && order !== 0) {
            const lastSubcategory = await Subcategory.findOne({ category })
                .sort({ displayOrder: -1 });
            order = lastSubcategory ? lastSubcategory.displayOrder + 1 : 0;
        }

        const subcategory = await Subcategory.create({
            name: name.trim(),
            category,
            description: description || '',
            icon: icon || '',
            image: subcategoryImage,
            displayOrder: order,
            createdBy: req.user._id
        });

        // Update category subcategory count
        await updateCategorySubcategoryCount(category);

        await subcategory.populate('category', 'name slug icon');

        // Socket event
        emitSubcategoryUpdate(subcategory, 'created');

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            data: subcategory
        });

    } catch (error) {
        console.error('createSubcategory ERROR:', error.message);

        if (req.file) await deleteCloudinaryImage(req.file.filename);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory with this name already exists in this category'
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
            message: 'Error creating subcategory',
            error: error.message
        });
    }
};

// ============================================
// UPDATE SUBCATEGORY
// ============================================
export const updateSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        if (!isValidObjectId(subcategoryId)) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID'
            });
        }

        const subcategory = await Subcategory.findById(subcategoryId);

        if (!subcategory) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        const { name, description, icon, displayOrder, isActive } = req.body;

        // Check duplicate name in same category
        if (name && name.trim().toLowerCase() !== subcategory.name.toLowerCase()) {
            const existing = await Subcategory.findOne({
                category: subcategory.category,
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: subcategoryId }
            });

            if (existing) {
                if (req.file) await deleteCloudinaryImage(req.file.filename);
                return res.status(400).json({
                    success: false,
                    message: 'Subcategory with this name already exists in this category'
                });
            }
        }

        // Handle image update
        if (req.file) {
            if (subcategory.image.publicId) {
                await deleteCloudinaryImage(subcategory.image.publicId);
            }
            subcategory.image = {
                url: req.file.path,
                publicId: req.file.filename
            };
        }

        // Update fields
        if (name) subcategory.name = name.trim();
        if (description !== undefined) subcategory.description = description;
        if (icon !== undefined) subcategory.icon = icon;
        if (displayOrder !== undefined) subcategory.displayOrder = Number(displayOrder);
        if (isActive !== undefined) subcategory.isActive = isActive === 'true' || isActive === true;

        await subcategory.save();

        // If subcategory deactivated, deactivate services
        if (isActive !== undefined && !subcategory.isActive) {
            const result = await Service.updateMany(
                { subcategory: subcategoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${result.modifiedCount} services in subcategory`);
        }

        // Update category count
        await updateCategorySubcategoryCount(subcategory.category);

        await subcategory.populate('category', 'name slug icon');

        // Socket event
        emitSubcategoryUpdate(subcategory, 'updated');

        res.status(200).json({
            success: true,
            message: 'Subcategory updated successfully',
            data: subcategory
        });

    } catch (error) {
        console.error('updateSubcategory ERROR:', error.message);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error updating subcategory',
            error: error.message
        });
    }
};

// ============================================
// DELETE SUBCATEGORY
// ============================================
export const deleteSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        if (!isValidObjectId(subcategoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID'
            });
        }

        const subcategory = await Subcategory.findById(subcategoryId);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if has services
        const serviceCount = await Service.countDocuments({ subcategory: subcategoryId });

        if (serviceCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subcategory with ${serviceCount} service(s). Delete services first.`
            });
        }

        const categoryId = subcategory.category;
        const deletedSubcategoryData = {
            _id: subcategory._id,
            name: subcategory.name,
            category: subcategory.category,
            isActive: false
        };

        // Delete image
        if (subcategory.image.publicId) {
            await deleteCloudinaryImage(subcategory.image.publicId);
        }

        await subcategory.deleteOne();

        // Update category count
        await updateCategorySubcategoryCount(categoryId);

        // Socket event
        emitSubcategoryUpdate(deletedSubcategoryData, 'deleted');

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully'
        });

    } catch (error) {
        console.error('deleteSubcategory ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting subcategory',
            error: error.message
        });
    }
};

// ============================================
// TOGGLE SUBCATEGORY STATUS
// ============================================
export const toggleSubcategoryStatus = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        if (!isValidObjectId(subcategoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subcategory ID'
            });
        }

        const subcategory = await Subcategory.findById(subcategoryId);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if parent category is active before activating subcategory
        if (!subcategory.isActive) {
            const parentCategory = await Category.findById(subcategory.category);
            if (!parentCategory || !parentCategory.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot activate subcategory when parent category is inactive'
                });
            }
        }

        subcategory.isActive = !subcategory.isActive;
        await subcategory.save();

        // Deactivate services if subcategory deactivated
        if (!subcategory.isActive) {
            const result = await Service.updateMany(
                { subcategory: subcategoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${result.modifiedCount} services in subcategory`);
        }

        // Update category count
        await updateCategorySubcategoryCount(subcategory.category);

        // Socket event
        emitSubcategoryUpdate(subcategory, 'updated');

        res.status(200).json({
            success: true,
            message: `Subcategory ${subcategory.isActive ? 'activated' : 'deactivated'}`,
            data: subcategory
        });

    } catch (error) {
        console.error('toggleSubcategoryStatus ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error toggling subcategory status'
        });
    }
};

// ============================================
// REORDER SUBCATEGORIES
// ============================================
export const reorderSubcategories = async (req, res) => {
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

        await Subcategory.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            message: 'Subcategories reordered successfully'
        });

    } catch (error) {
        console.error('reorderSubcategories ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error reordering subcategories'
        });
    }
};

// ============================================
// HELPER: Update category subcategory count
// ============================================
const updateCategorySubcategoryCount = async (categoryId) => {
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

export default {
    getAllSubcategories,
    getSubcategoriesByCategory,
    getSubcategoryById,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    toggleSubcategoryStatus,
    reorderSubcategories
};