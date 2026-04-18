import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import WalkInCustomer from '../models/WalkInCustomer.js';
import {
    TIME_SLOTS,
    ADMIN_ONLY_SLOTS,
    ALL_TIME_SLOTS,
    BOOKING_STATUSES,
    CLOSED_DAY_MESSAGE,
    isValidTimeSlot,
    isValidAnySlot,
    isAdminOnlySlot,
    isClosedDay,
    convertTo24Hour
} from '../utils/constants.js';
import {
    emitNewBooking,
    emitBookingStatusUpdate,
    emitBookingCancelled,
    emitSlotBooked,
    emitSlotAvailable,
    emitUserBlocked,
    emitDashboardUpdate
} from '../utils/socketEmitter.js';
import {
    sendAdminBookingTelegram,
    sendBookingCancelledTelegram,
    sendBookingStatusTelegram
} from '../utils/telegram.js';
import ExpenseCategory from '../models/ExpenseCategory.js';
import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) &&
    /^[0-9a-fA-F]{24}$/.test(id);

const getLocalDateStr = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ============================================
// DASHBOARD STATS
// ============================================

export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

        const [
            totalUsers,
            totalAdmins,
            newUsersThisMonth,
            totalBookings,
            totalServices,
            activeServices,
            bookingsToday,
            pendingBookings,
            confirmedBookings,
            completedBookings,
            bookingsThisMonth,
            bookingsLastMonth
        ] = await Promise.all([
            User.countDocuments({ role: 'user', registrationStatus: 'completed' }),
            User.countDocuments({ role: 'admin' }),
            User.countDocuments({
                role: 'user',
                registrationStatus: 'completed',
                createdAt: { $gte: thisMonthStart }
            }),
            Booking.countDocuments(),
            Service.countDocuments(),
            Service.countDocuments({ isActive: true }),
            Booking.countDocuments({ createdAt: { $gte: today, $lte: todayEnd } }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' }),
            Booking.countDocuments({ status: 'completed' }),
            Booking.countDocuments({ createdAt: { $gte: thisMonthStart } }),
            Booking.countDocuments({ createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } })
        ]);

        const [revenueThisMonth, revenueLastMonth, totalRevenue, revenueToday] = await Promise.all([
            Booking.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: thisMonthStart } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]),
            Booking.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]),
            Booking.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ]),
            Booking.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: today, $lte: todayEnd } } },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ])
        ]);

        const [expensesThisMonth, expensesLastMonth, totalExpenses, expensesToday, expenseCategories] = await Promise.all([
            Expense.aggregate([
                { $match: { createdAt: { $gte: thisMonthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $match: { createdAt: { $gte: today, $lte: todayEnd } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            ExpenseCategory.find().sort({ totalAmount: -1 }).lean()
        ]);

        const expensesByCategory = await Expense.aggregate([
            { $match: { createdAt: { $gte: thisMonthStart } } },
            {
                $group: {
                    _id: '$categoryName',
                    amount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { amount: -1 } }
        ]);

        const revenueTotalVal = totalRevenue[0]?.total || 0;
        const revenueThisMonthVal = revenueThisMonth[0]?.total || 0;
        const revenueLastMonthVal = revenueLastMonth[0]?.total || 0;
        const revenueTodayVal = revenueToday[0]?.total || 0;

        const expenseTotalVal = totalExpenses[0]?.total || 0;
        const expenseThisMonthVal = expensesThisMonth[0]?.total || 0;
        const expenseLastMonthVal = expensesLastMonth[0]?.total || 0;
        const expenseTodayVal = expensesToday[0]?.total || 0;

        const netProfitTotal = revenueTotalVal - expenseTotalVal;
        const netProfitThisMonth = revenueThisMonthVal - expenseThisMonthVal;
        const netProfitLastMonth = revenueLastMonthVal - expenseLastMonthVal;
        const netProfitToday = revenueTodayVal - expenseTodayVal;

        const profitMarginThisMonth = revenueThisMonthVal > 0
            ? Math.round((netProfitThisMonth / revenueThisMonthVal) * 100)
            : 0;

        const profitMarginTotal = revenueTotalVal > 0
            ? Math.round((netProfitTotal / revenueTotalVal) * 100)
            : 0;

        const weeklyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const weeklyExpenses = await Expense.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    expenses: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const expenseMap = {};
        weeklyExpenses.forEach(e => { expenseMap[e._id] = e.expenses; });

        const weeklyData = weeklyRevenue.map(day => ({
            day: day._id,
            revenue: day.revenue,
            bookings: day.bookings,
            expenses: expenseMap[day._id] || 0,
            profit: day.revenue - (expenseMap[day._id] || 0)
        }));

        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        const monthlyRevenue = await Booking.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyExpenses = await Expense.aggregate([
            {
                $match: { createdAt: { $gte: sixMonthsAgo } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    expenses: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const monthlyExpenseMap = {};
        monthlyExpenses.forEach(e => { monthlyExpenseMap[e._id] = e.expenses; });

        const monthlyData = monthlyRevenue.map(month => ({
            month: month._id,
            revenue: month.revenue,
            bookings: month.bookings,
            expenses: monthlyExpenseMap[month._id] || 0,
            profit: month.revenue - (monthlyExpenseMap[month._id] || 0)
        }));

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customerId', 'firstName lastName email avatar')
            .lean();

        const popularServices = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    categoryName: { $first: '$categoryName' },
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$price' }
                }
            },
            { $sort: { totalBookings: -1 } },
            { $limit: 5 }
        ]);

        const bookingsByCategory = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$categoryName',
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const bookingsByTimeSlot = await Booking.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: '$timeSlot',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const upcomingToday = await Booking.find({
            bookingDate: { $gte: today, $lte: todayEnd },
            status: { $in: ['pending', 'confirmed'] }
        })
            .populate('customerId', 'firstName lastName email')
            .sort({ timeSlot: 1 })
            .limit(10)
            .lean();

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: totalAdmins,
                    newThisMonth: newUsersThisMonth
                },
                services: {
                    total: totalServices,
                    active: activeServices
                },
                bookings: {
                    total: totalBookings,
                    today: bookingsToday,
                    thisMonth: bookingsThisMonth,
                    lastMonth: bookingsLastMonth,
                    growth: bookingsLastMonth > 0
                        ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100)
                        : 100,
                    byStatus: {
                        pending: pendingBookings,
                        confirmed: confirmedBookings,
                        completed: completedBookings
                    }
                },
                revenue: {
                    total: revenueTotalVal,
                    today: revenueTodayVal,
                    thisMonth: revenueThisMonthVal,
                    lastMonth: revenueLastMonthVal,
                    growth: revenueLastMonthVal > 0
                        ? Math.round(((revenueThisMonthVal - revenueLastMonthVal) / revenueLastMonthVal) * 100)
                        : 100
                },
                expenses: {
                    total: expenseTotalVal,
                    today: expenseTodayVal,
                    thisMonth: expenseThisMonthVal,
                    lastMonth: expenseLastMonthVal,
                    growth: expenseLastMonthVal > 0
                        ? Math.round(((expenseThisMonthVal - expenseLastMonthVal) / expenseLastMonthVal) * 100)
                        : 0,
                    byCategory: expensesByCategory,
                    categories: expenseCategories
                },
                profit: {
                    total: netProfitTotal,
                    today: netProfitToday,
                    thisMonth: netProfitThisMonth,
                    lastMonth: netProfitLastMonth,
                    marginThisMonth: profitMarginThisMonth,
                    marginTotal: profitMarginTotal,
                    growth: netProfitLastMonth !== 0
                        ? Math.round(((netProfitThisMonth - netProfitLastMonth) / Math.abs(netProfitLastMonth)) * 100)
                        : (netProfitThisMonth > 0 ? 100 : 0)
                },
                recentBookings,
                upcomingToday,
                popularServices,
                bookingsByCategory,
                bookingsByTimeSlot,
                weeklyData,
                monthlyData
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// ============================================
// GET ALL USERS
// ============================================

export const getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            isBlocked,
            role,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let query;
        if (role === 'admin') {
            query = { role: 'admin' };
        } else {
            query = { role: 'user', registrationStatus: 'completed' };
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (isBlocked !== undefined) {
            query.isBlocked = isBlocked === 'true';
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .select('-password -otp -refreshToken -passwordResetToken -emailVerificationToken')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const bookingStats = await Booking.aggregate([
            { $match: { customerId: { $in: users.map(u => u._id) } } },
            {
                $group: {
                    _id: '$customerId',
                    totalBookings: { $sum: 1 },
                    completedBookings: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            }
        ]);

        const statsMap = Object.fromEntries(
            bookingStats.map(s => [s._id.toString(), s])
        );

        const usersWithStats = users.map(user => ({
            ...user.toObject(),
            totalBookings: statsMap[user._id.toString()]?.totalBookings || 0,
            completedBookings: statsMap[user._id.toString()]?.completedBookings || 0
        }));

        res.status(200).json({
            success: true,
            data: {
                users: usersWithStats,
                total,
                pages: Math.ceil(total / limitNum),
                currentPage: pageNum
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE USER WITH DETAILS
// ============================================

export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid user ID'
            });
        }

        const user = await User.findById(userId)
            .select('-password -otp -refreshToken -passwordResetToken -emailVerificationToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const [totalBookings, completedBookings, pendingBookings, totalSpent] = await Promise.all([
            Booking.countDocuments({ customerId: userId }),
            Booking.countDocuments({ customerId: userId, status: 'completed' }),
            Booking.countDocuments({ customerId: userId, status: { $in: ['pending', 'confirmed'] } }),
            Booking.aggregate([
                {
                    $match: {
                        customerId: new mongoose.Types.ObjectId(userId),
                        status: 'completed'
                    }
                },
                { $group: { _id: null, total: { $sum: '$price' } } }
            ])
        ]);

        const recentBookings = await Booking.find({ customerId: userId })
            .sort({ createdAt: -1 })
            .limit(10);

        const favoriteServices = await Booking.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(userId),
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 3 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                user,
                stats: {
                    totalBookings,
                    completedBookings,
                    pendingBookings,
                    totalSpent: totalSpent[0]?.total || 0,
                    completionRate: totalBookings > 0
                        ? Math.round((completedBookings / totalBookings) * 100)
                        : 0
                },
                recentBookings,
                favoriteServices
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// ============================================
// BLOCK USER
// ============================================

export const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ success: false, message: 'Cannot block admin users' });
        }

        if (user.isBlocked) {
            return res.status(400).json({ success: false, message: 'User is already blocked' });
        }

        user.isBlocked = true;
        user.blockedReason = reason || 'No reason provided';
        user.blockedAt = new Date();
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });

        emitUserBlocked(userId, user.blockedReason);

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: 'User blocked successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ success: false, message: 'Error blocking user', error: error.message });
    }
};

