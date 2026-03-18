// utils/constants.js - Centralized constants

// ============================================
// TIME SLOTS
// ============================================
export const TIME_SLOTS = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-13:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',  // ✅ ADD
    '19:00-20:00',  // ✅ ADD
    '20:00-21:00',  // ✅ ADD
];

// ============================================
// BOOKING STATUSES
// ============================================
export const BOOKING_STATUSES = [
    'pending',
    'confirmed',
    'in-progress',
    'completed',
    'cancelled'
];

// ============================================
// USER ROLES
// ============================================
export const USER_ROLES = ['user', 'admin'];

// ============================================
// SERVICE TIERS
// ============================================
export const SERVICE_TIERS = ['basic', 'standard', 'premium', 'custom'];

// ============================================
// PAYMENT METHODS
// ============================================
export const PAYMENT_METHODS = ['cash', 'card', 'online'];

// ============================================
// PAYMENT STATUSES
// ============================================
export const PAYMENT_STATUSES = ['pending', 'completed'];

// ============================================
// BOOKING TYPES
// ============================================
export const BOOKING_TYPES = ['online', 'walkin'];

// ============================================
// REGISTRATION STATUSES
// ============================================
export const REGISTRATION_STATUSES = [
    'pending',
    'otp-sent',
    'otp-verified',
    'completed',
    'failed'
];

// ============================================
// VALIDATION HELPERS
// ============================================
export const isValidTimeSlot = (slot) => TIME_SLOTS.includes(slot);
export const isValidBookingStatus = (status) => BOOKING_STATUSES.includes(status);
export const isValidServiceTier = (tier) => SERVICE_TIERS.includes(tier);
export const isValidRole = (role) => USER_ROLES.includes(role);

// ============================================
// LIMITS
// ============================================
export const LIMITS = {
    MAX_ACTIVE_BOOKINGS_PER_USER: 3,
    MAX_BOOKING_ADVANCE_DAYS: 90,
    MIN_CANCEL_HOURS_BEFORE: 2,
    MAX_SERVICE_IMAGES: 3,
    MAX_IMAGE_SIZE_MB: 5,
    MAX_AVATAR_SIZE_MB: 2,
    OTP_EXPIRY_MINUTES: 10,
    PASSWORD_RESET_EXPIRY_HOURS: 1,
    EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
    ACCOUNT_LOCK_MINUTES: 120,
    MAX_LOGIN_ATTEMPTS: 5,
    MAX_OTP_ATTEMPTS: 5
};

// ============================================
// CLOSED DAYS
// ============================================
export const CLOSED_DAYS = [0]; // 0 = Sunday

export const isClosedDay = (date) => {
    const day = new Date(date).getDay();
    return CLOSED_DAYS.includes(day);
};

export default {
    TIME_SLOTS,
    BOOKING_STATUSES,
    USER_ROLES,
    SERVICE_TIERS,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    BOOKING_TYPES,
    REGISTRATION_STATUSES,
    LIMITS,
    CLOSED_DAYS,
    isValidTimeSlot,
    isValidBookingStatus,
    isValidServiceTier,
    isValidRole,
    isClosedDay
};