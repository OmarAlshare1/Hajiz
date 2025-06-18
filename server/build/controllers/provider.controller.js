"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkingHours = exports.deleteService = exports.updateService = exports.addService = exports.getAllProviders = exports.getProviderById = exports.searchProviders = exports.updateProvider = exports.getProvider = exports.createProvider = void 0;
const ServiceProvider_1 = require("../models/ServiceProvider");
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const createProvider = async (req, res) => {
    var _a, _b, _c;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { businessName, category, description, location, services, workingHours } = req.body;
        const existingProvider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (existingProvider) {
            return res.status(400).json({ message: 'Provider profile already exists' });
        }
        const provider = new ServiceProvider_1.ServiceProvider({
            userId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            businessName,
            category,
            description,
            location,
            services,
            workingHours
        });
        await provider.save();
        await User_1.User.findByIdAndUpdate((_c = req.user) === null || _c === void 0 ? void 0 : _c._id, { role: 'provider' });
        res.status(201).json({
            message: 'Provider profile created successfully',
            provider
        });
    }
    catch (error) {
        console.error('Create provider error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.createProvider = createProvider;
const getProvider = async (req, res) => {
    var _a;
    try {
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('userId', 'name phone email');
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        res.json(provider);
    }
    catch (error) {
        console.error('Get provider error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getProvider = getProvider;
const updateProvider = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { businessName, category, description, location, services, workingHours } = req.body;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        if (businessName)
            provider.businessName = businessName;
        if (category)
            provider.category = category;
        if (description)
            provider.description = description;
        if (location)
            provider.location = location;
        if (services)
            provider.services = services;
        if (workingHours)
            provider.workingHours = workingHours;
        await provider.save();
        res.json({
            message: 'Provider profile updated successfully',
            provider
        });
    }
    catch (error) {
        console.error('Update provider error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.updateProvider = updateProvider;
const searchProviders = async (req, res) => {
    try {
        const { category, location, rating } = req.query;
        const query = {};
        if (category) {
            query.category = category;
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }
        if (location) {
            const [longitude, latitude] = location.split(',').map(Number);
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 10000
                }
            };
        }
        const providers = await ServiceProvider_1.ServiceProvider.find(query)
            .populate('userId', 'name phone')
            .limit(20);
        res.json(providers);
    }
    catch (error) {
        console.error('Search providers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.searchProviders = searchProviders;
const getProviderById = async (req, res) => {
    try {
        const provider = await ServiceProvider_1.ServiceProvider.findById(req.params.id)
            .populate('userId', 'name phone email');
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }
        res.json(provider);
    }
    catch (error) {
        console.error('Get provider by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getProviderById = getProviderById;
const getAllProviders = async (req, res) => {
    try {
        const { location, service, rating } = req.query;
        const query = {};
        if (location) {
            const [lng, lat] = location.split(',').map(Number);
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 10000
                }
            };
        }
        if (service) {
            query['services.name'] = { $regex: service, $options: 'i' };
        }
        if (rating) {
            query.rating = { $gte: Number(rating) };
        }
        const providers = await ServiceProvider_1.ServiceProvider.find(query)
            .populate('userId', 'name phone email')
            .select('-services.description');
        res.json(providers);
    }
    catch (error) {
        console.error('Get all providers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllProviders = getAllProviders;
const addService = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, duration, price, description } = req.body;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        provider.services.push({ name, duration, price, description });
        await provider.save();
        res.json({
            message: 'Service added successfully',
            service: provider.services[provider.services.length - 1]
        });
    }
    catch (error) {
        console.error('Add service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.addService = addService;
const updateService = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { serviceId } = req.params;
        const { name, duration, price, description } = req.body;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        const service = provider.services.find(s => s._id.toString() === serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        if (name)
            service.name = name;
        if (duration)
            service.duration = duration;
        if (price)
            service.price = price;
        if (description)
            service.description = description;
        await provider.save();
        res.json({
            message: 'Service updated successfully',
            service
        });
    }
    catch (error) {
        console.error('Update service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.updateService = updateService;
const deleteService = async (req, res) => {
    var _a;
    try {
        const { serviceId } = req.params;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        const service = provider.services.find(s => s._id.toString() === serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        provider.services = provider.services.filter(s => s._id.toString() !== serviceId);
        await provider.save();
        res.json({ message: 'Service deleted successfully' });
    }
    catch (error) {
        console.error('Delete service error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.deleteService = deleteService;
const updateWorkingHours = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { workingHours } = req.body;
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        provider.workingHours = workingHours;
        await provider.save();
        res.json({
            message: 'Working hours updated successfully',
            workingHours: provider.workingHours
        });
    }
    catch (error) {
        console.error('Update working hours error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.updateWorkingHours = updateWorkingHours;
//# sourceMappingURL=provider.controller.js.map