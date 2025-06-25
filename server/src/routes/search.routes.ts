import express from 'express';
import { query } from 'express-validator';
import { searchProviders, getCategories, getPopularServices } from '../controllers/search.controller';

const router = express.Router();

// Validation middleware
const searchValidation = [
  query('query').optional().trim(),
  query('location').optional().matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).withMessage('Location must be in format: longitude,latitude'),
  query('category').optional().trim(),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  query('service').optional().trim(),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

// Routes
router.get('/', searchValidation, searchProviders);
router.get('/categories', getCategories);
router.get('/popular-services', getPopularServices);

export default router;