"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = require("../models/User");
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
async function seedAdmins() {
    await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hajiz');
    const providerPassword = await bcryptjs_1.default.hash('ProviderAdmin@1', 10);
    await User_1.User.updateOne({ phone: '0999999999' }, {
        name: 'Provider Admin',
        phone: '0999999999',
        password: providerPassword,
        role: 'provider',
        isAdmin: true,
        language: 'ar',
    }, { upsert: true });
    const customerPassword = await bcryptjs_1.default.hash('CustomerAdmin@1', 10);
    await User_1.User.updateOne({ phone: '0988888888' }, {
        name: 'Customer Admin',
        phone: '0988888888',
        password: customerPassword,
        role: 'customer',
        isAdmin: true,
        language: 'ar',
    }, { upsert: true });
    console.log('Admin accounts seeded with hashed passwords.');
    process.exit(0);
}
seedAdmins().catch(err => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seedAdmins.js.map