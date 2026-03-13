// src/context/SocketContext.js

'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback
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

    useEffect(() => {
        if (!isAuthenticated || !user) {
            // Disconnect if not authenticated
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
            reconnectionDelay: 1000
        });

        socketInstance.on('connect', () => {
            console.log('🔌 Socket connected:', socketInstance.id);
            setIsConnected(true);

            // Join rooms
            socketInstance.emit('join', {
                userId: user.id,
                role: user.role
            });
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('⚠️ Socket connection error:', error.message);
            setIsConnected(false);
        });

        // Handle user blocked - force logout
        socketInstance.on('user:blocked', (data) => {
            toast.error(`Your account has been blocked: ${data.reason}`, {
                duration: 10000
            });
            logout();
            router.push('/admin/login');
        });

        // Handle role change
        socketInstance.on('user:roleChanged', (data) => {
            if (data.newRole !== 'admin') {
                toast.error('Your admin access has been revoked');
                logout();
                router.push('/admin/login');
            }
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.emit('leave', { userId: user.id });
            socketInstance.disconnect();
        };
    }, [isAuthenticated, user, logout, router]);

    // Emit custom event
    const emit = useCallback((event, data) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        }
    }, [socket, isConnected]);

    // Subscribe to event
    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => {};
    }, [socket]);

    // Unsubscribe from event
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
            off
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