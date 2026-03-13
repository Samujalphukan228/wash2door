// src/hooks/useSocketEvents.js

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

// ============================================
// BOOKING SOCKET HOOK
// ============================================
export const useBookingSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // New booking created
        socket.on('booking:new', (data) => {
            toast.success(`New booking: ${data.bookingCode}`, {
                icon: '📅',
                duration: 5000
            });
            callbacks.onNewBooking?.(data);
        });

        // Booking status updated
        socket.on('booking:statusUpdated', (data) => {
            const statusEmojis = {
                confirmed: '✅',
                'in-progress': '🔄',
                completed: '🎉',
                cancelled: '❌'
            };
            toast(`Booking ${data.bookingCode}: ${data.status}`, {
                icon: statusEmojis[data.status] || '📋',
                duration: 4000
            });
            callbacks.onStatusUpdate?.(data);
        });

        // Booking cancelled
        socket.on('booking:cancelled', (data) => {
            toast(`Booking ${data.bookingCode} cancelled`, {
                icon: '❌',
                duration: 4000
            });
            callbacks.onCancelled?.(data);
        });

        // Slot freed up (from cancellation/reschedule)
        socket.on('booking:slotAvailable', (data) => {
            callbacks.onSlotAvailable?.(data);
        });

        return () => {
            socket.off('booking:new');
            socket.off('booking:statusUpdated');
            socket.off('booking:cancelled');
            socket.off('booking:slotAvailable');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

// ============================================
// SERVICE SOCKET HOOK
// ============================================
export const useServiceSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Service created
        socket.on('service:created', (data) => {
            toast.success(`New service: ${data.name}`, {
                icon: '🆕',
                duration: 4000
            });
            callbacks.onCreated?.(data);
        });

        // Service updated
        socket.on('service:updated', (data) => {
            callbacks.onUpdated?.(data);
        });

        // Service deleted
        socket.on('service:deleted', (data) => {
            toast(`Service deleted: ${data.name}`, {
                icon: '🗑️',
                duration: 4000
            });
            callbacks.onDeleted?.(data);
        });

        // Variant added
        socket.on('service:variantAdded', (data) => {
            callbacks.onVariantAdded?.(data);
        });

        // Variant updated
        socket.on('service:variantUpdated', (data) => {
            callbacks.onVariantUpdated?.(data);
        });

        // Variant deleted
        socket.on('service:variantDeleted', (data) => {
            callbacks.onVariantDeleted?.(data);
        });

        return () => {
            socket.off('service:created');
            socket.off('service:updated');
            socket.off('service:deleted');
            socket.off('service:variantAdded');
            socket.off('service:variantUpdated');
            socket.off('service:variantDeleted');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

// ============================================
// CATEGORY SOCKET HOOK
// ============================================
export const useCategorySocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Category created
        socket.on('category:created', (data) => {
            toast.success(`New category: ${data.name}`, {
                icon: '📁',
                duration: 4000
            });
            callbacks.onCreated?.(data);
        });

        // Category updated
        socket.on('category:updated', (data) => {
            callbacks.onUpdated?.(data);
        });

        // Category deleted
        socket.on('category:deleted', (data) => {
            toast(`Category deleted: ${data.name}`, {
                icon: '🗑️',
                duration: 4000
            });
            callbacks.onDeleted?.(data);
        });

        return () => {
            socket.off('category:created');
            socket.off('category:updated');
            socket.off('category:deleted');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

// ============================================
// REVIEW SOCKET HOOK
// ============================================
export const useReviewSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // New review
        socket.on('review:new', (data) => {
            const stars = '⭐'.repeat(data.rating);
            toast(`New review: ${stars}`, {
                icon: '💬',
                duration: 5000
            });
            callbacks.onNewReview?.(data);
        });

        return () => {
            socket.off('review:new');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

// ============================================
// USER SOCKET HOOK (for blocked status)
// ============================================
export const useUserSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // User blocked - force logout
        socket.on('user:blocked', (data) => {
            toast.error(`Account blocked: ${data.reason}`, {
                duration: 10000
            });
            callbacks.onBlocked?.(data);
        });

        // User role changed
        socket.on('user:roleChanged', (data) => {
            callbacks.onRoleChanged?.(data);
        });

        return () => {
            socket.off('user:blocked');
            socket.off('user:roleChanged');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

// ============================================
// ADMIN NOTIFICATIONS HOOK (all events)
// ============================================
export const useAdminNotifications = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen to all admin-relevant events
        socket.on('booking:new', (data) => {
            toast(`New booking from ${data.customerName}`, {
                icon: '📅',
                duration: 5000
            });
            callbacks.onAnyEvent?.('booking:new', data);
        });

        socket.on('review:new', (data) => {
            toast(`New ${data.rating}★ review for ${data.serviceName}`, {
                icon: '⭐',
                duration: 5000
            });
            callbacks.onAnyEvent?.('review:new', data);
        });

        socket.on('booking:cancelled', (data) => {
            toast(`Booking ${data.bookingCode} cancelled`, {
                icon: '❌',
                duration: 4000
            });
            callbacks.onAnyEvent?.('booking:cancelled', data);
        });

        return () => {
            socket.off('booking:new');
            socket.off('review:new');
            socket.off('booking:cancelled');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

export default {
    useBookingSocket,
    useServiceSocket,
    useCategorySocket,
    useReviewSocket,
    useUserSocket,
    useAdminNotifications
};