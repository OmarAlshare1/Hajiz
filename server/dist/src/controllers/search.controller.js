"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPopularServices = exports.getCategories = exports.searchProviders = void 0;
const express_validator_1 = require("express-validator");
const ServiceProvider_1 = require("../models/ServiceProvider");
const searchProviders = async (req, res) => {
    var _a;
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
        const skip = (Number(page) - 1) * Number(limit);
        let providers, total;
        if (location) {
            const [lng, lat] = location.split(',').map(Number);
            const pipeline = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [lng, lat]
                        },
                        distanceField: 'distance',
                        maxDistance: 10000,
                        spherical: true
                    }
                }
            ];
            const matchStage = {};
            if (query) {
                matchStage.$text = { $search: query };
            }
            if (category) {
                matchStage.category = category;
            }
            if (rating) {
                matchStage.rating = { $gte: Number(rating) };
            }
            if (service) {
                matchStage['services.name'] = { $regex: service, $options: 'i' };
            }
            if (Object.keys(matchStage).length > 0) {
                pipeline.push({ $match: matchStage });
            }
            pipeline.push({
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId',
                    pipeline: [{ $project: { name: 1, phone: 1, email: 1 } }]
                }
            });
            pipeline.push({ $unwind: '$userId' });
            pipeline.push({ $skip: skip }, { $limit: Number(limit) });
            providers = await ServiceProvider_1.ServiceProvider.aggregate(pipeline);
            const countPipeline = pipeline.slice(0, -2);
            countPipeline.push({ $count: 'total' });
            const countResult = await ServiceProvider_1.ServiceProvider.aggregate(countPipeline);
            total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        }
        else {
            [providers, total] = await Promise.all([
                ServiceProvider_1.ServiceProvider.find(searchQuery)
                    .populate('userId', 'name phone email')
                    .select('-services.description')
                    .sort({ rating: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                ServiceProvider_1.ServiceProvider.countDocuments(searchQuery)
            ]);
        }
        res.json({
            providers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
        return;
    }
    catch (error) {
        console.error('Search providers error:', error);
        console.error('Error stack:', error.stack);
        console.error('Request query:', req.query);
        res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        return;
    }
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