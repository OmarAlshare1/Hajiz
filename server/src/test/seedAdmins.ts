import mongoose from 'mongoose';
import { User } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

async function seedAdmins() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz');

  // Provider Admin
  const providerPassword = await bcrypt.hash('ProviderAdmin@1', 10);
  await User.updateOne(
    { phone: '0999999999' },
    {
      name: 'Provider Admin',
      phone: '0999999999',
      password: providerPassword,
      role: 'provider',
      isAdmin: true,
      language: 'ar',
    },
    { upsert: true }
  );

  // Customer Admin
  const customerPassword = await bcrypt.hash('CustomerAdmin@1', 10);
  await User.updateOne(
    { phone: '0988888888' },
    {
      name: 'Customer Admin',
      phone: '0988888888',
      password: customerPassword,
      role: 'customer',
      isAdmin: true,
      language: 'ar',
    },
    { upsert: true }
  );

  console.log('Admin accounts seeded with hashed passwords.');
  process.exit(0);
}

seedAdmins().catch(err => {
  console.error(err);
  process.exit(1);
}); 