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

// Load env vars - THIS MUST BE AT THE VERY TOP, AFTER ALL IMPORTS
dotenv.config();

// Create Express app
const app = express();

// FIX: Handle OPTIONS preflight requests very early in the middleware chain
// This ensures CORS preflight requests are handled BEFORE any authentication or other middleware.
app.options('/api/auth/*', cors()); // Specific to auth routes for now, can be broadened later if needed

// Body parser - Apply before any other middleware that reads req.body
app.use(express.json());

// Enable CORS - General CORS for all other requests
// Note: The app.options above handles the preflight for /api/auth/* routes explicitly.
app.use(cors()); // This general CORS middleware will apply to actual GET/POST requests too

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

// Register your API Routes - Apply after general middleware
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