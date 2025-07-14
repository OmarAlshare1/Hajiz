"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyResetCode = exports.requestPasswordReset = exports.updateProfile = exports.getProfile = exports.login = exports.verifyPasswordResetCode = exports.sendPasswordResetCode = exports.verifyLoginCode = exports.sendLoginCode = exports.verifyRegistrationCode = exports.sendRegistrationCode = exports.register = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const ServiceProvider_1 = require("../models/ServiceProvider");
const notification_service_1 = require("../services/notification.service");
const register = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, phone, email, password, role, businessName, category } = req.body;
        const existingUser = await User_1.User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = new User_1.User({
            name,
            phone,
            email,
            password,
            role: role || 'customer'
        });
        await user.save();
        if (role === 'provider' && businessName && category) {
            const provider = new ServiceProvider_1.ServiceProvider({
                userId: user._id,
                businessName,
                category,
                description: `${businessName} - ${category}`,
                location: {
                    type: 'Point',
                    coordinates: [36.2021, 37.1343],
                    address: 'سوريا'
                },
                services: [],
                workingHours: [
                    { day: 'sunday', open: '09:00', close: '17:00', isClosed: false },
                    { day: 'monday', open: '09:00', close: '17:00', isClosed: false },
                    { day: 'tuesday', open: '09:00', close: '17:00', isClosed: false },
                    { day: 'wednesday', open: '09:00', close: '17:00', isClosed: false },
                    { day: 'thursday', open: '09:00', close: '17:00', isClosed: false },
                    { day: 'friday', open: '09:00', close: '17:00', isClosed: true },
                    { day: 'saturday', open: '09:00', close: '17:00', isClosed: false }
                ]
            });
            await provider.save();
        }
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.register = register;
const sendRegistrationCode = async (req, res) => {
    try {
        const { phone, countryCode, language = 'ar' } = req.body;
        const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
        const existingUser = await User_1.User.findOne({ phone: fullPhoneNumber });
        if (existingUser && existingUser.isPhoneVerified) {
            return res.status(400).json({ message: 'User already exists with this phone number' });
        }
        const code = notification_service_1.notificationService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        if (existingUser) {
            existingUser.verificationCode = code;
            existingUser.verificationCodeExpires = expiresAt;
            existingUser.verificationCodeType = 'register';
            existingUser.countryCode = countryCode;
            await existingUser.save();
        }
        else {
            const tempUser = new User_1.User({
                name: 'Temp User',
                phone: fullPhoneNumber,
                password: 'temp_password',
                verificationCode: code,
                verificationCodeExpires: expiresAt,
                verificationCodeType: 'register',
                countryCode,
                language,
                isPhoneVerified: false
            });
            await tempUser.save();
        }
        await notification_service_1.notificationService.sendVerificationCode(fullPhoneNumber, code, 'register', language);
        return res.json({
            message: 'Verification code sent to WhatsApp',
            phone: fullPhoneNumber
        });
    }
    catch (error) {
        console.error('Send registration code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.sendRegistrationCode = sendRegistrationCode;
const verifyRegistrationCode = async (req, res) => {
    try {
        const { phone, code, name, email, password, role, businessName, category } = req.body;
        const user = await User_1.User.findOne({
            phone,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() },
            verificationCodeType: 'register'
        }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }
        user.name = name;
        user.email = email;
        user.password = password;
        user.role = role || 'customer';
        user.isPhoneVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationCodeType = undefined;
        await user.save();
        if (role === 'provider' && businessName && category) {
            const provider = new ServiceProvider_1.ServiceProvider({
                user: user._id,
                businessName,
                category,
                description: '',
                location: {
                    type: 'Point',
                    coordinates: [0, 0],
                    address: ''
                },
                services: [],
                workingHours: []
            });
            await provider.save();
        }
        const token = (0, auth_1.generateToken)(user._id.toString());
        return res.json({
            message: 'Registration completed successfully',
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified
            }
        });
    }
    catch (error) {
        console.error('Verify registration code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyRegistrationCode = verifyRegistrationCode;
const sendLoginCode = async (req, res) => {
    try {
        const { phone, countryCode } = req.body;
        const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
        const user = await User_1.User.findOne({ phone: fullPhoneNumber });
        if (!user || !user.isPhoneVerified) {
            return res.status(404).json({ message: 'User not found or phone not verified' });
        }
        const code = notification_service_1.notificationService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.verificationCode = code;
        user.verificationCodeExpires = expiresAt;
        user.verificationCodeType = 'login';
        await user.save();
        await notification_service_1.notificationService.sendVerificationCode(fullPhoneNumber, code, 'login', user.language);
        return res.json({
            message: 'Login verification code sent to WhatsApp',
            phone: fullPhoneNumber
        });
    }
    catch (error) {
        console.error('Send login code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.sendLoginCode = sendLoginCode;
const verifyLoginCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const user = await User_1.User.findOne({
            phone,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() },
            verificationCodeType: 'login'
        }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationCodeType = undefined;
        await user.save();
        const token = (0, auth_1.generateToken)(user._id.toString());
        return res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role,
                isPhoneVerified: user.isPhoneVerified
            }
        });
    }
    catch (error) {
        console.error('Verify login code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyLoginCode = verifyLoginCode;
const sendPasswordResetCode = async (req, res) => {
    try {
        const { phone, countryCode } = req.body;
        const fullPhoneNumber = `${countryCode}${phone.replace(/^0+/, '')}`;
        const user = await User_1.User.findOne({ phone: fullPhoneNumber });
        if (!user || !user.isPhoneVerified) {
            return res.status(404).json({ message: 'User not found or phone not verified' });
        }
        const code = notification_service_1.notificationService.generateVerificationCode();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        user.verificationCode = code;
        user.verificationCodeExpires = expiresAt;
        user.verificationCodeType = 'password_reset';
        await user.save();
        await notification_service_1.notificationService.sendVerificationCode(fullPhoneNumber, code, 'password_reset', user.language);
        return res.json({
            message: 'Password reset code sent to WhatsApp',
            phone: fullPhoneNumber
        });
    }
    catch (error) {
        console.error('Send password reset code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.sendPasswordResetCode = sendPasswordResetCode;
const verifyPasswordResetCode = async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;
        const user = await User_1.User.findOne({
            phone,
            verificationCode: code,
            verificationCodeExpires: { $gt: Date.now() },
            verificationCodeType: 'password_reset'
        }).select('+verificationCode +verificationCodeExpires +verificationCodeType');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }
        user.password = newPassword;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.verificationCodeType = undefined;
        await user.save();
        return res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Verify password reset code error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.verifyPasswordResetCode = verifyPasswordResetCode;
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { phone, password } = req.body;
        const user = await User_1.User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user._id.toString());
        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.login = login;
const getProfile = async (req, res) => {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await User_1.User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a._id)) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { name, email, password } = req.body;
        const user = await User_1.User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (password)
            user.password = password;
        await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id.toString(),
                name: user.name,
                phone: user.phone,
                email: user.email,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.updateProfile = updateProfile;
const requestPasswordReset = async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User_1.User.findOne({ phone }).select('+resetCode +resetCodeExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetCode = code;
        user.resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await notification_service_1.notificationService.sendSMS(phone, `Your verification code is: ${code}`);
        res.json({ message: 'Reset code sent successfully' });
    }
    catch (error) {
        console.error('Request password reset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.requestPasswordReset = requestPasswordReset;
const verifyResetCode = async (req, res) => {
    try {
        const { phone, code } = req.body;
        const user = await User_1.User.findOne({
            phone,
            resetCode: code,
            resetCodeExpires: { $gt: Date.now() }
        }).select('+resetCode +resetCodeExpires');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        res.json({ message: 'Code verified successfully' });
    }
    catch (error) {
        console.error('Verify reset code error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.verifyResetCode = verifyResetCode;
const resetPassword = async (req, res) => {
    try {
        const { phone, code, newPassword } = req.body;
        const user = await User_1.User.findOne({
            phone,
            resetCode: code,
            resetCodeExpires: { $gt: Date.now() }
        }).select('+resetCode +resetCodeExpires');
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }
        user.password = newPassword;
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();
        res.json({ message: 'Password reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=auth.controller.js.map