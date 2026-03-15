// controllers/categoryController.js - UPDATED WITH SUBCATEGORY CASCADE

import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';
import { deleteCloudinaryImage } from '../config/cloudinary.js';
import { emitCategoryUpdate } from '../utils/socketEmitter.js';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL CATEGORIES (ADMIN)
// ============================================
export const getAllCategories = async (req, res) => {
    try {
        const {
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

        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const total = await Category.countDocuments(query);

        const categories = await Category.find(query)
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        // Add subcategory and service counts
        const categoriesWithCounts = await Promise.all(
            categories.map(async (cat) => {
                const subcategoryCount = await Subcategory.countDocuments({
                    category: cat._id,
                    isActive: true
                });
                const serviceCount = await Service.countDocuments({
                    category: cat._id,
                    isActive: true
                });
                return {
                    ...cat,
                    activeSubcategories: subcategoryCount,
                    activeServices: serviceCount
                };
            })
        );

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            data: categoriesWithCounts
        });

    } catch (error) {
        console.error('getAllCategories ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE CATEGORY
// ============================================
export const getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const category = await Category.findById(categoryId)
            .populate('createdBy', 'firstName lastName');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get subcategories in this category
        const subcategories = await Subcategory.find({ category: categoryId })
            .select('name slug icon image isActive totalServices displayOrder')
            .sort({ displayOrder: 1 });

        // Get services in this category
        const services = await Service.find({ category: categoryId })
            .select('name isActive tier startingPrice averageRating totalBookings subcategory')
            .populate('subcategory', 'name')
            .sort({ displayOrder: 1 });

        const stats = {
            totalSubcategories: subcategories.length,
            activeSubcategories: subcategories.filter(s => s.isActive).length,
            totalServices: services.length,
            activeServices: services.filter(s => s.isActive).length,
            totalBookings: services.reduce((sum, s) => sum + (s.totalBookings || 0), 0)
        };

        res.status(200).json({
            success: true,
            data: {
                category,
                subcategories,
                services,
                stats
            }
        });

    } catch (error) {
        console.error('getCategoryById ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error fetching category'
        });
    }
};

// ============================================
// CREATE CATEGORY
// ============================================
export const createCategory = async (req, res) => {
    try {
        const { name, description, icon, displayOrder } = req.body;

        if (!name) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check duplicate
        const existing = await Category.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existing) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Process image
        const categoryImage = {
            url: 'default-category.jpg',
            publicId: ''
        };

        if (req.file) {
            categoryImage.url = req.file.path;
            categoryImage.publicId = req.file.filename;
        }

        // Get next display order if not provided
        let order = Number(displayOrder);
        if (!order && order !== 0) {
            const lastCategory = await Category.findOne().sort({ displayOrder: -1 });
            order = lastCategory ? lastCategory.displayOrder + 1 : 0;
        }

        const category = await Category.create({
            name: name.trim(),
            description: description || '',
            icon: icon || '',
            image: categoryImage,
            displayOrder: order,
            totalSubcategories: 0,
            totalServices: 0,
            createdBy: req.user._id
        });

        // Socket event
        emitCategoryUpdate(category, 'created');

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });

    } catch (error) {
        console.error('createCategory ERROR:', error.message);

        if (req.file) await deleteCloudinaryImage(req.file.filename);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
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
            message: 'Error creating category',
            error: error.message
        });
    }
};

// ============================================
// UPDATE CATEGORY
// ============================================
export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const { name, description, icon, displayOrder, isActive } = req.body;

        // Check duplicate name (excluding current)
        if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
            const existing = await Category.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
                _id: { $ne: categoryId }
            });

            if (existing) {
                if (req.file) await deleteCloudinaryImage(req.file.filename);
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Handle image update
        if (req.file) {
            if (category.image.publicId) {
                await deleteCloudinaryImage(category.image.publicId);
            }
            category.image = {
                url: req.file.path,
                publicId: req.file.filename
            };
        }

        // Update fields
        if (name) category.name = name.trim();
        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
        if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;

        await category.save();

        // CASCADE: If category deactivated, deactivate subcategories and services
        if (isActive !== undefined && !category.isActive) {
            const subcategoryResult = await Subcategory.updateMany(
                { category: categoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${subcategoryResult.modifiedCount} subcategories`);

            const serviceResult = await Service.updateMany(
                { category: categoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${serviceResult.modifiedCount} services`);
        }

        // Socket event
        emitCategoryUpdate(category, 'updated');

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });

    } catch (error) {
        console.error('updateCategory ERROR:', error.message);
        if (req.file) await deleteCloudinaryImage(req.file.filename);
        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// ============================================
// DELETE CATEGORY
// ============================================
export const deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category has subcategories
        const subcategoryCount = await Subcategory.countDocuments({ category: categoryId });

        if (subcategoryCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${subcategoryCount} subcategory(ies). Delete subcategories first.`
            });
        }

        // Check if category has services (direct check for safety)
        const serviceCount = await Service.countDocuments({ category: categoryId });

        if (serviceCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${serviceCount} service(s). Delete services first.`
            });
        }

        // Store data for socket emission
        const deletedCategoryData = {
            _id: category._id,
            name: category.name,
            isActive: false
        };

        // Delete category image
        if (category.image.publicId) {
            await deleteCloudinaryImage(category.image.publicId);
        }

        await category.deleteOne();

        // Socket event
        emitCategoryUpdate(deletedCategoryData, 'deleted');

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('deleteCategory ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

// ============================================
// TOGGLE CATEGORY STATUS
// ============================================
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category ID'
            });
        }

        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        category.isActive = !category.isActive;
        await category.save();

        // CASCADE: If category deactivated, deactivate all subcategories and services
        if (!category.isActive) {
            const subcategoryResult = await Subcategory.updateMany(
                { category: categoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${subcategoryResult.modifiedCount} subcategories in category`);

            const serviceResult = await Service.updateMany(
                { category: categoryId },
                { isActive: false }
            );
            console.log(`⚠️ Deactivated ${serviceResult.modifiedCount} services in category`);
        }

        // Socket event
        emitCategoryUpdate(category, 'updated');

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
            data: category
        });

    } catch (error) {
        console.error('toggleCategoryStatus ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error toggling category status'
        });
    }
};

// ============================================
// REORDER CATEGORIES
// ============================================
export const reorderCategories = async (req, res) => {
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

        await Category.bulkWrite(bulkOps);

        res.status(200).json({
            success: true,
            message: 'Categories reordered successfully'
        });

    } catch (error) {
        console.error('reorderCategories ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error reordering categories'
        });
    }
};

export default {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    reorderCategories
};