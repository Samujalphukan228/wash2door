// utils/socketEmitter.js - COMPLETE VERSION

import { getIO } from '../config/socket.js';
import SOCKET_EVENTS from './socketEvents.js';

// ============================================
// BOOKING EVENTS
// ============================================
export const emitNewBooking = (booking, customerName) => {
    const io = getIO();
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return;
    }

    const payload = {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        customerName,
        serviceName: booking.serviceName,
        variantName: booking.variantName,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        price: booking.price,
        status: booking.status,
        createdAt: new Date()
    };

    // Notify admins about new booking
    io.to('admins').emit(SOCKET_EVENTS.BOOKING_NEW, payload);

    console.log(`📡 Emitted ${SOCKET_EVENTS.BOOKING_NEW} - ${booking.bookingCode}`);
};

export const emitBookingStatusUpdate = (booking, userId) => {
    const io = getIO();
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return;
    }

    const payload = {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        serviceName: booking.serviceName,
        updatedAt: new Date()
    };

    // Notify admins
    io.to('admins').emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, payload);

    // Notify specific user if online booking
    if (userId) {
        io.to(`user:${userId}`).emit(SOCKET_EVENTS.BOOKING_STATUS_UPDATED, payload);
    }

    console.log(`📡 Emitted ${SOCKET_EVENTS.BOOKING_STATUS_UPDATED} - ${booking.bookingCode} -> ${booking.status}`);
};

export const emitBookingCancelled = (booking, cancelledBy) => {
    const io = getIO();
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return;
    }

    // Format date properly
    const bookingDateStr = booking.bookingDate instanceof Date
        ? booking.bookingDate.toISOString().split('T')[0]
        : typeof booking.bookingDate === 'string'
            ? booking.bookingDate.split('T')[0]
            : booking.bookingDate;

    const payload = {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        serviceName: booking.serviceName,
        serviceId: booking.serviceId,
        bookingDate: bookingDateStr,
        timeSlot: booking.timeSlot,
        cancelledBy,
        cancelledAt: new Date()
    };

    // Notify admins
    io.to('admins').emit(SOCKET_EVENTS.BOOKING_CANCELLED, payload);

    // Notify the user who owns the booking
    if (booking.customerId) {
        io.to(`user:${booking.customerId}`).emit(SOCKET_EVENTS.BOOKING_CANCELLED, payload);
    }

    // 🔥 Broadcast slot availability to ALL connected clients
    emitSlotAvailable(bookingDateStr, booking.timeSlot, booking.serviceId);

    console.log(`📡 Emitted ${SOCKET_EVENTS.BOOKING_CANCELLED} - ${booking.bookingCode}`);
};

// ============================================
// SLOT AVAILABILITY EVENTS (Real-time updates)
// ============================================
export const emitSlotBooked = (date, timeSlot, serviceId = null) => {
    const io = getIO();
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return;
    }

    // Normalize date format
    const dateStr = date instanceof Date
        ? date.toISOString().split('T')[0]
        : typeof date === 'string'
            ? date.split('T')[0]
            : date;

    const payload = {
        date: dateStr,
        timeSlot,
        serviceId,
        available: false,
        timestamp: new Date()
    };

    // Broadcast to ALL connected clients for real-time availability
    io.emit(SOCKET_EVENTS.SLOT_BOOKED, payload);

    console.log(`📡 Emitted ${SOCKET_EVENTS.SLOT_BOOKED} - ${dateStr} ${timeSlot}`);
};

export const emitSlotAvailable = (date, timeSlot, serviceId = null) => {
    const io = getIO();
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return;
    }

    // Normalize date format
    const dateStr = date instanceof Date
        ? date.toISOString().split('T')[0]
        : typeof date === 'string'
            ? date.split('T')[0]
            : date;

    const payload = {
        date: dateStr,
        timeSlot,
        serviceId,
        available: true,
        timestamp: new Date()
    };

    // Broadcast to ALL connected clients
    io.emit(SOCKET_EVENTS.SLOT_AVAILABLE, payload);

    console.log(`📡 Emitted ${SOCKET_EVENTS.SLOT_AVAILABLE} - ${dateStr} ${timeSlot}`);
};