// ============================================
// UNBLOCK USER
// ============================================

export const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.isBlocked) {
            return res.status(400).json({ success: false, message: 'User is not blocked' });
        }

        user.isBlocked = false;
        user.blockedReason = undefined;
        user.blockedAt = undefined;
        await user.save({ validateBeforeSave: false });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: 'User unblocked successfully',
            data: userResponse
        });

    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ success: false, message: 'Error unblocking user', error: error.message });
    }
};

// ============================================
// CHANGE USER ROLE
// ============================================

export const changeUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        if (userId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot change your own role' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === role) {
            return res.status(400).json({ success: false, message: `User is already a ${role}` });
        }

        user.role = role;
        await user.save({ validateBeforeSave: false });

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.refreshToken;

        res.status(200).json({
            success: true,
            message: `User role changed to ${role}`,
            data: userResponse
        });

    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ success: false, message: 'Error changing role', error: error.message });
    }
};

// ============================================
// GET ALL BOOKINGS (ADMIN)
// ============================================

export const getAllBookings = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            date,
            city,
            search,
            categoryName,
            startDate,
            endDate,
            bookingType,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const query = {};

        if (status && BOOKING_STATUSES.includes(status)) {
            query.status = status;
        }

        if (categoryName) {
            query.categoryName = { $regex: categoryName, $options: 'i' };
        }

        if (bookingType && ['online', 'walkin'].includes(bookingType)) {
            query.bookingType = bookingType;
        }

        if (city) {
            query['location.city'] = { $regex: city, $options: 'i' };
        }

        if (date) {
            const bookingDate = new Date(date);
            const startOfDay = new Date(bookingDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(bookingDate);
            endOfDay.setHours(23, 59, 59, 999);
            query.bookingDate = { $gte: startOfDay, $lte: endOfDay };
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: 'i' } },
                { serviceName: { $regex: search, $options: 'i' } },
                { 'walkInCustomer.name': { $regex: search, $options: 'i' } },
                { 'walkInCustomer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const total = await Booking.countDocuments(query);

        const bookings = await Booking.find(query)
            .populate('customerId', 'firstName lastName email avatar')
            .populate('createdBy', 'firstName lastName')
            .sort(sortOptions)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        res.status(200).json({
            success: true,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: bookings
        });

    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ success: false, message: 'Error fetching bookings', error: error.message });
    }
};

