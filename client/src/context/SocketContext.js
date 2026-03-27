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

    // ✅ Event listeners registry
    const listenersRef = useRef({
        booking: new Set(),
        slot: new Set(),
        service: new Set(),
        category: new Set(),        // 🔥 ADDED
        subcategory: new Set(),     // 🔥 ADDED
        dashboard: new Set(),
        user: new Set()
    });

    // ============================================
    // SOCKET CONNECTION
    // ============================================
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

        console.log('🔌 Connecting to socket:', socketUrl);

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
            console.log('✅ Socket connected:', socketInstance.id);
            setIsConnected(true);

            // Join admin room
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
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);

            if (reason === 'io server disconnect') {
                socketInstance.connect();
            }
        });

        socketInstance.on('connect_error', (error) => {
            console.error('⚠️ Socket connection error:', error.message);
            setIsConnected(false);
        });

        socketInstance.on('reconnect', (attemptNumber) => {
            console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
            toast.success('Reconnected to server', {
                duration: 2000,
                icon: '🔌'
            });
        });

        // ============================================
        // 🔥 USER EVENTS (CRITICAL)
        // ============================================
        socketInstance.on('user:blocked', (data) => {
            console.log('🚫 User blocked:', data);

            toast.error(`Your account has been blocked: ${data.reason}`, {
                duration: 10000
            });

            setTimeout(() => {
                logout();
                router.push('/admin/login');
            }, 2000);
        });

        socketInstance.on('user:roleChanged', (data) => {
            console.log('👤 Role changed:', data);

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

        // ============================================
        // 🔥 BOOKING EVENTS
        // ============================================
        socketInstance.on('booking:new', (data) => {
            console.log('📋 New booking:', data);

            toast.success(
                `New booking: ${data.serviceName} - ${data.bookingCode}`,
                { duration: 5000, icon: '🎉' }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'new', data });
            });
        });

        socketInstance.on('booking:statusUpdated', (data) => {
            console.log('📋 Booking status updated:', data);

            toast.info(
                `Booking ${data.bookingCode} → ${data.status}`,
                { duration: 4000 }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'statusUpdated', data });
            });
        });

        socketInstance.on('booking:cancelled', (data) => {
            console.log('❌ Booking cancelled:', data);

            toast.error(
                `Booking ${data.bookingCode} cancelled`,
                { duration: 4000 }
            );

            listenersRef.current.booking.forEach(callback => {
                callback({ type: 'cancelled', data });
            });
        });

        // ============================================
        // 🔥 SLOT AVAILABILITY EVENTS
        // ============================================
        socketInstance.on('slot:booked', (data) => {
            console.log('📅 Slot booked:', data);

            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'booked', data });
            });
        });

        socketInstance.on('slot:available', (data) => {
            console.log('📅 Slot available:', data);

            listenersRef.current.slot.forEach(callback => {
                callback({ type: 'available', data });
            });
        });

        // ============================================
        // 🔥 SERVICE EVENTS
        // ============================================
        socketInstance.on('service:created', (data) => {
            console.log('🛠️ Service created:', data);

            toast.success(`New service: ${data.name}`, {
                duration: 4000,
                icon: '✨'
            });

            listenersRef.current.service.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('service:updated', (data) => {
            console.log('🛠️ Service updated:', data);

            listenersRef.current.service.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('service:deleted', (data) => {
            console.log('🛠️ Service deleted:', data);

            toast.info(`Service deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.service.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        // ============================================
        // 🔥 CATEGORY EVENTS - ADDED
        // ============================================
        socketInstance.on('category:created', (data) => {
            console.log('📁 Category created:', data);

            toast.success(`New category: ${data.name}`, {
                duration: 4000,
                icon: '📁'
            });

            listenersRef.current.category.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('category:updated', (data) => {
            console.log('📁 Category updated:', data);

            listenersRef.current.category.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('category:deleted', (data) => {
            console.log('📁 Category deleted:', data);

            toast.info(`Category deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.category.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        // ============================================
        // 🔥 SUBCATEGORY EVENTS - ADDED
        // ============================================
        socketInstance.on('subcategory:created', (data) => {
            console.log('📂 Subcategory created:', data);

            toast.success(`New subcategory: ${data.name}`, {
                duration: 4000,
                icon: '📂'
            });

            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'created', data });
            });
        });

        socketInstance.on('subcategory:updated', (data) => {
            console.log('📂 Subcategory updated:', data);

            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'updated', data });
            });
        });

        socketInstance.on('subcategory:deleted', (data) => {
            console.log('📂 Subcategory deleted:', data);

            toast.info(`Subcategory deleted: ${data.name}`, {
                duration: 4000
            });

            listenersRef.current.subcategory.forEach(callback => {
                callback({ type: 'deleted', data });
            });
        });

        // ============================================
        // 🔥 DASHBOARD EVENTS
        // ============================================
        socketInstance.on('dashboard:updated', (data) => {
            console.log('📊 Dashboard updated:', data);

            listenersRef.current.dashboard.forEach(callback => {
                callback(data);
            });
        });

        setSocket(socketInstance);

        return () => {
            console.log('🔌 Disconnecting socket...');
            socketInstance.emit('leave', { userId: user._id });
            socketInstance.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [isAuthenticated, user, logout, router]);

    // ============================================
    // 🔥 SUBSCRIBE TO BOOKING EVENTS
    // ============================================
    const onBookingEvent = useCallback((callback) => {
        listenersRef.current.booking.add(callback);

        return () => {
            listenersRef.current.booking.delete(callback);
        };
    }, []);

    // ============================================
    // 🔥 SUBSCRIBE TO SLOT EVENTS
    // ============================================
    const onSlotEvent = useCallback((callback) => {
        listenersRef.current.slot.add(callback);

        return () => {
            listenersRef.current.slot.delete(callback);
        };
    }, []);

    // ============================================
    // 🔥 SUBSCRIBE TO SERVICE EVENTS
    // ============================================
    const onServiceEvent = useCallback((callback) => {
        listenersRef.current.service.add(callback);

        return () => {
            listenersRef.current.service.delete(callback);
        };
    }, []);

    // ============================================
    // 🔥 SUBSCRIBE TO CATEGORY EVENTS - ADDED
    // ============================================
    const onCategoryEvent = useCallback((callback) => {
        listenersRef.current.category.add(callback);

        return () => {
            listenersRef.current.category.delete(callback);
        };
    }, []);

    // ============================================
    // 🔥 SUBSCRIBE TO SUBCATEGORY EVENTS - ADDED
    // ============================================
    const onSubcategoryEvent = useCallback((callback) => {
        listenersRef.current.subcategory.add(callback);

        return () => {
            listenersRef.current.subcategory.delete(callback);
        };
    }, []);

    // ============================================
    // 🔥 SUBSCRIBE TO DASHBOARD EVENTS
    // ============================================
    const onDashboardUpdate = useCallback((callback) => {
        listenersRef.current.dashboard.add(callback);

        return () => {
            listenersRef.current.dashboard.delete(callback);
        };
    }, []);

    // ============================================
    // GENERIC EMIT/ON/OFF
    // ============================================
    const emit = useCallback((event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('⚠️ Socket not connected, cannot emit:', event);
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
            // 🔥 High-level event subscriptions
            onBookingEvent,
            onSlotEvent,
            onServiceEvent,
            onCategoryEvent,        // 🔥 ADDED
            onSubcategoryEvent,     // 🔥 ADDED
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