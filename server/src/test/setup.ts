import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

let mongo: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.JWT_SECRET = 'test-secret';
  process.env.NODE_ENV = 'test';

  // Create in-memory MongoDB instance
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

// Clear data between tests
beforeEach(async () => {
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

// Helper functions for testing
export const createTestUser = async (
  role: 'customer' | 'provider' = 'customer'
) => {
  const user = await User.create({
    name: 'Test User',
    phone: '+963123456789',
    email: 'test@example.com',
    password: 'password123',
    role
  });

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );

  return { user, token };
};

// Global test timeout
jest.setTimeout(30000); 