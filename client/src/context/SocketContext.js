'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const socketInstance = io(
            process.env.NEXT_PUBLIC_SOCKET_URL
            || 'http://localhost:5000',
            {
                withCredentials: true,
                transports: ['websocket', 'polling']
            }
        );

        socketInstance.on('connect', () => {
            console.log('🔌 Socket connected');
            setIsConnected(true);

            socketInstance.emit('join', {
                userId: user.id,
                role: user.role
            });
        });

        socketInstance.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isAuthenticated, user]);

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error(
            'useSocket must be used within SocketProvider'
        );
    }
    return context;
};

export default SocketContext;