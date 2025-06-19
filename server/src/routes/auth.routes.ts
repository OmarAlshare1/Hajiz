import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, requestPasswordReset, verifyResetCode, resetPassword } from '../controllers/auth.controller';
import { auth } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('role').optional().isIn(['customer', 'provider']).withMessage('Invalid role')
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
// FIX: Re-add loginValidation middleware to the login route
router.post('/login', loginValidation, login); // Corrected line
router.get('/profile', auth, getProfile);
router.post('/forgot-password/request', requestPasswordReset);
router.post('/forgot-password/verify', verifyResetCode);
router.post('/forgot-password/reset', resetPassword);

export default router;