import { useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import toast from 'react-hot-toast';

export const useBookingSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('booking:new', (data) => {
            toast.success(`New booking: ${data.bookingCode}`, {
                icon: '📅',
                duration: 5000
            });
            callbacks.onNewBooking?.(data);
        });

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

        socket.on('booking:cancelled', (data) => {
            toast(`Booking ${data.bookingCode} cancelled`, {
                icon: '❌',
                duration: 4000
            });
            callbacks.onCancelled?.(data);
        });

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

export const useCategorySocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('category:created', (data) => {
            toast.success(`New category: ${data.name}`, {
                icon: '📁',
                duration: 4000
            });
            callbacks.onCreated?.(data);
        });

        socket.on('category:updated', (data) => {
            callbacks.onUpdated?.(data);
        });

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

export const useSubcategorySocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('subcategory:created', (data) => {
            toast.success(`New subcategory: ${data.name}`, {
                icon: '📂',
                duration: 4000
            });
            callbacks.onCreated?.(data);
        });

        socket.on('subcategory:updated', (data) => {
            callbacks.onUpdated?.(data);
        });

        socket.on('subcategory:deleted', (data) => {
            toast(`Subcategory deleted: ${data.name}`, {
                icon: '🗑️',
                duration: 4000
            });
            callbacks.onDeleted?.(data);
        });

        return () => {
            socket.off('subcategory:created');
            socket.off('subcategory:updated');
            socket.off('subcategory:deleted');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

export const useServiceSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('service:created', (data) => {
            toast.success(`New service: ${data.name}`, {
                icon: '🆕',
                duration: 4000
            });
            callbacks.onCreated?.(data);
        });

        socket.on('service:updated', (data) => {
            callbacks.onUpdated?.(data);
        });

        socket.on('service:deleted', (data) => {
            toast(`Service deleted: ${data.name}`, {
                icon: '🗑️',
                duration: 4000
            });
            callbacks.onDeleted?.(data);
        });

        return () => {
            socket.off('service:created');
            socket.off('service:updated');
            socket.off('service:deleted');
        };
    }, [socket, isConnected, callbacks]);

    return { isConnected };
};

export const useReviewSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

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

export const useUserSocket = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

        socket.on('user:blocked', (data) => {
            toast.error(`Account blocked: ${data.reason}`, {
                duration: 10000
            });
            callbacks.onBlocked?.(data);
        });

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

export const useAdminNotifications = (callbacks = {}) => {
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!socket || !isConnected) return;

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
    useSubcategorySocket,
    useReviewSocket,
    useUserSocket,
    useAdminNotifications
};