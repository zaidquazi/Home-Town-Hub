import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import passport from 'passport';
import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler, AppError } from './middlewares/error-handler.middleware';
import { initSocket } from './socket';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Connect to Database
connectDB();

// Setup Socket.IO
const io = initSocket(httpServer);

app.set('io', io); // Make io available in routes via req.app.get('io')

// Global Middlewares

// Security HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://maps.gstatic.com", "https://maps.googleapis.com"],
      connectSrc: ["'self'", env.FRONTEND_URL || "http://localhost:3000", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://res.cloudinary.com"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (origin === env.FRONTEND_URL || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting: 100 requests per 15 mins in production, 5000 in development
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Development logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

import './config/passport';

// Passport initialization
app.use(passport.initialize());

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import communityRoutes from './routes/community.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import eventRoutes from './routes/event.routes';
import adminRoutes from './routes/admin.routes';
import moderatorRoutes from './routes/moderator.routes';
import analyticsRoutes from './routes/analytics.routes';
import notificationRoutes from './routes/notification.routes';
import searchRoutes from './routes/search.routes';
import chatRoutes from './routes/chat.routes';
import uploadRoutes from './routes/upload.routes';

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/moderation', moderatorRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/upload', uploadRoutes);

import mongoose from 'mongoose';

app.get('/health', (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  if (!isDbConnected) {
    return res.status(503).json({
      status: 'error',
      message: 'Service Unavailable: Database disconnected',
      dbState: mongoose.connection.readyState
    });
  }
  res.status(200).json({ 
    status: 'success', 
    message: 'Server is healthy',
    dbState: 'connected'
  });
});

// Handle unhandled routes
app.all('*', (req: Request, res: Response, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(errorHandler);

const PORT = env.PORT || 5000;

const server = httpServer.listen(PORT, () => {
  console.log(`✅ Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err: any) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;