// ============================================
// GET SINGLE BOOKING (ADMIN)
// ============================================

export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        const booking = await Booking.findById(bookingId)
            .populate('customerId', 'firstName lastName email avatar phone')
            .populate('createdBy', 'firstName lastName');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        let customerHistory = null;
        if (booking.customerId) {
            customerHistory = await Booking.find({
                customerId: booking.customerId._id,
                _id: { $ne: bookingId }
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('bookingCode serviceName status bookingDate price');
        }

        res.status(200).json({
            success: true,
            data: { booking, customerHistory }
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ success: false, message: 'Error fetching booking', error: error.message });
    }
};

// ============================================
// UPDATE BOOKING STATUS (DELETES IF CANCELLED)
// ============================================

export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason } = req.body;

        if (!isValidObjectId(bookingId)) {
            return res.status(400).json({ success: false, message: 'Invalid booking ID' });
        }

        if (!BOOKING_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be: ${BOOKING_STATUSES.join(', ')}`
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate('customerId', 'firstName lastName email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[booking.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from "${booking.status}" to "${status}"`
            });
        }

        const oldDateStr = getLocalDateStr(new Date(booking.bookingDate));
        const oldTimeSlot = booking.timeSlot;
        const oldServiceId = booking.serviceId;

        // ============================================
        // CANCELLED - DELETE FROM DB
        // ============================================
        if (status === 'cancelled') {
            const bookingData = {
                _id: booking._id,
                bookingCode: booking.bookingCode,
                serviceName: booking.serviceName,
                bookingDate: booking.bookingDate,
                timeSlot: booking.timeSlot,
                price: booking.price,
                phone: booking.phone,
                walkInCustomer: booking.walkInCustomer,
                customerId: booking.customerId,
                cancelledBy: 'admin',
                cancellationReason: reason || 'Cancelled by admin'
            };

            await Booking.deleteOne({ _id: bookingId });

            emitBookingCancelled(bookingData, 'admin');
            emitSlotAvailable(oldDateStr, oldTimeSlot, oldServiceId);
            emitDashboardUpdate({ action: 'booking_cancelled' });

            // ✅ Telegram only - no email
            setImmediate(async () => {
                try {
                    await sendBookingCancelledTelegram(bookingData, 'admin');
                    console.log('📱 Telegram: Admin cancellation notification sent');
                } catch (e) {
                    console.error('Telegram cancellation notification failed:', e.message);
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Booking cancelled and deleted successfully',
                data: { ...bookingData, status: 'deleted' }
            });
        }

        // ============================================
        // CONFIRMED / COMPLETED
        // ============================================
        booking.status = status;

        if (status === 'completed') {
            booking.completedAt = new Date();
            booking.paymentStatus = 'completed';
        }

        await booking.save();

        emitBookingStatusUpdate(booking, booking.customerId?._id);
        emitDashboardUpdate({ action: 'booking_status_changed', status });

        // ✅ Telegram only - no email
        setImmediate(async () => {
            try {
                await sendBookingStatusTelegram(
                    booking,
                    status,
                    `Admin (${req.user.firstName} ${req.user.lastName})`
                );
                console.log('📱 Telegram: Status update notification sent');
            } catch (e) {
                console.error('Telegram status notification failed:', e.message);
            }
        });

        res.status(200).json({
            success: true,
            message: `Booking status updated to ${status}`,
            data: booking
        });

    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ success: false, message: 'Error updating booking status', error: error.message });
    }
};

