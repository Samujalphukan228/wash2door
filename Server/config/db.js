// config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are default in Mongoose 6+
        });

        console.log(`
    ╔═══════════════════════════════════════════╗
    ║     📦 MongoDB Connected Successfully!    ║
    ╠═══════════════════════════════════════════╣
    ║  Host: ${conn.connection.host.padEnd(33)}║
    ║  DB:   ${conn.connection.name.padEnd(33)}║
    ╚═══════════════════════════════════════════╝
        `);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;