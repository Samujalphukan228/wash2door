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

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const listenersRef = useRef({
        booking: new Set(),
        slot: new Set(),
        service: new Set(),
        category: new Set(),
        subcategory: new Set(),
        dashboard: new Set(),
        user: new Set()
    });

    useEffect(() => {
        if (!isAuthenticated || !user) {
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

            toast.success('Real-time connected', {
                duration: 2000,
                icon: '🔌'
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

        socketInstance.on('reconnect', (attemptNumber) => {
            toast.success('Reconnected to server', {
                duration: 2000,
                icon: '🔌'
            });
        });

        socketInstance.on('user:blocked', (data) => {
            toast.error(`Your account has been blocked: ${data.reason}`, {
                duration: 10000
            });

            setTimeout(() => {
                logout();
                router.push('/admin/login');
            }, 2000);
        });

        socketInstance.on('user:roleChanged', (data) => {
            if (data.newRole !== 'admin') {
                toast.error('Your admin access has been revoked', {
                    duration: 10000
                });

                setTimeout(() => {
                    logout();
                    router.push('/admin/login');
                }, 2000);
            } else {
                toast.success(`Your role has been changed to ${data.newRole}`);
            }
        });

        socketInstance.on('booking:new', (data) => {
            toast.success(
                `New booking: ${data.serviceName} - ${data.bookingCode}`,
                { duration: 5000, icon: '🎉' }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'new', data });
            });
        });

        socketInstance.on('booking:statusUpdated', (data) => {
            toast.info(
                `Booking ${data.bookingCode} → ${data.status}`,
                { duration: 4000 }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'statusUpdated', data });
            });
        });

        socketInstance.on('booking:cancelled', (data) => {
            toast.error(
                `Booking ${data.bookingCode} cancelled`,
                { duration: 4000 }
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

        socketInstance.on('service:created', (data) => {
            toast.success(`New service: ${data.name}`, {
                duration: 4000,
                icon: '✨'
            });

            listenersRef.current.service.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('service:updated', (data) => {
            listenersRef.current.service.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('service:deleted', (data) => {
            toast.info(`Service deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.service.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        socketInstance.on('category:created', (data) => {
            toast.success(`New category: ${data.name}`, {
                duration: 4000,
                icon: '📁'
            });

            listenersRef.current.category.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('category:updated', (data) => {
            listenersRef.current.category.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('category:deleted', (data) => {
            toast.info(`Category deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.category.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        socketInstance.on('subcategory:created', (data) => {
            toast.success(`New subcategory: ${data.name}`, {
                duration: 4000,
                icon: '📂'
            });

            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('subcategory:updated', (data) => {
            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('subcategory:deleted', (data) => {
            toast.info(`Subcategory deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        socketInstance.on('dashboard:updated', (data) => {
            listenersRef.current.dashboard.forEach(callback => {
                callback(data);
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

    const onServiceEvent = useCallback((callback) => {
        listenersRef.current.service.add(callback);

        return () => {
            listenersRef.current.service.delete(callback);
        };
    }, []);

    const onCategoryEvent = useCallback((callback) => {
        listenersRef.current.category.add(callback);

        return () => {
            listenersRef.current.category.delete(callback);
        };
    }, []);

    const onSubcategoryEvent = useCallback((callback) => {
        listenersRef.current.subcategory.add(callback);

        return () => {
            listenersRef.current.subcategory.delete(callback);
        };
    }, []);

    const onDashboardUpdate = useCallback((callback) => {
        listenersRef.current.dashboard.add(callback);

        return () => {
            listenersRef.current.dashboard.delete(callback);
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
        <SocketContext.Provider value={{
            socket,
            isConnected,
            emit,
            on,
            off,
            onBookingEvent,
            onSlotEvent,
            onServiceEvent,
            onCategoryEvent,
            onSubcategoryEvent,
            onDashboardUpdate
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export default SocketContext;