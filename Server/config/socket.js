// config/socket.js

import { Server } from 'socket.io';

let io = null;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
                process.env.FRONTEND_URL,
                process.env.ADMIN_URL
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);

        // Join rooms based on user role
        socket.on('join', ({ userId, role }) => {
            // Join user-specific room
            socket.join(`user:${userId}`);
            console.log(`👤 User ${userId} joined their room`);

            // Join admin room if admin
            if (role === 'admin') {
                socket.join('admins');
                console.log(`👑 Admin ${userId} joined admin room`);
            }
        });

        // Leave rooms
        socket.on('leave', ({ userId }) => {
            socket.leave(`user:${userId}`);
            socket.leave('admins');
            console.log(`👋 User ${userId} left rooms`);
        });

        socket.on('disconnect', (reason) => {
            console.log(`❌ Socket disconnected: ${socket.id} - ${reason}`);
        });

        socket.on('error', (error) => {
            console.error(`⚠️ Socket error: ${error.message}`);
        });
    });

    console.log('✅ Socket.IO initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        console.warn('⚠️ Socket.IO not initialized');
        return null;
    }
    return io;
};

export default { initSocket, getIO };