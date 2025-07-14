import { Router } from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  getProfile, 
  requestPasswordReset, 
  verifyResetCode, 
  resetPassword,
  sendRegistrationCode,
  verifyRegistrationCode,
  sendLoginCode,
  verifyLoginCode,
  sendPasswordResetCode,
  verifyPasswordResetCode
} from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('role').optional().isIn(['customer', 'provider']).withMessage('Invalid role'),
  // If role is provider, require businessName and category
  body('businessName').optional().trim().notEmpty().withMessage('Business name is required for providers'),
  body('category').optional().trim().notEmpty().withMessage('Category is required for providers')
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const phoneValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('countryCode').trim().notEmpty().withMessage('Country code is required')
];

const verifyCodeValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('code').trim().notEmpty().withMessage('Verification code is required')
];

// Traditional authentication routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', auth, getProfile);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/verify', verifyResetCode);
router.post('/forgot-password/reset', resetPassword);

// WhatsApp verification routes
// Registration with WhatsApp verification
router.post('/whatsapp/register/send-code', phoneValidation, sendRegistrationCode);
router.post('/whatsapp/register/verify-code', verifyCodeValidation, verifyRegistrationCode);

// Login with WhatsApp verification
router.post('/whatsapp/login/send-code', phoneValidation, sendLoginCode);
router.post('/whatsapp/login/verify-code', verifyCodeValidation, verifyLoginCode);

// Password reset with WhatsApp verification
router.post('/whatsapp/reset-password/send-code', phoneValidation, sendPasswordResetCode);
router.post('/whatsapp/reset-password/verify-code', verifyCodeValidation, verifyPasswordResetCode);

export default router;