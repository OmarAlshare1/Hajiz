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
import authRoutes from '../src/routes/auth.routes';
import providerRoutes from '../src/routes/provider.routes';
import appointmentRoutes from '../src/routes/appointment.routes';
import searchRoutes from '../src/routes/search.routes';

// Load env vars - THIS MUST BE AT THE VERY TOP, AFTER ALL IMPORTS
dotenv.config();

// Create Express app
const app = express();

// FIX: Implement a manual and explicit CORS preflight handler as the ABSOLUTE FIRST MIDDLEWARE.
// Ensure all code paths explicitly return or call next().
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN_FRONTEND || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Explicitly return
  }
  return next(); // FIX: Explicitly return next()
});

// FIX: Tell Express to trust proxy headers for accurate IP detection (Vercel, Nginx, etc.)
app.set('trust proxy', 1);

// Body parser - Apply after the global OPTIONS handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS - General CORS for all other requests (actual GET/POST/PUT etc.)
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN_FRONTEND || 'http://localhost:3004',
      'http://localhost:3000',
      'https://www.hajiz.co.uk',
      'https://hajiz-m2xrfwsqp-omars-projects-ce6be162.vercel.app',
      'https://hajiz-client.vercel.app',
      'https://hajiz.vercel.app',
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Set security headers
app.use(helmet());

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss.default());

// Prevent http param pollution
app.use(hpp.default());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Connect to MongoDB with proper timeout settings
const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000, // 45 seconds
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 30000
};

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz', mongoOptions)
  .then(() => {
    console.log('MongoDB Connected successfully');
    console.log('Connection state:', mongoose.connection.readyState);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Connection string:', process.env.MONGODB_URI ? 'URI provided' : 'Using default localhost');
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Register your API Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search', searchRoutes);

// Root Route (example)
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Hajiz API' });
  return;
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
  next(err);
});

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}