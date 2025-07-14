"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const search_controller_1 = require("../controllers/search.controller");
const router = express_1.default.Router();
const searchValidation = [
    (0, express_validator_1.query)('query').optional().trim(),
    (0, express_validator_1.query)('location').optional().matches(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/).withMessage('Location must be in format: longitude,latitude'),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    (0, express_validator_1.query)('service').optional().trim(),
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];
router.get('/', searchValidation, search_controller_1.searchProviders);
router.get('/categories', search_controller_1.getCategories);
router.get('/popular-services', search_controller_1.getPopularServices);
exports.default = router;
//# sourceMappingURL=search.routes.js.map