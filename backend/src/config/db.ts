import mongoose from 'mongoose';
import { env } from './env.js';
import dns from 'node:dns'


export const connectDB = async (): Promise<void> => {
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        await mongoose.connect(env.MONGODB_URI);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);

        process.exit(1);
    }
}