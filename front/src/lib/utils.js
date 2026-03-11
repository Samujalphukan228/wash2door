// src/lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';

/**
 * Merge class names with Tailwind CSS
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format price in INR
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Format date
 */
export function formatDate(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM dd, yyyy');
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
}

/**
 * Format time ago
 */
export function formatTimeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format time slot
 */
export function formatTimeSlot(slot) {
  const [start, end] = slot.split('-');
  const formatTime = (time) => {
    const [hours] = time.split(':');
    const h = parseInt(hours);
    return h >= 12 ? `${h === 12 ? 12 : h - 12} PM` : `${h} AM`;
  };
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Get initials from name
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Check if booking can be cancelled
 */
export function isBookingCancellable(booking) {
  if (!['pending', 'confirmed'].includes(booking.status)) return false;
  
  const bookingDateTime = new Date(booking.bookingDate);
  const [startHour] = booking.timeSlot.split('-')[0].split(':');
  bookingDateTime.setHours(parseInt(startHour), 0, 0, 0);
  
  const twoHoursBefore = new Date(bookingDateTime.getTime() - 2 * 60 * 60 * 1000);
  return new Date() < twoHoursBefore;
}

/**
 * Get status color classes
 */
export function getStatusColor(status) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get category color
 */
export function getCategoryColor(category) {
  const colors = {
    basic: 'bg-blue-500',
    standard: 'bg-green-500',
    premium: 'bg-purple-500',
  };
  return colors[category] || 'bg-gray-500';
}

/**
 * Get category badge variant
 */
export function getCategoryVariant(category) {
  const variants = {
    basic: 'basic',
    standard: 'standard',
    premium: 'premium',
  };
  return variants[category] || 'default';
}

/**
 * Truncate text
 */
export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get error message from error object
 */
export function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if date is in the past
 */
export function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) < today;
}

/**
 * Check if it's Sunday
 */
export function isSunday(date) {
  return new Date(date).getDay() === 0;
}

/**
 * Generate array of dates for next N days
 */
export function getNextDays(count = 30) {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}