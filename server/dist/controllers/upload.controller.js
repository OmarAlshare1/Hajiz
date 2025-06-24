"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProviderImage = exports.uploadProviderImages = void 0;
const ServiceProvider_1 = require("../models/ServiceProvider");
const cloudinary_1 = require("../config/cloudinary");
const uploadProviderImages = async (req, res) => {
    var _a, _b;
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }
        const files = req.files;
        const imageUrls = files.map(file => file.path);
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            for (const url of imageUrls) {
                const publicId = (_b = url.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
                if (publicId)
                    await cloudinary_1.cloudinary.uploader.destroy(`hajiz_providers/${publicId}`);
            }
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        provider.images = [...provider.images, ...imageUrls];
        await provider.save();
        res.status(200).json({
            message: 'Images uploaded successfully',
            images: provider.images
        });
    }
    catch (error) {
        console.error('Upload provider images error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.uploadProviderImages = uploadProviderImages;
const deleteProviderImage = async (req, res) => {
    var _a, _b;
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ message: 'Image URL is required' });
        }
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        if (!provider.images.includes(imageUrl)) {
            return res.status(404).json({ message: 'Image not found' });
        }
        const publicId = (_b = imageUrl.split('/').pop()) === null || _b === void 0 ? void 0 : _b.split('.')[0];
        if (publicId) {
            await cloudinary_1.cloudinary.uploader.destroy(`hajiz_providers/${publicId}`);
        }
        provider.images = provider.images.filter(img => img !== imageUrl);
        await provider.save();
        res.status(200).json({
            message: 'Image deleted successfully',
            images: provider.images
        });
    }
    catch (error) {
        console.error('Delete provider image error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.deleteProviderImage = deleteProviderImage;
//# sourceMappingURL=upload.controller.js.map