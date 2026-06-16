import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
  try {
    // Event listeners for connection monitoring
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB successfully connected to Atlas');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected! Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

    // Production-grade connection options
    const conn = await mongoose.connect(env.MONGODB_URI, {
      dbName: process.env.DATABASE_NAME || 'hometown-hub',
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 50, // Maintain up to 50 socket connections
      autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production automatically
    });

    console.log(`✅ MongoDB Initial Connection Established: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ FATAL: MongoDB Initial Connection Failed:', error);
    process.exit(1);
  }
};
