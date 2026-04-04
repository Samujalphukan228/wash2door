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

    const listenersRef = useRef({
        booking: new Set(),
        slot: new Set(),
    });

    useEffect(() => {
        if (!isAuthenticated || !user || user.role === 'admin') {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

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

        socketInstance.on('connect', () => {
            setIsConnected(true);

            socketInstance.emit('join', {
                userId: user._id,
                role: user.role
            });
        });

        socketInstance.on('disconnect', (reason) => {
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                socketInstance.connect();
            }
        });

        socketInstance.on('connect_error', () => {
            setIsConnected(false);
        });

        socketInstance.on('user:blocked', (data) => {
            toast.error(`Your account has been blocked. Reason: ${data.reason}`, {
                duration: 8000
            });

            setTimeout(async () => {
                await logout();
                router.push('/');
            }, 2000);
        });

        socketInstance.on('user:roleChanged', (data) => {
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

        socketInstance.on('booking:statusUpdated', (data) => {
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

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'statusUpdated', data });
            });
        });

        socketInstance.on('booking:cancelled', (data) => {
            toast.error(
                `Your booking ${data.bookingCode} has been cancelled by admin.`,
                { duration: 6000 }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'cancelled', data });
            });
        });

        socketInstance.on('slot:booked', (data) => {
            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'booked', data });
            });
        });

        socketInstance.on('slot:available', (data) => {
            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'available', data });
            });
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.emit('leave', { userId: user._id });
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user, logout, router]);

    const onBookingEvent = useCallback((callback) => {
        listenersRef.current.booking.add(callback);
        return () => {
            listenersRef.current.booking.delete(callback);
        };
    }, []);

    const onSlotEvent = useCallback((callback) => {
        listenersRef.current.slot.add(callback);
        return () => {
            listenersRef.current.slot.delete(callback);
        };
    }, []);

    const emit = useCallback((event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
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