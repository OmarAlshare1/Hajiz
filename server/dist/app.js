"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const provider_routes_1 = __importDefault(require("./routes/provider.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const security_1 = require("./middleware/security");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3004',
            'https://www.hajiz.co.uk',
            'https://hajiz-tvi6d9b95k-omars-projects-ce6be162.vercel.app',
            'https://hajiz-ann7xz4y5-omars-projects-ce6be162.vercel.app',
            'https://krrwf4d-next-js-projects-online-n2.vercel.app',
            ...(process.env.CORS_ORIGIN_FRONTEND ? [process.env.CORS_ORIGIN_FRONTEND] : []),
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Not allowed by CORS: ${origin}`), false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, express_mongo_sanitize_1.default)());
app.use(security_1.preventXss);
app.use(security_1.preventParamPollution);
app.use(security_1.securityHeaders);
app.use(security_1.requestSizeLimiter);
app.use(security_1.validateContentType);
app.use(security_1.limiter);
app.use('/api/auth', security_1.authLimiter);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/providers', provider_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/search', search_routes_1.default);
app.use('/api/uploads', upload_routes_1.default);
app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to Hajiz API' });
    return;
});
app.use(security_1.errorHandler);
exports.default = app;
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
//# sourceMappingURL=app.js.map