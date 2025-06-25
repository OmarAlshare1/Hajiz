# Hajiz Application Setup Guide

This guide will help you set up and run the Hajiz application with both client and server components properly connected.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

## Project Structure

```
Hajiz/
├── client/          # Next.js frontend application
├── server/          # Express.js backend API
├── SETUP.md         # This setup guide
└── README.md        # Project documentation
```

## Backend Setup (Server)

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/hajiz

# JWT Secret (generate a secure random string)
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=30d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

### 4. Start MongoDB
Ensure MongoDB is running on your system:
```bash
# For local MongoDB installation
mongod

# Or use MongoDB Compass/Atlas for cloud database
```

### 5. Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:5000`

## Frontend Setup (Client)

### 1. Navigate to Client Directory
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the example environment file and configure it:
```bash
cp .env.example .env.local
```

Edit `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# App Configuration
NEXT_PUBLIC_APP_NAME=Hajiz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the Client
```bash
# Development mode
npm run dev

# Or build for production
npm run build
npm start
```

The client will start on `http://localhost:3000`

## API Integration

The client and server are connected through:

### 1. API Base URL
- Configured in `client/.env.local` as `NEXT_PUBLIC_API_URL`
- Default: `http://localhost:5000/api`

### 2. Authentication
- JWT tokens stored in localStorage
- Automatic token inclusion in API requests
- Token refresh on 401 responses

### 3. Available API Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/forgot-password/*` - Password reset flow

#### Providers
- `GET /providers` - List all providers
- `GET /providers/:id` - Get provider details
- `POST /providers` - Create provider profile
- `PUT /providers` - Update provider profile
- `GET /providers/:id/reviews` - Get provider reviews

#### Appointments
- `POST /appointments` - Create appointment
- `GET /appointments/customer` - Get customer appointments
- `GET /appointments/provider` - Get provider appointments
- `PATCH /appointments/:id/status` - Update appointment status
- `POST /appointments/:id/review` - Add appointment review

#### Uploads
- `POST /uploads/provider/images` - Upload provider images
- `DELETE /uploads/provider/images` - Delete provider image

#### Search
- `GET /search/providers` - Search providers
- `GET /search/categories` - Get categories
- `GET /search/popular-services` - Get popular services

## Development Workflow

### 1. Start Both Services
```bash
# Terminal 1 - Start server
cd server && npm run dev

# Terminal 2 - Start client
cd client && npm run dev
```

### 2. Access the Application
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- API Documentation: See `client/src/lib/api-documentation.md`

### 3. Testing API Connection
You can test the API connection by:
1. Opening the browser console on `http://localhost:3000`
2. Running: `fetch('/api/search/categories').then(r => r.json()).then(console.log)`

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure server is running on port 5000
   - Check `NEXT_PUBLIC_API_URL` in client environment

2. **Database Connection**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in server environment

3. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT_SECRET configuration

4. **Image Upload Issues**
   - Verify Cloudinary configuration
   - Check file size limits

5. **SMS Issues**
   - Verify Twilio configuration
   - Check phone number format

### Environment Variables Checklist

#### Server (.env)
- [ ] PORT
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] CLOUDINARY_* (for image uploads)
- [ ] TWILIO_* (for SMS)

#### Client (.env.local)
- [ ] NEXT_PUBLIC_API_URL

## Production Deployment

### Server Deployment
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Configure proper CORS origins
4. Set up SSL/HTTPS

### Client Deployment
1. Update `NEXT_PUBLIC_API_URL` to production API URL
2. Build the application: `npm run build`
3. Deploy static files or use Next.js deployment

## Additional Resources

- [API Documentation](client/src/lib/api-documentation.md)
- [Project README](README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)