// ============================================
// CATEGORY EVENTS
// ============================================
export const emitCategoryUpdate = (category, action) => {
    const io = getIO();
    if (!io) return;

    const eventName = `category:${action}`;
    const payload = {
        categoryId: category._id,
        name: category.name,
        isActive: category.isActive,
        action,
        updatedAt: new Date()
    };

    io.emit(eventName, payload);
    console.log(`📡 Emitted ${eventName} - ${category.name}`);
};

// ============================================
// SUBCATEGORY EVENTS
// ============================================
export const emitSubcategoryUpdate = (subcategory, action) => {
    const io = getIO();
    if (!io) return;

    const eventName = `subcategory:${action}`;
    const payload = {
        subcategoryId: subcategory._id,
        name: subcategory.name,
        categoryId: subcategory.category,
        isActive: subcategory.isActive,
        action,
        updatedAt: new Date()
    };

    io.emit(eventName, payload);
    console.log(`📡 Emitted ${eventName} - ${subcategory.name}`);
};

// ============================================
// SERVICE EVENTS
// ============================================
export const emitServiceUpdate = (service, action) => {
    const io = getIO();
    if (!io) return;

    const eventName = `service:${action}`;
    const payload = {
        serviceId: service._id,
        name: service.name,
        category: service.category,
        subcategory: service.subcategory,
        isActive: service.isActive,
        isFeatured: service.isFeatured,
        action,
        updatedAt: new Date()
    };

    io.emit(eventName, payload);
    console.log(`📡 Emitted ${eventName} - ${service.name}`);
};

export const emitVariantUpdate = (serviceId, variant, action) => {
    const io = getIO();
    if (!io) return;

    const eventName = `service:variant${action.charAt(0).toUpperCase() + action.slice(1)}`;

    io.emit(eventName, {
        serviceId,
        variantId: variant._id,
        variantName: variant.name,
        action,
        updatedAt: new Date()
    });

    console.log(`📡 Emitted ${eventName} - ${variant.name}`);
};

// ============================================
// REVIEW EVENTS
// ============================================
export const emitNewReview = (review, serviceName) => {
    const io = getIO();
    if (!io) return;

    io.to('admins').emit(SOCKET_EVENTS.REVIEW_NEW, {
        reviewId: review._id,
        serviceId: review.serviceId,
        serviceName,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date()
    });

    console.log(`📡 Emitted ${SOCKET_EVENTS.REVIEW_NEW} - ${review.rating}★ for ${serviceName}`);
};

// ============================================
// USER EVENTS
// ============================================
export const emitUserBlocked = (userId, reason) => {
    const io = getIO();
    if (!io) return;

    io.to(`user:${userId}`).emit(SOCKET_EVENTS.USER_BLOCKED, {
        userId,
        reason,
        blockedAt: new Date()
    });

    console.log(`📡 Emitted ${SOCKET_EVENTS.USER_BLOCKED} - ${userId}`);
};

export const emitUserRoleChanged = (userId, newRole) => {
    const io = getIO();
    if (!io) return;

    io.to(`user:${userId}`).emit(SOCKET_EVENTS.USER_ROLE_CHANGED, {
        userId,
        newRole,
        changedAt: new Date()
    });

    console.log(`📡 Emitted ${SOCKET_EVENTS.USER_ROLE_CHANGED} - ${userId} -> ${newRole}`);
};

// ============================================
// DASHBOARD EVENTS
// ============================================
export const emitDashboardUpdate = (stats) => {
    const io = getIO();
    if (!io) return;

    io.to('admins').emit(SOCKET_EVENTS.DASHBOARD_UPDATED, {
        stats,
        updatedAt: new Date()
    });

    console.log(`📡 Emitted ${SOCKET_EVENTS.DASHBOARD_UPDATED}`);
};

export default {
    // Booking
    emitNewBooking,
    emitBookingStatusUpdate,
    emitBookingCancelled,
    
    // Slots
    emitSlotBooked,
    emitSlotAvailable,
    
    // Category
    emitCategoryUpdate,
    
    // Subcategory
    emitSubcategoryUpdate,
    
    // Service
    emitServiceUpdate,
    emitVariantUpdate,
    
    // Review
    emitNewReview,
    
    // User
    emitUserBlocked,
    emitUserRoleChanged,
    
    // Dashboard
    emitDashboardUpdate
};