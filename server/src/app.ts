// Path: server/src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import * as xss from 'xss-clean';
import * as hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.routes';
import providerRoutes from './routes/provider.routes';
import appointmentRoutes from './routes/appointment.routes';
import searchRoutes from './routes/search.routes';
import { // Ensure all security middleware are correctly imported and used
  limiter,
  authLimiter,
  sanitizeData,
  preventXss, // Now used as xss.default()
  preventParamPollution, // Now used as hpp.default()
  securityHeaders,
  requestSizeLimiter,
  validateContentType,
  errorHandler
} from './middleware/security';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware - Apply these early
app.use(helmet());

// FIX: Correct CORS configuration for 'credentials: true'
app.use(cors({
  origin: (origin, callback) => {
    // Define allowed origins for production/development
    const allowedOrigins = [
      process.env.CORS_ORIGIN_FRONTEND || 'http://localhost:3004', // Your frontend local dev URL
      'http://localhost:3000', // Common Next.js dev URL
      'https://www.hajiz.co.uk', // Your deployed frontend domain
      'https://hajiz-tvi6d9b95k-omars-projects-ce6be162.vercel.app' // Your specific Vercel frontend URL
      // Add other specific Vercel preview URLs if needed
    ];

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Ensure OPTIONS is allowed for preflight
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Keep this if you plan to use cookies/sessions later, or remove if only JWT in localStorage
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply security middleware from security.ts (ensure they handle req, res, next correctly)
app.use(sanitizeData);
app.use(preventXss); // Used as xss.default() in index.ts, check if security.ts exports function directly or instance
app.use(preventParamPollution); // Used as hpp.default()
app.use(securityHeaders); // Check if this is a function or an instance
app.use(requestSizeLimiter);
app.use(validateContentType);
app.use(limiter);

// Apply stricter rate limiting to auth routes
app.use('/api/auth', authLimiter); // Apply authLimiter to the /api/auth path

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Register your API Routes - Make sure these are placed AFTER all general middleware
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search', searchRoutes);

// Basic route
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Hajiz API' });
  return;
});

// Error handling middleware - This must be the last middleware
app.use(errorHandler);

// For Vercel serverless functions (ensure this is at the very bottom)
export default app;

// For local development (ensure this block is properly conditional)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}