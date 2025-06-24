// Path: server/src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
// Note: xss-clean and hpp are imported from security middleware
// rateLimit is imported from security middleware
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.routes';
import providerRoutes from './routes/provider.routes';
import appointmentRoutes from './routes/appointment.routes';
import searchRoutes from './routes/search.routes';
import uploadRoutes from './routes/upload.routes';
import { // Ensure all security middleware are correctly imported and used
  limiter,
  authLimiter,
  preventXss, // Re-check how this is exported/used from security.ts if issues occur
  preventParamPollution, // Re-check how this is exported/used from security.ts if issues occur
  securityHeaders,
  requestSizeLimiter,
  validateContentType,
  errorHandler
} from './middleware/security';

// Load environment variables from .env file
dotenv.config();

// Create Express app instance
const app = express();

// --- Security Middleware (Apply these early in the middleware chain) ---

// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet());

// CORS Configuration: Crucial for allowing cross-origin requests from your frontend
app.use(cors({
  origin: (origin, callback) => {
    // Define all explicitly allowed origins for your frontend application(s)
    const allowedOrigins = [
      // Frontend Local Development URLs
      'http://localhost:3000', // Common Next.js dev URL
      'http://localhost:3001', // Another common local dev port
      'http://localhost:3004', // Your specific local dev URL from .env or default

      // Your Deployed Frontend Domains
      'https://www.hajiz.co.uk', // Your primary deployed domain
      'https://hajiz-tvi6d9b95k-omars-projects-ce6be162.vercel.app', // An existing Vercel frontend URL
      'https://hajiz-ann7xz4y5-omars-projects-ce6be162.vercel.app', // Another existing Vercel frontend URL

      // FIX: Add the specific Vercel frontend URL that was causing the CORS error
      'https://krrwf4d-next-js-projects-online-n2.vercel.app',
      
      // Ensure process.env.CORS_ORIGIN_FRONTEND is also included if it's set in your .env
      ...(process.env.CORS_ORIGIN_FRONTEND ? [process.env.CORS_ORIGIN_FRONTEND] : []),
    ];

    // Check if the requesting origin is in the allowed list
    // Allow requests with no origin (e.g., from Postman, curl, or server-side requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      // Deny the request if the origin is not allowed
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    }
  },
  // Define the HTTP methods allowed for cross-origin requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // Define allowed headers that can be sent with cross-origin requests
  allowedHeaders: ['Content-Type', 'Authorization'],
  // Allow credentials (like cookies or HTTP authentication) to be sent with requests
  // Set to true if your frontend sends cookies/session tokens, false if only using stateless JWT in localStorage
  credentials: true
}));

// Express built-in middleware for parsing request bodies
// limit: '10mb' ensures that large payloads (e.g., for image uploads) are handled
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply additional security middleware from security.ts
// These should generally be applied after body parsers if they inspect body content
app.use(mongoSanitize()); // Prevent MongoDB operator injection
// Note: xss-clean and hpp are typically applied as functions
// If `preventXss` and `preventParamPollution` from `security.ts` wrap `xss()` and `hpp()`
// correctly, then this is fine. Otherwise, you might need:
// app.use(xss.default());
// app.use(hpp.default());
app.use(preventXss); // Assuming this is a middleware function
app.use(preventParamPollution); // Assuming this is a middleware function

app.use(securityHeaders);     // Custom security headers
app.use(requestSizeLimiter);  // Limit request body size
app.use(validateContentType); // Validate Content-Type header
app.use(limiter);             // General rate limiting

// Apply stricter rate limiting specifically to authentication routes
app.use('/api/auth', authLimiter);

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// --- API Routes ---
// Register your API Routes - Ensure these are placed AFTER all general middleware
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadRoutes);

// Basic root route for API status check
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Hajiz API' });
  return; // Explicit return is good practice
});

// --- Error Handling Middleware ---
// This must be the very last middleware in your Express application
app.use(errorHandler);

// --- Export the Express app for Vercel Serverless Functions ---
// Vercel requires the app instance to be exported as default
export default app;

// --- Local Development Server Start (Conditional) ---
// This block ensures the server only starts listening on a port
// when running in a non-production environment (e.g., development)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
