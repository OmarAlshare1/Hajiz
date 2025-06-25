import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

export interface IService {
  _id?: Types.ObjectId;
  name: string;
  duration: number; // in minutes
  price: number;
  description?: string;
}

export interface IWorkingHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface IAvailabilityException {
  _id?: Types.ObjectId;
  date: Date;           // The specific date for the exception
  isAvailable: boolean; // Whether the provider is available on this date
  customHours?: {      // Optional custom hours for this date
    open?: string;     // HH:mm format
    close?: string;    // HH:mm format
  };
}

export interface IServiceProvider extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  category: 'events' | 'villas' | 'doctors' | 'restaurants' | 'hotels' | 'beauty' | 'education' | 'sports' | 'transportation' | 'entertainment' | 'shopping' | 'tourism' | 'legal' | 'finance' | 'technology' | 'construction' | 'agriculture' | 'manufacturing';
  subcategory?: string;
  description: string;
  location: ILocation;
  services: IService[];
  workingHours: IWorkingHours[];
  availabilityExceptions: IAvailabilityException[];
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  images: string[];
  tags: string[];
  amenities: string[];
  capacity?: number;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  contactInfo: {
    phone: string;
    email?: string;
    website?: string;
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
  policies?: {
    cancellation: string;
    refund: string;
    terms: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new Schema<IServiceProvider>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['events', 'villas', 'doctors', 'restaurants', 'hotels', 'beauty', 'education', 'sports', 'transportation', 'entertainment', 'shopping', 'tourism', 'legal', 'finance', 'technology', 'construction', 'agriculture', 'manufacturing']
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: String
  }],
  workingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    open: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    close: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    isClosed: {
      type: Boolean,
      default: false
    }
  }],
  availabilityExceptions: [{
    date: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      required: true
    },
    customHours: {
      open: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      close: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  amenities: [{
    type: String,
    trim: true
  }],
  capacity: {
    type: Number,
    min: 1
  },
  priceRange: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'SYP' }
  },
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, trim: true },
    website: { type: String, trim: true },
    socialMedia: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true }
    }
  },
  policies: {
    cancellation: { type: String },
    refund: { type: String },
    terms: { type: String }
  }
}, {
  timestamps: true
});

// Create 2dsphere index for location-based queries
serviceProviderSchema.index({ location: '2dsphere' });

// Create text index for search
serviceProviderSchema.index({
  businessName: 'text',
  description: 'text',
  'services.name': 'text'
});

export const ServiceProvider = mongoose.model<IServiceProvider>('ServiceProvider', serviceProviderSchema);