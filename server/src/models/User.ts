import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'customer' | 'provider';
  language: 'ar' | 'en';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isAdmin: boolean;
  resetCode?: string;
  resetCodeExpires?: Date;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  verificationCodeType?: 'login' | 'register' | 'password_reset';
  isPhoneVerified: boolean;
  countryCode: string;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'provider'],
    default: 'customer'
  },
  language: {
    type: String,
    enum: ['ar', 'en'],
    default: 'ar'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  resetCode: {
    type: String,
    select: false
  },
  resetCodeExpires: {
    type: Date,
    select: false
  },
  verificationCode: {
    type: String,
    select: false
  },
  verificationCodeExpires: {
    type: Date,
    select: false
  },
  verificationCodeType: {
    type: String,
    enum: ['login', 'register', 'password_reset'],
    select: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  countryCode: {
    type: String,
    required: true,
    default: '+963' // Default to Syria
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', userSchema);