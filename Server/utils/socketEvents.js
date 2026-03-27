// utils/socketEvents.js - COMPLETE & ALIGNED

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
    BOOKING_NEW: 'booking:new',
    BOOKING_STATUS_UPDATED: 'booking:statusUpdated',
    BOOKING_CANCELLED: 'booking:cancelled',

    // ============================================
    // SLOT AVAILABILITY EVENTS (Real-time)
    // ============================================
    SLOT_BOOKED: 'slot:booked',
    SLOT_AVAILABLE: 'slot:available',
    SLOTS_REFRESH: 'slots:refresh',

    // ============================================
    // CATEGORY EVENTS
    // ============================================
    CATEGORY_CREATED: 'category:created',
    CATEGORY_UPDATED: 'category:updated',
    CATEGORY_DELETED: 'category:deleted',

    // ============================================
    // SUBCATEGORY EVENTS
    // ============================================
    SUBCATEGORY_CREATED: 'subcategory:created',
    SUBCATEGORY_UPDATED: 'subcategory:updated',
    SUBCATEGORY_DELETED: 'subcategory:deleted',

    // ============================================
    // SERVICE EVENTS
    // ============================================
    SERVICE_CREATED: 'service:created',
    SERVICE_UPDATED: 'service:updated',
    SERVICE_DELETED: 'service:deleted',
    
    // Variant events
    SERVICE_VARIANT_CREATED: 'service:variantCreated',
    SERVICE_VARIANT_UPDATED: 'service:variantUpdated',
    SERVICE_VARIANT_DELETED: 'service:variantDeleted',

    // ============================================
    // REVIEW EVENTS
    // ============================================
    REVIEW_NEW: 'review:new',
    REVIEW_UPDATED: 'review:updated',
    REVIEW_DELETED: 'review:deleted',

    // ============================================
    // USER EVENTS
    // ============================================
    USER_BLOCKED: 'user:blocked',
    USER_ROLE_CHANGED: 'user:roleChanged',
    USER_PROFILE_UPDATED: 'user:profileUpdated',

    // ============================================
    // DASHBOARD EVENTS
    // ============================================
    DASHBOARD_UPDATED: 'dashboard:updated',

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================
    NOTIFICATION: 'notification'
};

export default SOCKET_EVENTS;