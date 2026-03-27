'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const UserSocketContext = createContext(null);

export const UserSocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    // Event listeners registry
    const listenersRef = useRef({
        booking: new Set(),
        slot: new Set(),
    });

    // ============================================
    // SOCKET CONNECTION
    // ============================================
    useEffect(() => {
        // Only connect if user is logged in and is a regular user (not admin)
        if (!isAuthenticated || !user || user.role === 'admin') {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

        console.log('🔌 [User] Connecting to socket:', socketUrl);

        const socketInstance = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            auth: {
                userId: user._id,
                role: user.role
            }
        });

        // ============================================
        // CONNECTION EVENTS
        // ============================================
        socketInstance.on('connect', () => {
            console.log('✅ [User] Socket connected:', socketInstance.id);
            setIsConnected(true);

            // Join user-specific room so backend can target this user
            socketInstance.emit('join', {
                userId: user._id,
                role: user.role
            });
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ [User] Socket disconnected:', reason);
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                socketInstance.connect();
            }
        });

        socketInstance.on('connect_error', (error) => {
            console.error('⚠️ [User] Socket connection error:', error.message);
            setIsConnected(false);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log('🔄 [User] Socket reconnected after', attemptNumber, 'attempts');
        });

        // ============================================
        // USER EVENTS
        // ============================================

        // Force logout if admin blocks the user
        socketInstance.on('user:blocked', (data) => {
            console.log('🚫 [User] Account blocked:', data);

            toast.error(`Your account has been blocked. Reason: ${data.reason}`, {
                duration: 8000
            });

            setTimeout(async () => {
                await logout();
                router.push('/');
            }, 2000);
        });

        // Handle role change (e.g. promoted to admin)
        socketInstance.on('user:roleChanged', (data) => {
            console.log('👤 [User] Role changed:', data);

            if (data.newRole === 'admin') {
                toast.success('You have been promoted to admin! Please log in again.', {
                    duration: 6000
                });
            } else {
                toast.info(`Your role has been updated to ${data.newRole}.`, {
                    duration: 5000
                });
            }

            setTimeout(async () => {
                await logout();
                router.push('/');
            }, 3000);
        });

        // ============================================
        // BOOKING EVENTS
        // ============================================

        // Admin updated booking status (confirmed, in-progress, completed, cancelled)
        socketInstance.on('booking:statusUpdated', (data) => {
            console.log('📋 [User] Booking status updated:', data);

            const statusMessages = {
                confirmed: { msg: `Your booking ${data.bookingCode} has been confirmed! ✅`, type: 'success' },
                'in-progress': { msg: `Your service for ${data.bookingCode} is now in progress.`, type: 'info' },
                completed: { msg: `Your booking ${data.bookingCode} is completed. Please leave a review!`, type: 'success' },
                cancelled: { msg: `Your booking ${data.bookingCode} was cancelled.`, type: 'error' },
            };

            const message = statusMessages[data.status];
            if (message) {
                if (message.type === 'success') toast.success(message.msg, { duration: 6000 });
                else if (message.type === 'error') toast.error(message.msg, { duration: 6000 });
                else toast(message.msg, { duration: 5000 });
            }

            // Notify all booking listeners (e.g. bookings page can refetch)
            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'statusUpdated', data });
            });
        });

        // Admin cancelled the booking
        socketInstance.on('booking:cancelled', (data) => {
            console.log('❌ [User] Booking cancelled:', data);

            toast.error(
                `Your booking ${data.bookingCode} has been cancelled by admin.`,
                { duration: 6000 }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'cancelled', data });
            });
        });

        // ============================================
        // SLOT AVAILABILITY EVENTS
        // These are broadcast to ALL clients (including unauthenticated)
        // so booking page shows live slot updates
        // ============================================

        // A slot just got booked — remove it from UI
        socketInstance.on('slot:booked', (data) => {
            console.log('📅 [User] Slot booked:', data);

            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'booked', data });
            });
        });

        // A slot just became available — add it back to UI
        socketInstance.on('slot:available', (data) => {
            console.log('📅 [User] Slot available:', data);

            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'available', data });
            });
        });

        setSocket(socketInstance);

        return () => {
            console.log('🔌 [User] Disconnecting socket...');
            socketInstance.emit('leave', { userId: user._id });
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user, logout, router]);

    // ============================================
    // SUBSCRIBE TO BOOKING EVENTS
    // Usage: const unsub = onBookingEvent((event) => { ... })
    // event.type = 'statusUpdated' | 'cancelled'
    // event.data = booking payload
    // ============================================
    const onBookingEvent = useCallback((callback) => {
        listenersRef.current.booking.add(callback);
        return () => {
            listenersRef.current.booking.delete(callback);
        };
    }, []);

    // ============================================
    // SUBSCRIBE TO SLOT EVENTS
    // Usage: const unsub = onSlotEvent((event) => { ... })
    // event.type = 'booked' | 'available'
    // event.data = { date, timeSlot, serviceId, available }
    // ============================================
    const onSlotEvent = useCallback((callback) => {
        listenersRef.current.slot.add(callback);
        return () => {
            listenersRef.current.slot.delete(callback);
        };
    }, []);

    // Generic emit/on/off for custom use
    const emit = useCallback((event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('⚠️ [User] Socket not connected, cannot emit:', event);
        }
    }, [socket, isConnected]);

    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => {};
    }, [socket]);

    const off = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    return (
        <UserSocketContext.Provider value={{
            socket,
            isConnected,
            emit,
            on,
            off,
            onBookingEvent,
            onSlotEvent,
        }}>
            {children}
        </UserSocketContext.Provider>
    );
};

export const useUserSocket = () => {
    const context = useContext(UserSocketContext);
    if (!context) {
        throw new Error('useUserSocket must be used within UserSocketProvider');
    }
    return context;
};

export default UserSocketContext;