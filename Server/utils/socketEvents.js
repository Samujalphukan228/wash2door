// All socket event names in one place
// Use these in both backend and frontend

export const SOCKET_EVENTS = {

    // ============================================
    // BOOKING EVENTS
    // ============================================

    // Fired when any new booking is created
    // Sent to: admin_room
    NEW_BOOKING: 'new_booking',

    // Fired when booking status changes
    // Sent to: user_{customerId} + admin_room
    BOOKING_STATUS_UPDATED: 'booking_status_updated',

    // Fired when booking is cancelled
    // Sent to: admin_room
    BOOKING_CANCELLED: 'booking_cancelled',

    // ============================================
    // ADMIN EVENTS
    // ============================================

    // Fired when dashboard stats change
    // Sent to: admin_room
    DASHBOARD_STATS_UPDATED: 'dashboard_stats_updated',

    // ============================================
    // SLOT EVENTS
    // ============================================

    // Fired when a slot gets booked
    // Sent to: everyone (broadcast)
    SLOT_BOOKED: 'slot_booked',

    // Fired when a slot becomes available (cancelled)
    // Sent to: everyone (broadcast)
    SLOT_AVAILABLE: 'slot_available'
};