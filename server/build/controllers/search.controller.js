"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularServices = exports.getCategories = exports.searchProviders = void 0;
const express_validator_1 = require("express-validator");
const ServiceProvider_1 = require("../models/ServiceProvider");
const searchProviders = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { query, location, category, rating, service, page = 1, limit = 10 } = req.query;
        const searchQuery = {};
        if (query) {
            searchQuery.$text = { $search: query };
        }
        if (category) {
            searchQuery.category = category;
        }
        if (rating) {
            searchQuery.rating = { $gte: Number(rating) };
        }
        if (service) {
            searchQuery['services.name'] = { $regex: service, $options: 'i' };
        }
        if (location) {
            const [lng, lat] = location.split(',').map(Number);
            searchQuery.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    $maxDistance: 10000
                }
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        const [providers, total] = await Promise.all([
            ServiceProvider_1.ServiceProvider.find(searchQuery)
                .populate('userId', 'name phone email')
                .select('-services.description')
                .sort(location ? { location: 1 } : { rating: -1 })
                .skip(skip)
                .limit(Number(limit)),
            ServiceProvider_1.ServiceProvider.countDocuments(searchQuery)
        ]);
        res.json({
            providers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Search providers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.searchProviders = searchProviders;
const getCategories = async (_req, res) => {
    try {
        const categories = await ServiceProvider_1.ServiceProvider.distinct('category');
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getCategories = getCategories;
const getPopularServices = async (_req, res) => {
    try {
        const providers = await ServiceProvider_1.ServiceProvider.aggregate([
            { $unwind: '$services' },
            {
                $group: {
                    _id: '$services.name',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$services.price' },
                    avgDuration: { $avg: '$services.duration' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(providers);
    }
    catch (error) {
        console.error('Get popular services error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getPopularServices = getPopularServices;
//# sourceMappingURL=search.controller.js.map