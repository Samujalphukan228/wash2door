// controllers/categoryController.js

import Category from '../models/Category.js';
import Service from '../models/Service.js';
import mongoose from 'mongoose';

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

// ============================================
// GET ALL CATEGORIES (ADMIN)
// ============================================
export const getAllCategories = async (req, res) => {
    console.log('🔥 getAllCategories CALLED');

    try {
        const { isActive, page = 1, limit = 50 } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 50;

        const query = {};
        if (isActive !== undefined && isActive !== '') {
            query.isActive = isActive === 'true';
        }

        const total = await Category.countDocuments(query);

        const categories = await Category.find(query)
            .sort({ displayOrder: 1, createdAt: -1 })
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .lean();

        console.log('📦 Categories found:', categories.length);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            page: pageNum,
            data: categories
        });

    } catch (error) {
        console.error('❌ getAllCategories ERROR:', error.message);
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
    console.log('🔥 getCategoryById CALLED:', req.params.categoryId);

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

        res.status(200).json({
            success: true,
            data: category
        });

    } catch (error) {
        console.error('❌ getCategoryById ERROR:', error.message);
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
    console.log('🔥 createCategory CALLED');
    console.log('📦 Body:', req.body);
    console.log('📦 File:', req.file ? 'Yes' : 'No');

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

        const category = await Category.create({
            name: name.trim(),
            description: description || '',
            icon: icon || '',
            image: categoryImage,
            displayOrder: Number(displayOrder) || 0,
            createdBy: req.user._id
        });

        console.log('✅ Category created:', category._id);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });

    } catch (error) {
        console.error('❌ createCategory ERROR:', error.message);

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
    console.log('🔥 updateCategory CALLED:', req.params.categoryId);

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
            if (req.file) await deleteCloudinaryImage(req.file.filename);
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const { name, description, icon, displayOrder, isActive } = req.body;

        // Check duplicate name (excluding current)
        if (name && name.trim() !== category.name) {
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
            // Delete old image
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

        console.log('✅ Category updated:', category._id);

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });

    } catch (error) {
        console.error('❌ updateCategory ERROR:', error.message);
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
    console.log('🔥 deleteCategory CALLED:', req.params.categoryId);

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

        // Check if category has services
        const serviceCount = await Service.countDocuments({ category: categoryId });

        if (serviceCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category with ${serviceCount} service(s). Delete or move services first.`
            });
        }

        // Delete category image
        if (category.image.publicId) {
            await deleteCloudinaryImage(category.image.publicId);
        }

        await category.deleteOne();

        console.log('✅ Category deleted:', categoryId);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {
        console.error('❌ deleteCategory ERROR:', error.message);
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
    console.log('🔥 toggleCategoryStatus CALLED:', req.params.categoryId);

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

        // If category is deactivated, optionally deactivate all its services
        if (!category.isActive) {
            await Service.updateMany(
                { category: categoryId },
                { isActive: false }
            );
            console.log('⚠️ All services in category deactivated');
        }

        console.log('✅ Category status toggled:', category.isActive);

        res.status(200).json({
            success: true,
            message: `Category ${category.isActive ? 'activated' : 'deactivated'}`,
            data: category
        });

    } catch (error) {
        console.error('❌ toggleCategoryStatus ERROR:', error.message);
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
    console.log('🔥 reorderCategories CALLED');

    try {
        const { orderedIds } = req.body;
        // orderedIds = ["id1", "id2", "id3"] in desired order

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

        console.log('✅ Categories reordered');

        res.status(200).json({
            success: true,
            message: 'Categories reordered successfully'
        });

    } catch (error) {
        console.error('❌ reorderCategories ERROR:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error reordering categories'
        });
    }
};