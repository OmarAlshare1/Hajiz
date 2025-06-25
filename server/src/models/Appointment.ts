import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAppointment extends Document {
  customer: Types.ObjectId;
  serviceProvider: Types.ObjectId;
  service: {
    name: string;
    duration: number;
    price: number;
  };
  dateTime: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'not_required';
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceProvider: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProvider',
    required: true
  },
  service: {
    name: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  dateTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'not_required'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for querying appointments by date range
appointmentSchema.index({ dateTime: 1 });

// Index for querying appointments by service provider and date
appointmentSchema.index({ serviceProvider: 1, dateTime: 1 });

// Index for querying appointments by customer
appointmentSchema.index({ customer: 1 });

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);