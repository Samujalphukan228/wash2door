// ============================================
// TIME SLOTS - 12 HOUR FORMAT
// ============================================
export const TIME_SLOTS = [
    '08:00 AM-09:00 AM',
    '09:00 AM-10:00 AM',
    '10:00 AM-11:00 AM',
    '11:00 AM-12:00 PM',
    '12:00 PM-01:00 PM',
    '01:00 PM-02:00 PM',
    '02:00 PM-03:00 PM',
    '03:00 PM-04:00 PM',
    '04:00 PM-05:00 PM',
    '05:00 PM-06:00 PM',
    '06:00 PM-07:00 PM',
    '07:00 PM-08:00 PM',
    '08:00 PM-09:00 PM',
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
// HELPER: Convert 12-hour format to 24-hour for calculations
// ============================================
export const convertTo24Hour = (slot12) => {
    // Input: "08:00 AM-09:00 AM" or "01:00 PM-02:00 PM"
    // Output: { start: "08:00", end: "09:00" }
    const [startPart, endPart] = slot12.split('-');
    const start = convertTimeTo24(startPart.trim());
    const end = convertTimeTo24(endPart.trim());
    return { start, end };
};

// Helper to convert single time
export const convertTimeTo24 = (time12) => {
    // Input: "08:00 AM" or "01:00 PM"
    // Output: "08:00" or "13:00"
    const [time, period] = time12.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

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
    isClosedDay,
    convertTo24Hour,
    convertTimeTo24
};