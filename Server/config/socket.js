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
        socket.on('join', ({ userId, role }) => {
            socket.join(`user:${userId}`);
            if (role === 'admin') {
                socket.join('admins');
            }
        });

        socket.on('leave', ({ userId }) => {
            socket.leave(`user:${userId}`);
            socket.leave('admins');
        });

        socket.on('disconnect', () => {});
        socket.on('error', () => {});
    });

    return io;
};

export const getIO = () => {
    if (!io) return null;
    return io;
};

export default { initSocket, getIO };