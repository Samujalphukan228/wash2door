// config/socket.js - FIXED

import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ Socket connected: ${socket.id}`);

        // ============================================
        // JOIN ROOMS
        // ============================================

        // Customer joins their own room
        socket.on('join', ({ userId, role }) => {
            if (userId) {
                socket.join(`user_${userId}`);
                console.log(`👤 User ${userId} joined their room`);
            }

            // Admin joins admin room
            if (role === 'admin') {
                socket.join('admin_room');
                console.log(`👑 Admin joined admin room`);
            }
        });

        // ============================================
        // DISCONNECT
        // ============================================
        socket.on('disconnect', () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
        });
    });

    console.log('🔌 Socket.io initialized');
    return io;
};

// Get io instance anywhere in the app
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export default { initSocket, getIO };