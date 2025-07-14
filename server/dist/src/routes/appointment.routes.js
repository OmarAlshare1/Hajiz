"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const appointment_controller_1 = require("../controllers/appointment.controller");
const router = express_1.default.Router();
const appointmentValidation = [
    (0, express_validator_1.body)('serviceProviderId').isMongoId().withMessage('Invalid service provider ID'),
    (0, express_validator_1.body)('serviceId').isMongoId().withMessage('Invalid service ID'),
    (0, express_validator_1.body)('dateTime').isISO8601().withMessage('Invalid date and time'),
    (0, express_validator_1.body)('notes').optional().trim()
];
const statusValidation = [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Invalid status')
];
const reviewValidation = [
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('review')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Review must be between 10 and 500 characters')
];
router.post('/', auth_1.auth, appointmentValidation, appointment_controller_1.createAppointment);
router.get('/customer', auth_1.auth, appointment_controller_1.getCustomerAppointments);
router.get('/:id', auth_1.auth, appointment_controller_1.getAppointment);
router.post('/:id/review', auth_1.auth, reviewValidation, appointment_controller_1.addReview);
router.get('/provider', auth_1.auth, auth_1.isProvider, appointment_controller_1.getProviderAppointments);
router.patch('/:id/status', auth_1.auth, auth_1.isProvider, statusValidation, appointment_controller_1.updateAppointmentStatus);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map