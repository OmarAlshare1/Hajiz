# Hajiz (حجز) - Appointment Booking Platform

Hajiz is a modern appointment booking platform designed for service providers in Syria. It enables customers to easily book appointments with various service providers like salons, clinics, car services, tutors, and gyms.

## Features

### For Customers
- Browse services by category or location
- View service provider profiles with ratings and reviews
- Book appointments instantly
- Receive appointment reminders
- Manage bookings (view, cancel, reschedule)
- Leave reviews and ratings

### For Service Providers
- Create and manage business profile
- Set available services and pricing
- Define working hours
- Manage appointments
- View customer reviews and ratings

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- CORS and Helmet for security

### Frontend (Coming Soon)
- Next.js
- React
- Tailwind CSS
- RTL Support
- Responsive Design

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hajiz.git
cd hajiz
```

2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies (coming soon)
cd ../client
npm install
```

3. Create environment variables:
```bash
# In server directory
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hajiz
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

5. Start the development server:
```bash
# Start backend server
cd server
npm run dev

# Start frontend (coming soon)
cd ../client
npm run dev
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "User Name",
  "phone": "+963123456789",
  "email": "user@example.com",
  "password": "password123",
  "role": "customer" // or "provider"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+963123456789",
  "password": "password123"
}
```

### Service Provider Endpoints

#### Create Provider Profile
```http
POST /api/providers/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessName": "Business Name",
  "category": "salon",
  "description": "Business description",
  "location": {
    "coordinates": [36.2021, 37.1343],
    "address": "Business address"
  },
  "services": [
    {
      "name": "Service Name",
      "duration": 30,
      "price": 5000
    }
  ],
  "workingHours": [
    {
      "day": 1,
      "start": "09:00",
      "end": "17:00"
    }
  ]
}
```

### Appointment Endpoints

#### Book Appointment
```http
POST /api/appointments
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceProviderId": "provider_id",
  "serviceId": "service_id",
  "dateTime": "2024-03-15T10:00:00Z",
  "notes": "Optional notes"
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Contact

For any inquiries, please reach out to [your-email@example.com]. 
