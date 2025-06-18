"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const security_1 = require("./middleware/security");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(security_1.sanitizeData);
app.use(security_1.preventXss);
app.use(security_1.preventParamPollution);
app.use(security_1.securityHeaders);
app.use(security_1.requestSizeLimiter);
app.use(security_1.validateContentType);
app.use(security_1.limiter);
app.use('/auth', security_1.authLimiter);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/providers', provider_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to Hajiz API' });
    return;
});
app.use(security_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map