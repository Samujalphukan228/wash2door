// utils/socketEmitter.js

import { getIO } from '../config/socket.js';

// ============================================
// BOOKING EVENTS
// ============================================
export const emitNewBooking = (booking, customerName) => {
    const io = getIO();
    if (!io) return;

    io.to('admins').emit('booking:new', {
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
    });

    console.log(`📡 Emitted booking:new - ${booking.bookingCode}`);
};

export const emitBookingStatusUpdate = (booking, userId) => {
    const io = getIO();
    if (!io) return;

    const payload = {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        status: booking.status,
        serviceName: booking.serviceName,
        updatedAt: new Date()
    };

    // Notify admins
    io.to('admins').emit('booking:statusUpdated', payload);

    // Notify specific user if online booking
    if (userId) {
        io.to(`user:${userId}`).emit('booking:statusUpdated', payload);
    }

    console.log(`📡 Emitted booking:statusUpdated - ${booking.bookingCode} -> ${booking.status}`);
};

export const emitBookingCancelled = (booking, cancelledBy) => {
    const io = getIO();
    if (!io) return;

    const payload = {
        bookingId: booking._id,
        bookingCode: booking.bookingCode,
        serviceName: booking.serviceName,
        serviceId: booking.serviceId,
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        cancelledBy,
        cancelledAt: new Date()
    };

    // Notify admins
    io.to('admins').emit('booking:cancelled', payload);

    // Emit slot available for real-time availability updates
    io.emit('booking:slotAvailable', {
        serviceId: booking.serviceId,
        date: booking.bookingDate,
        timeSlot: booking.timeSlot
    });

    console.log(`📡 Emitted booking:cancelled - ${booking.bookingCode}`);
};

// ============================================
// SERVICE EVENTS
// ============================================
export const emitServiceUpdate = (service, action) => {
    const io = getIO();
    if (!io) return;

    const payload = {
        serviceId: service._id,
        name: service.name,
        category: service.category,
        isActive: service.isActive,
        isFeatured: service.isFeatured,
        action,
        updatedAt: new Date()
    };

    io.emit(`service:${action}`, payload);
    console.log(`📡 Emitted service:${action} - ${service.name}`);
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
// CATEGORY EVENTS
// ============================================
export const emitCategoryUpdate = (category, action) => {
    const io = getIO();
    if (!io) return;

    const payload = {
        categoryId: category._id,
        name: category.name,
        isActive: category.isActive,
        action,
        updatedAt: new Date()
    };

    io.emit(`category:${action}`, payload);
    console.log(`📡 Emitted category:${action} - ${category.name}`);
};

// ============================================
// REVIEW EVENTS
// ============================================
export const emitNewReview = (review, serviceName) => {
    const io = getIO();
    if (!io) return;

    io.to('admins').emit('review:new', {
        reviewId: review._id,
        serviceId: review.serviceId,
        serviceName,
        rating: review.rating,
        comment: review.comment,
        createdAt: new Date()
    });

    console.log(`📡 Emitted review:new - ${review.rating}★ for ${serviceName}`);
};

// ============================================
// USER EVENTS
// ============================================
export const emitUserBlocked = (userId, reason) => {
    const io = getIO();
    if (!io) return;

    io.to(`user:${userId}`).emit('user:blocked', {
        userId,
        reason,
        blockedAt: new Date()
    });

    console.log(`📡 Emitted user:blocked - ${userId}`);
};

export const emitUserRoleChanged = (userId, newRole) => {
    const io = getIO();
    if (!io) return;

    io.to(`user:${userId}`).emit('user:roleChanged', {
        userId,
        newRole,
        changedAt: new Date()
    });

    console.log(`📡 Emitted user:roleChanged - ${userId} -> ${newRole}`);
};

export default {
    emitNewBooking,
    emitBookingStatusUpdate,
    emitBookingCancelled,
    emitServiceUpdate,
    emitVariantUpdate,
    emitCategoryUpdate,
    emitNewReview,
    emitUserBlocked,
    emitUserRoleChanged
};