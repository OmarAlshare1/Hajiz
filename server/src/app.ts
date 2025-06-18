import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import providerRoutes from './routes/provider.routes';
import appointmentRoutes from './routes/appointment.routes';
import searchRoutes from './routes/search.routes';
import {
  limiter,
  authLimiter,
  sanitizeData,
  preventXss,
  preventParamPollution,
  securityHeaders,
  requestSizeLimiter,
  validateContentType,
  errorHandler
} from './middleware/security';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeData);
app.use(preventXss);
app.use(preventParamPollution);
app.use(securityHeaders);
app.use(requestSizeLimiter);
app.use(validateContentType);
app.use(limiter);

// Apply stricter rate limiting to auth routes
app.use('/auth', authLimiter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search', searchRoutes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Hajiz API' });
  return;
});

// Error handling middleware
app.use(errorHandler);

export default app; 