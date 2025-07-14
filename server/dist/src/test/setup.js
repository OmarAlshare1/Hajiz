"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
let mongo;
beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.NODE_ENV = 'test';
    mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongo.getUri();
    await mongoose_1.default.connect(mongoUri);
});
beforeEach(async () => {
    if (!mongoose_1.default.connection.db)
        return;
    const collections = await mongoose_1.default.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});
afterAll(async () => {
    await mongoose_1.default.connection.close();
    await mongo.stop();
});
const createTestUser = async (role = 'customer') => {
    const user = await User_1.User.create({
        name: 'Test User',
        phone: '+963123456789',
        email: 'test@example.com',
        password: 'password123',
        role
    });
    const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return { user, token };
};
exports.createTestUser = createTestUser;
jest.setTimeout(30000);
//# sourceMappingURL=setup.js.map