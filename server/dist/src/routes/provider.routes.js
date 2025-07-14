"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const provider_controller_1 = require("../controllers/provider.controller");
const auth_1 = require("../middleware/auth");
const isProvider_1 = require("../middleware/isProvider");
const router = (0, express_1.Router)();
const providerValidation = [
    (0, express_validator_1.body)('businessName').trim().notEmpty().withMessage('Business name is required'),
    (0, express_validator_1.body)('category').trim().notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('location.type').equals('Point').withMessage('Location type must be Point'),
    (0, express_validator_1.body)('location.coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
    (0, express_validator_1.body)('location.address').trim().notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('services').isArray().withMessage('Services must be an array'),
    (0, express_validator_1.body)('services.*.name').trim().notEmpty().withMessage('Service name is required'),
    (0, express_validator_1.body)('services.*.duration').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
    (0, express_validator_1.body)('services.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('workingHours').isArray().withMessage('Working hours must be an array'),
    (0, express_validator_1.body)('workingHours.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Invalid day'),
    (0, express_validator_1.body)('workingHours.*.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Open time must be in HH:mm format'),
    (0, express_validator_1.body)('workingHours.*.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Close time must be in HH:mm format')
];
const serviceValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Service name is required'),
    (0, express_validator_1.body)('duration').isInt({ min: 0 }).withMessage('Duration must be a positive number'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('description').optional().trim()
];
const workingHoursValidation = [
    (0, express_validator_1.body)('workingHours').isArray().withMessage('Working hours must be an array'),
    (0, express_validator_1.body)('workingHours.*.day').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        .withMessage('Invalid day'),
    (0, express_validator_1.body)('workingHours.*.open').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Open time must be in HH:mm format'),
    (0, express_validator_1.body)('workingHours.*.close').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Close time must be in HH:mm format')
];
const availabilityExceptionValidation = [
    (0, express_validator_1.body)('date').isISO8601().withMessage('Date must be in ISO format'),
    (0, express_validator_1.body)('isAvailable').isBoolean().withMessage('isAvailable must be a boolean'),
    (0, express_validator_1.body)('customHours').optional(),
    (0, express_validator_1.body)('customHours.open').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Open time must be in HH:mm format'),
    (0, express_validator_1.body)('customHours.close').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Close time must be in HH:mm format')
];
router.post('/', auth_1.auth, isProvider_1.isProvider, providerValidation, provider_controller_1.createProvider);
router.put('/', auth_1.auth, isProvider_1.isProvider, providerValidation, provider_controller_1.updateProvider);
router.get('/profile', auth_1.auth, isProvider_1.isProvider, provider_controller_1.getProvider);
router.get('/', provider_controller_1.getAllProviders);
router.get('/:id', provider_controller_1.getProviderById);
router.post('/services', auth_1.auth, isProvider_1.isProvider, serviceValidation, provider_controller_1.addService);
router.put('/services/:serviceId', auth_1.auth, isProvider_1.isProvider, serviceValidation, provider_controller_1.updateService);
router.delete('/services/:serviceId', auth_1.auth, isProvider_1.isProvider, provider_controller_1.deleteService);
router.put('/working-hours', auth_1.auth, isProvider_1.isProvider, workingHoursValidation, provider_controller_1.updateWorkingHours);
router.post('/availability-exceptions', auth_1.auth, isProvider_1.isProvider, availabilityExceptionValidation, provider_controller_1.addAvailabilityException);
router.delete('/availability-exceptions/:exceptionId', auth_1.auth, isProvider_1.isProvider, provider_controller_1.deleteAvailabilityException);
router.get('/availability-exceptions', auth_1.auth, isProvider_1.isProvider, provider_controller_1.getAvailabilityExceptions);
router.get('/:id/reviews', provider_controller_1.getProviderReviews);
exports.default = router;
//# sourceMappingURL=provider.routes.js.map