// ============================================
// CREATE ADMIN BOOKING ✅ FIXED + TELEGRAM
// ============================================

export const createAdminBooking = async (req, res) => {
    try {
        const {
            bookingType,
            customerId,
            walkInCustomer,
            serviceId,
            bookingDate,
            timeSlot,
            location,
            phone,
            paymentMethod,
            paymentStatus,
            adminNotes
        } = req.body;

        // ✅ FIX: Validate location early with defaults
        const bookingLocation = {
            address: location?.address?.trim() || 'Walk-in / At Shop',
            city: location?.city?.trim() || 'Duliajan'
        };

        if (!bookingType || !['walkin', 'online'].includes(bookingType)) {
            return res.status(400).json({
                success: false,
                message: 'bookingType must be "walkin" or "online"'
            });
        }

        if (bookingType === 'walkin') {
            if (!walkInCustomer?.name?.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Walk-in customer name is required'
                });
            }
        }

        if (bookingType === 'online') {
            if (!customerId || !isValidObjectId(customerId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid customer ID is required for online booking'
                });
            }

            const customerExists = await User.findById(customerId);
            if (!customerExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }
        }

        if (!phone || !/^\+?[\d\s\-]{7,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Valid phone number is required'
            });
        }

        if (!serviceId || !isValidObjectId(serviceId)) {
            return res.status(400).json({
                success: false,
                message: 'Valid service ID is required'
            });
        }

        const service = await Service.findOne({ _id: serviceId, isActive: true })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found or not active'
            });
        }

        if (!service.category || !service.subcategory) {
            return res.status(400).json({
                success: false,
                message: 'Service category/subcategory missing'
            });
        }

        const finalPrice = service.discountPrice ?? service.price ?? 0;
        const duration = service.duration ?? 60;

        if (!finalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Service has no valid price'
            });
        }

        if (!bookingDate || !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        const [year, month, day] = bookingDate.split('-').map(Number);
        const requestedDate = new Date(year, month - 1, day, 12, 0, 0, 0);

        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date'
            });
        }

        const now = new Date();
        const todayStr = getLocalDateStr(now);

        if (bookingDate < todayStr) {
            return res.status(400).json({
                success: false,
                message: 'Booking date cannot be in the past'
            });
        }

        if (isClosedDay(requestedDate)) {
            return res.status(400).json({
                success: false,
                message: CLOSED_DAY_MESSAGE
            });
        }

        if (!timeSlot || !isValidAnySlot(timeSlot)) {
            return res.status(400).json({
                success: false,
                message: `Invalid time slot. Valid slots: ${ALL_TIME_SLOTS.join(', ')}`
            });
        }

        const isAdminSlot = isAdminOnlySlot(timeSlot);
        const slotLockKey = `${bookingDate}|${timeSlot}`;

        const slotTaken = await Booking.findOne({
            slotLockKey,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: `Time slot ${timeSlot} on ${bookingDate} is already booked`
            });
        }

        let booking;

        try {
            booking = await Booking.create({
                bookingType,
                isAdminSlot,
                customerId: bookingType === 'online' ? customerId : null,
                walkInCustomer: bookingType === 'walkin'
                    ? { name: walkInCustomer.name.trim(), phone: phone }
                    : { name: '', phone: '' },

                categoryId: service.category._id,
                categoryName: service.category.name,

                subcategoryId: service.subcategory._id,
                subcategoryName: service.subcategory.name,

                serviceId: service._id,
                serviceName: service.name,
                serviceTier: service.tier || 'basic',

                price: finalPrice,
                duration,

                bookingDate: requestedDate,
                timeSlot,

                // ✅ FIXED: Use validated bookingLocation with defaults
                location: bookingLocation,
                phone,

                paymentMethod: paymentMethod || 'cash',
                paymentStatus: paymentStatus || 'pending',

                createdBy: req.user._id,
                status: 'confirmed',

                adminNotes: adminNotes || ''
            });
        } catch (createError) {
            if (createError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${timeSlot} on ${bookingDate} was just booked by someone else`
                });
            }
            throw createError;
        }

        await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });

        // Save walk-in customer to DB
        if (bookingType === 'walkin' && walkInCustomer?.name && phone) {
            try {
                let walkinCustomerDoc = await WalkInCustomer.findOne({
                    phone: phone.trim(),
                    isActive: true
                });

                if (walkinCustomerDoc) {
                    walkinCustomerDoc.name = walkInCustomer.name.trim();
                    walkinCustomerDoc.totalBookings += 1;
                    walkinCustomerDoc.lastBookingDate = new Date();
                    await walkinCustomerDoc.save();
                } else {
                    await WalkInCustomer.create({
                        name: walkInCustomer.name.trim(),
                        phone: phone.trim(),
                        totalBookings: 1,
                        lastBookingDate: new Date(),
                        createdBy: req.user._id
                    });
                }
            } catch (walkinError) {
                console.error('Walk-in customer save error:', walkinError.message);
            }
        }

        const customerName = bookingType === 'walkin'
            ? walkInCustomer.name
            : 'Online Customer';

        emitNewBooking(booking, customerName);
        emitSlotBooked(bookingDate, timeSlot, serviceId);
        emitDashboardUpdate({ action: 'new_booking', bookingType, isAdminSlot });

        // ✅ Telegram only - no email for admin bookings
        setImmediate(async () => {
            try {
                await sendAdminBookingTelegram(booking);
                console.log('📱 Telegram: Admin booking notification sent');
            } catch (e) {
                console.error('Telegram admin booking notification failed:', e.message);
            }
        });

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: {
                ...booking.toObject(),
                isAdminSlot: booking.isAdminSlot
            }
        });

    } catch (error) {
        console.error('Admin create booking error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
};

// ============================================
// REVENUE REPORT
// ============================================

export const getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const matchCondition = { status: 'completed' };

        if (startDate || endDate) {
            matchCondition.completedAt = {};
            if (startDate) matchCondition.completedAt.$gte = new Date(startDate);
            if (endDate) matchCondition.completedAt.$lte = new Date(endDate);
        }

        const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

        const revenueData = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dateToString: { format: dateFormat, date: '$completedAt' } },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 },
                    avgOrderValue: { $avg: '$price' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const revenueByCategory = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$categoryName',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        const revenueByService = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const revenueByCity = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$location.city',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);

        const revenueByPaymentMethod = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$paymentMethod',
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
        const totalBookings = revenueData.reduce((sum, day) => sum + day.bookings, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalBookings,
                    averageOrderValue: totalBookings > 0
                        ? Math.round(totalRevenue / totalBookings)
                        : 0
                },
                revenueData,
                revenueByCategory,
                revenueByService,
                revenueByCity,
                revenueByPaymentMethod
            }
        });

    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching revenue report', error: error.message });
    }
};

// ============================================
// BOOKING REPORT
// ============================================

export const getBookingReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const matchCondition = {};

        if (startDate || endDate) {
            matchCondition.createdAt = {};
            if (startDate) matchCondition.createdAt.$gte = new Date(startDate);
            if (endDate) matchCondition.createdAt.$lte = new Date(endDate);
        }

        const byStatus = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const byService = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$serviceId',
                    serviceName: { $first: '$serviceName' },
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const byTimeSlot = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const byCity = await Booking.aggregate([
            { $match: matchCondition },
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const byBookingType = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: '$bookingType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$price' }
                }
            }
        ]);

        const byDayOfWeek = await Booking.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dayOfWeek: '$bookingDate' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const dayNames = ['', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const byDayOfWeekNamed = byDayOfWeek.map(d => ({
            day: dayNames[d._id],
            count: d.count
        }));

        res.status(200).json({
            success: true,
            data: {
                byStatus,
                byService,
                byTimeSlot,
                byCity,
                byBookingType,
                byDayOfWeek: byDayOfWeekNamed
            }
        });

    } catch (error) {
        console.error('Booking report error:', error);
        res.status(500).json({ success: false, message: 'Error fetching booking report', error: error.message });
    }
};

// ============================================
// CLEANUP OLD BOOKINGS
// ============================================

export const cleanupOldBookings = async (req, res) => {
    try {
        const { olderThanDays = 90, status = 'completed', dryRun = 'false' } = req.query;
        const days = parseInt(olderThanDays);

        if (isNaN(days) || days < 30) {
            return res.status(400).json({
                success: false,
                message: 'olderThanDays must be at least 30'
            });
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const query = { status, createdAt: { $lt: cutoffDate } };
        const count = await Booking.countDocuments(query);

        if (dryRun === 'true') {
            return res.status(200).json({
                success: true,
                message: `DRY RUN: Would delete ${count} ${status} bookings older than ${days} days`,
                wouldDelete: count,
                dryRun: true
            });
        }

        const result = await Booking.deleteMany(query);

        res.status(200).json({
            success: true,
            message: `Deleted ${result.deletedCount} ${status} bookings older than ${days} days`,
            deletedCount: result.deletedCount
        });

    } catch (error) {
        console.error('Cleanup bookings error:', error);
        res.status(500).json({ success: false, message: 'Error cleaning up bookings', error: error.message });
    }
};

// ============================================
// GET BOOKING CLEANUP STATS
// ============================================

export const getBookingCleanupStats = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

        const [
            totalBookings,
            completedOlderThan30,
            completedOlderThan60,
            completedOlderThan90,
            pendingBookings,
            confirmedBookings
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: 'completed', createdAt: { $lt: thirtyDaysAgo } }),
            Booking.countDocuments({ status: 'completed', createdAt: { $lt: sixtyDaysAgo } }),
            Booking.countDocuments({ status: 'completed', createdAt: { $lt: ninetyDaysAgo } }),
            Booking.countDocuments({ status: 'pending' }),
            Booking.countDocuments({ status: 'confirmed' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBookings,
                activeBookings: {
                    pending: pendingBookings,
                    confirmed: confirmedBookings
                },
                cleanupCandidates: {
                    completedOlderThan30Days: completedOlderThan30,
                    completedOlderThan60Days: completedOlderThan60,
                    completedOlderThan90Days: completedOlderThan90
                },
                recommendation: completedOlderThan90 > 100
                    ? `Consider cleaning up ${completedOlderThan90} old completed bookings`
                    : 'No cleanup needed at this time'
            }
        });

    } catch (error) {
        console.error('Cleanup stats error:', error);
        res.status(500).json({ success: false, message: 'Error fetching cleanup stats', error: error.message });
    }
};

export default {
    getDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    unblockUser,
    changeUserRole,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    createAdminBooking,
    getRevenueReport,
    getBookingReport,
    cleanupOldBookings,
    getBookingCleanupStats
};