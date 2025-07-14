"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('email').optional().isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('role').optional().isIn(['customer', 'provider']).withMessage('Invalid role'),
    (0, express_validator_1.body)('businessName').optional().trim().notEmpty().withMessage('Business name is required for providers'),
    (0, express_validator_1.body)('category').optional().trim().notEmpty().withMessage('Category is required for providers')
];
const loginValidation = [
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required')
];
const phoneValidation = [
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('countryCode').trim().notEmpty().withMessage('Country code is required')
];
const verifyCodeValidation = [
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone number is required'),
    (0, express_validator_1.body)('code').trim().notEmpty().withMessage('Verification code is required')
];
router.post('/register', registerValidation, auth_controller_1.register);
router.post('/login', loginValidation, auth_controller_1.login);
router.get('/profile', auth_1.auth, auth_controller_1.getProfile);
router.post('/forgot-password/request', auth_controller_1.requestPasswordReset);
router.post('/forgot-password/verify', auth_controller_1.verifyResetCode);
router.post('/forgot-password/reset', auth_controller_1.resetPassword);
router.post('/whatsapp/register/send-code', phoneValidation, auth_controller_1.sendRegistrationCode);
router.post('/whatsapp/register/verify-code', verifyCodeValidation, auth_controller_1.verifyRegistrationCode);
router.post('/whatsapp/login/send-code', phoneValidation, auth_controller_1.sendLoginCode);
router.post('/whatsapp/login/verify-code', verifyCodeValidation, auth_controller_1.verifyLoginCode);
router.post('/whatsapp/reset-password/send-code', phoneValidation, auth_controller_1.sendPasswordResetCode);
router.post('/whatsapp/reset-password/verify-code', verifyCodeValidation, auth_controller_1.verifyPasswordResetCode);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map