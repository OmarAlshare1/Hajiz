import express from 'express';
import { body } from 'express-validator';
import { auth, isProvider } from '../middleware/auth';
import {
  createAppointment,
  getAppointment,
  getCustomerAppointments,
  getProviderAppointments,
  updateAppointmentStatus,
  addReview
} from '../controllers/appointment.controller';

const router = express.Router();

// Validation middleware
const appointmentValidation = [
  body('serviceProviderId').isMongoId().withMessage('Invalid service provider ID'),
  body('serviceId').isMongoId().withMessage('Invalid service ID'),
  body('dateTime').isISO8601().withMessage('Invalid date and time'),
  body('notes').optional().trim()
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
    .withMessage('Invalid status')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Review must be between 10 and 500 characters')
];

// Customer routes
router.post('/', auth, appointmentValidation, createAppointment);
router.get('/customer', auth, getCustomerAppointments);
router.get('/:id', auth, getAppointment);
router.post('/:id/review', auth, reviewValidation, addReview);

// Provider routes
router.get('/provider', auth, isProvider, getProviderAppointments);
router.patch('/:id/status', auth, isProvider, statusValidation, updateAppointmentStatus);

export default router; 