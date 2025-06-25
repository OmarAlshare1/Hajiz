import { Router } from 'express';
import { body } from 'express-validator';
import {
  createProvider,
  getProvider,
  updateProvider,
  getAllProviders,
  getProviderById,
  addService,
  updateService,
  deleteService,
  updateWorkingHours,
  addAvailabilityException,
  deleteAvailabilityException,
  getAvailabilityExceptions,
  getProviderReviews
} from '../controllers/provider.controller';
import { auth } from '../middleware/auth';
import { isProvider } from '../middleware/isProvider';

const router = Router();

// Validation middleware
const providerValidation = [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location.type').equals('Point').withMessage('Location type must be Point'),
  body('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('services').isArray().withMessage('Services must be an array'),
  body('services.*.name').trim().notEmpty().withMessage('Service name is required'),
  body('services.*.duration').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
  body('services.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('workingHours').isArray().withMessage('Working hours must be an array'),
  body('workingHours.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('workingHours.*.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:mm format'),
  body('workingHours.*.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:mm format')
];

const serviceValidation = [
  body('name').trim().notEmpty().withMessage('Service name is required'),
  body('duration').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('description').optional().trim()
];

const workingHoursValidation = [
  body('workingHours').isArray().withMessage('Working hours must be an array'),
  body('workingHours.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid day'),
  body('workingHours.*.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:mm format'),
  body('workingHours.*.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:mm format')
];

const availabilityExceptionValidation = [
  body('date').isISO8601().withMessage('Date must be in ISO format'),
  body('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
  body('customHours').optional(),
  body('customHours.open').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Open time must be in HH:mm format'),
  body('customHours.close').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Close time must be in HH:mm format')
];

// Provider profile routes
router.post('/', auth, isProvider, providerValidation, createProvider);
router.put('/', auth, isProvider, providerValidation, updateProvider);
router.get('/profile', auth, isProvider, getProvider);
router.get('/', getAllProviders);

// Get provider by ID - moved below specific routes to avoid conflicts
router.get('/:id', getProviderById);

// Service management routes
router.post('/services', auth, isProvider, serviceValidation, addService);
router.put('/services/:serviceId', auth, isProvider, serviceValidation, updateService);
router.delete('/services/:serviceId', auth, isProvider, deleteService);

// Working hours route
router.put('/working-hours', auth, isProvider, workingHoursValidation, updateWorkingHours);

// Availability exceptions routes
router.post('/availability-exceptions', auth, isProvider, availabilityExceptionValidation, addAvailabilityException);
router.delete('/availability-exceptions/:exceptionId', auth, isProvider, deleteAvailabilityException);
router.get('/availability-exceptions', auth, isProvider, getAvailabilityExceptions);

// Reviews routes
router.get('/:id/reviews', getProviderReviews);

export default router;