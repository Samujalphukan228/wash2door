// controllers/walkInCustomerController.js

import WalkInCustomer from '../models/WalkInCustomer.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

// ============================================
// GET ALL WALK-IN CUSTOMERS (with search)
// ============================================
export const getAllWalkInCustomers = async (req, res) => {
    try {
        const { 
            search, 
            page = 1, 
            limit = 20,
            sortBy = 'totalBookings',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let query = { isActive: true };

        // Search by name or phone
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: searchRegex },
                { phone: searchRegex }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await WalkInCustomer.countDocuments(query);

        const customers = await WalkInCustomer.find(query)
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .select('-__v');

        res.status(200).json({
            success: true,
            data: {
                customers,
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum
            }
        });

    } catch (error) {
        console.error('Get walk-in customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch walk-in customers'
        });
    }
};

// ============================================
// SEARCH WALK-IN CUSTOMERS (Quick search for booking modal)
// ============================================
export const searchWalkInCustomers = async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const customers = await WalkInCustomer.search(q.trim(), parseInt(limit));

        res.status(200).json({
            success: true,
            data: customers
        });

    } catch (error) {
        console.error('Search walk-in customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search customers'
        });
    }
};

// ============================================
// GET RECENT WALK-IN CUSTOMERS
// ============================================
export const getRecentWalkInCustomers = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const customers = await WalkInCustomer.find({ isActive: true })
            .sort({ lastBookingDate: -1, totalBookings: -1 })
            .limit(parseInt(limit))
            .select('-__v');

        res.status(200).json({
            success: true,
            data: customers
        });

    } catch (error) {
        console.error('Get recent walk-in customers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent customers'
        });
    }
};

// ============================================
// GET SINGLE WALK-IN CUSTOMER
// ============================================
export const getWalkInCustomerById = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        const customer = await WalkInCustomer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {
        console.error('Get walk-in customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer'
        });
    }
};

// ============================================
// CREATE WALK-IN CUSTOMER
// ============================================
export const createWalkInCustomer = async (req, res) => {
    try {
        const { name, phone, notes } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if phone already exists
        const existingCustomer = await WalkInCustomer.findOne({ 
            phone: phone.trim(),
            isActive: true 
        });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists',
                data: existingCustomer
            });
        }

        const customer = await WalkInCustomer.create({
            name: name.trim(),
            phone: phone.trim(),
            notes: notes?.trim() || '',
            createdBy: req.user._id
        });

        console.log(`👤 Walk-in customer created: ${customer.name} (${customer.phone})`);

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });

    } catch (error) {
        console.error('Create walk-in customer error:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Customer with this phone number already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create customer'
        });
    }
};

// ============================================
// CREATE OR GET WALK-IN CUSTOMER (For booking flow)
// ============================================
export const createOrGetWalkInCustomer = async (req, res) => {
    try {
        const { name, phone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        if (!phone || !phone.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if customer exists
        let customer = await WalkInCustomer.findOne({ 
            phone: phone.trim(),
            isActive: true 
        });

        if (customer) {
            // Update name if different
            if (customer.name !== name.trim()) {
                customer.name = name.trim();
                await customer.save();
            }

            return res.status(200).json({
                success: true,
                message: 'Existing customer found',
                data: customer,
                isNew: false
            });
        }

        // Create new customer
        customer = await WalkInCustomer.create({
            name: name.trim(),
            phone: phone.trim(),
            createdBy: req.user._id
        });

        console.log(`👤 New walk-in customer created: ${customer.name} (${customer.phone})`);

        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer,
            isNew: true
        });

    } catch (error) {
        console.error('Create or get walk-in customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process customer'
        });
    }
};

// ============================================
// UPDATE WALK-IN CUSTOMER
// ============================================
export const updateWalkInCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { name, phone, notes } = req.body;

        if (!isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        const customer = await WalkInCustomer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Check if new phone already exists (if changing phone)
        if (phone && phone.trim() !== customer.phone) {
            const existingCustomer = await WalkInCustomer.findOne({
                phone: phone.trim(),
                _id: { $ne: customerId },
                isActive: true
            });

            if (existingCustomer) {
                return res.status(400).json({
                    success: false,
                    message: 'Another customer with this phone number already exists'
                });
            }
        }

        // Update fields
        if (name) customer.name = name.trim();
        if (phone) customer.phone = phone.trim();
        if (notes !== undefined) customer.notes = notes.trim();

        await customer.save();

        console.log(`👤 Walk-in customer updated: ${customer.name}`);

        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });

    } catch (error) {
        console.error('Update walk-in customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update customer'
        });
    }
};

// ============================================
// DELETE WALK-IN CUSTOMER (Soft delete)
// ============================================
export const deleteWalkInCustomer = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!isValidObjectId(customerId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid customer ID'
            });
        }

        const customer = await WalkInCustomer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Soft delete
        customer.isActive = false;
        await customer.save();

        console.log(`🗑️ Walk-in customer deleted: ${customer.name}`);

        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully'
        });

    } catch (error) {
        console.error('Delete walk-in customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete customer'
        });
    }
};

export default {
    getAllWalkInCustomers,
    searchWalkInCustomers,
    getRecentWalkInCustomers,
    getWalkInCustomerById,
    createWalkInCustomer,
    createOrGetWalkInCustomer,
    updateWalkInCustomer,
    deleteWalkInCustomer
};