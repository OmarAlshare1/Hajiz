# Hajiz API Documentation

This document provides comprehensive information about the Hajiz API endpoints and their usage.

## Base Configuration

- **Base URL**: `http://localhost:5000/api` (development) or configured via `NEXT_PUBLIC_API_URL`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`

## Authentication Endpoints

### POST /auth/register
Register a new user (customer or provider)

**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "email": "string" (optional),
  "password": "string" (min 6 characters),
  "role": "customer" | "provider" (optional, defaults to customer),
  "businessName": "string" (required if role is provider),
  "category": "string" (required if role is provider)
}
```

### POST /auth/login
Authenticate user and get access token

**Request Body:**
```json
{
  "phone": "string",
  "password": "string"
}
```

### GET /auth/profile
Get current user profile (requires authentication)

### PUT /auth/profile
Update user profile (requires authentication)

### POST /auth/forgot-password/request
Request password reset code

**Request Body:**
```json
{
  "phone": "string"
}
```

### POST /auth/forgot-password/verify
Verify reset code

**Request Body:**
```json
{
  "phone": "string",
  "code": "string"
}
```

### POST /auth/forgot-password/reset
Reset password with verified code

**Request Body:**
```json
{
  "phone": "string",
  "code": "string",
  "newPassword": "string"
}
```

## Provider Endpoints

### GET /providers
Get all service providers with optional filtering

**Query Parameters:**
- `category`: Filter by category
- `location`: Filter by location
- `search`: Search by name or description

### GET /providers/:id
Get specific provider details

### GET /providers/profile
Get current provider's profile (requires provider authentication)

### POST /providers
Create provider profile (requires provider authentication)

### PUT /providers
Update provider profile (requires provider authentication)

### POST /providers/services
Add new service (requires provider authentication)

### PUT /providers/services/:serviceId
Update service (requires provider authentication)

### DELETE /providers/services/:serviceId
Delete service (requires provider authentication)

### PUT /providers/working-hours
Update working hours (requires provider authentication)

### POST /providers/availability-exceptions
Add availability exception (requires provider authentication)

### DELETE /providers/availability-exceptions/:exceptionId
Delete availability exception (requires provider authentication)

### GET /providers/availability-exceptions
Get availability exceptions (requires provider authentication)

### GET /providers/:id/reviews
Get reviews for a specific provider

## Appointment Endpoints

### POST /appointments
Create new appointment (requires customer authentication)

**Request Body:**
```json
{
  "serviceProviderId": "string",
  "serviceId": "string",
  "dateTime": "ISO8601 string",
  "notes": "string" (optional)
}
```

### GET /appointments/customer
Get customer's appointments (requires customer authentication)

### GET /appointments/provider
Get provider's appointments (requires provider authentication)

### GET /appointments/:id
Get specific appointment details (requires authentication)

### PATCH /appointments/:id/status
Update appointment status (requires provider authentication)

**Request Body:**
```json
{
  "status": "pending" | "confirmed" | "completed" | "cancelled"
}
```

### POST /appointments/:id/review
Add review to completed appointment (requires customer authentication)

**Request Body:**
```json
{
  "rating": 1-5,
  "review": "string" (optional, 10-500 characters)
}
```

## Search Endpoints

### GET /search/providers
Search providers

**Query Parameters:**
- `q`: Search query

### GET /search/categories
Get available categories

### GET /search/popular-services
Get popular services

## Upload Endpoints

### POST /uploads/provider/images
Upload provider images (requires provider authentication)

**Request:** Multipart form data with image files

### DELETE /uploads/provider/images
Delete provider image (requires provider authentication)

**Request Body:**
```json
{
  "imageUrl": "string"
}
```

## Client API Usage

The client provides organized API functions:

```typescript
import { auth, appointments, providers, uploads, search, reviews } from '@/lib/api';

// Authentication
const loginResult = await auth.login({ phone, password });
const profile = await auth.getProfile();

// Appointments
const userAppointments = await appointments.getAll();
const newAppointment = await appointments.create(appointmentData);

// Providers
const allProviders = await providers.getAll();
const providerDetails = await providers.getById(id);

// Reviews
const providerReviews = await reviews.getByProvider(providerId);

// Search
const searchResults = await search.providers(query);
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include a `message` field with details.

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes

## Security Features

- JWT token authentication
- Request size limiting
- Content-Type validation
- CORS protection
- Security headers
- Input validation and sanitization