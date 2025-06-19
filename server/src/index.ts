// Path: server/src/index.ts

import express from 'express';
import cors from 'cors'; // Import cors
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

// Load env vars - THIS MUST BE AT THE VERY TOP, AFTER ALL IMPORTS
dotenv.config();

// Create Express app
const app = express();

// FIX: Global CORS preflight handler - MUST BE THE FIRST MIDDLEWARE after app creation.
// This ensures the Access-Control-Allow-Origin header is always sent for OPTIONS requests.
app.options('*', cors());

// Body parser - Apply after the global OPTIONS handler
app.use(express.json()); // Parses application/json
app.use(express.urlencoded({ extended: true })); // Parses application/x-www-form-urlencoded

// Enable CORS for all actual requests (GET, POST, etc.)
// The app.options('*', cors()) handles the preflight, this handles actual requests.
// Make sure your CORS options are consistent.
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CORS_ORIGIN_FRONTEND || 'http://localhost:3004', // Frontend local dev URL
      'http://localhost:3000', // Common Next.js dev URL
      'https://www.hajiz.co.uk', // Deployed frontend domain
      'https://hajiz-m2xrfwsqp-omars-projects-ce6be162.vercel.app', // Your specific Vercel frontend URL
      'https://hajiz-tvi6d9b95k-omars-projects-ce6be162.vercel.app', // Another example if you have multiple frontend deployments
      // Add other specific Vercel preview URLs if needed
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // OPTIONS is handled by app.options('*', cors())
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register your API Routes - Apply after all general middleware
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search', searchRoutes);

// Root Route (example)
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Hajiz API' });
  return;
});

// Error handling middleware - This must be the last middleware
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