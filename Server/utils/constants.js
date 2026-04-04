// utils/constants.js

// ============================================
// HELPER: Convert 12-hour format to 24-hour for calculations
// ============================================
// ⭐ MOVE THESE FUNCTIONS TO THE TOP
export const convertTimeTo24 = (time12) => {
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const convertTo24Hour = (slot12) => {
    const [startPart, endPart] = slot12.split('-');
    const start = convertTimeTo24(startPart.trim());
    const end = convertTimeTo24(endPart.trim());
    return { start, end };
};

// ============================================
// TIME SLOTS - REGULAR (Available to all users)
// ============================================
export const TIME_SLOTS = [
    '08:30 AM-10:30 AM',
    '10:30 AM-12:00 PM',
    '12:00 PM-02:30 PM',
    '02:30 PM-04:00 PM',
    '04:00 PM-05:30 PM',
];

// ============================================
// ADMIN-ONLY EXTRA SLOTS (Up to 10 PM)
// ============================================
export const ADMIN_ONLY_SLOTS = [  
    '05:30 PM-07:00 PM',   // Evening slot
    '07:00 PM-08:30 PM',   // Late evening slot
    '08:30 PM-10:00 PM',   // Night slot
];

// ============================================
// ALL SLOTS (Regular + Admin-only)
// ============================================
export const ALL_TIME_SLOTS = [...TIME_SLOTS, ...ADMIN_ONLY_SLOTS].sort((a, b) => {
    const timeA = convertTimeTo24(a.split('-')[0].trim());
    const timeB = convertTimeTo24(b.split('-')[0].trim());
    return timeA.localeCompare(timeB);
});

// ============================================
// BOOKING STATUSES
// ============================================
export const BOOKING_STATUSES = [
    'pending',
    'confirmed',
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
export const isValidAdminSlot = (slot) => ADMIN_ONLY_SLOTS.includes(slot);
export const isValidAnySlot = (slot) => ALL_TIME_SLOTS.includes(slot);
export const isAdminOnlySlot = (slot) => ADMIN_ONLY_SLOTS.includes(slot);
export const isValidBookingStatus = (status) => BOOKING_STATUSES.includes(status);
export const isValidServiceTier = (tier) => SERVICE_TIERS.includes(tier);
export const isValidRole = (role) => USER_ROLES.includes(role);

// ============================================
// GET SLOTS BASED ON USER ROLE
// ============================================
export const getSlotsForRole = (isAdmin = false) => {
    return isAdmin ? ALL_TIME_SLOTS : TIME_SLOTS;
};

// ============================================
// LIMITS
// ============================================
export const LIMITS = {
    MAX_ACTIVE_BOOKINGS_PER_USER: 3,
    MAX_BOOKING_ADVANCE_DAYS: 90,
    MIN_CANCEL_HOURS_BEFORE: 2,
    MIN_BOOKING_BUFFER_MINUTES: 30,
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
export const CLOSED_DAYS = [1]; // 1 = Monday

export const CLOSED_DAY_MESSAGE = 'We are closed on Mondays';

export const isClosedDay = (date) => {
    const day = new Date(date).getDay();
    return CLOSED_DAYS.includes(day);
};

export const getClosedDayNames = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return CLOSED_DAYS.map(day => dayNames[day]);
};

export default {
    TIME_SLOTS,
    ADMIN_ONLY_SLOTS,
    ALL_TIME_SLOTS,
    BOOKING_STATUSES,
    USER_ROLES,
    SERVICE_TIERS,
    PAYMENT_METHODS,
    PAYMENT_STATUSES,
    BOOKING_TYPES,
    REGISTRATION_STATUSES,
    LIMITS,
    CLOSED_DAYS,
    CLOSED_DAY_MESSAGE,
    isValidTimeSlot,
    isValidAdminSlot,
    isValidAnySlot,
    isAdminOnlySlot,
    isValidBookingStatus,
    isValidServiceTier,
    isValidRole,
    isClosedDay,
    getClosedDayNames,
    getSlotsForRole,
    convertTo24Hour,
    convertTimeTo24
};