// utils/socketEvents.js - COMPLETE with all events

export const SOCKET_EVENTS = {
    // ============================================
    // CONNECTION
    // ============================================
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    ERROR: 'error',

    // ============================================
    // BOOKING EVENTS
    // ============================================
    
    // New booking created (admin notification)
    NEW_BOOKING: 'new_booking',
    
    // Booking status changed (user + admin)
    BOOKING_STATUS_UPDATED: 'booking_status_updated',
    
    // Booking cancelled
    BOOKING_CANCELLED: 'booking_cancelled',

    // ============================================
    // SLOT EVENTS (for real-time availability)
    // ============================================
    
    // A slot was just booked (broadcast to all)
    SLOT_BOOKED: 'slot_booked',
    
    // A slot became available (cancellation)
    SLOT_AVAILABLE: 'slot_available',
    
    // Request to refresh slots (client can emit this)
    REFRESH_SLOTS: 'refresh_slots',

    // ============================================
    // ADMIN DASHBOARD EVENTS
    // ============================================
    
    // Dashboard stats changed
    DASHBOARD_UPDATED: 'dashboard_updated',
    
    // New user registered
    NEW_USER: 'new_user',

    // ============================================
    // SERVICE EVENTS
    // ============================================
    
    // Service updated/created/deleted
    SERVICE_UPDATED: 'service_updated',
    SERVICE_CREATED: 'service_created',
    SERVICE_DELETED: 'service_deleted',
    
    // Variant updated
    VARIANT_UPDATED: 'variant_updated',

    // ============================================
    // CATEGORY EVENTS
    // ============================================
    CATEGORY_UPDATED: 'category_updated',

    // ============================================
    // REVIEW EVENTS
    // ============================================
    NEW_REVIEW: 'new_review',
    REVIEW_UPDATED: 'review_updated',

    // ============================================
    // USER EVENTS
    // ============================================
    
    // Force user to logout (when blocked)
    FORCE_LOGOUT: 'force_logout',
    
    // User profile updated
    PROFILE_UPDATED: 'profile_updated',

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================
    NOTIFICATION: 'notification'
};

export default SOCKET_EVENTS;