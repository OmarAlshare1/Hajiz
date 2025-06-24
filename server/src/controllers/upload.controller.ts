import { Request, Response } from 'express';
import { ServiceProvider } from '../models/ServiceProvider';
import { cloudinary } from '../config/cloudinary';

// Upload provider images
export const uploadProviderImages = async (req: Request, res: Response) => {
  try {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Get the files from the request (added by multer)
    const files = req.files as Express.Multer.File[];
    
    // Get image URLs from the uploaded files
    const imageUrls = files.map(file => (file as any).path);

    // Find the provider profile
    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      // Delete uploaded images if provider not found
      for (const url of imageUrls) {
        const publicId = url.split('/').pop()?.split('.')[0];
        if (publicId) await cloudinary.uploader.destroy(`hajiz_providers/${publicId}`);
      }
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Add new images to the provider's images array
    provider.images = [...provider.images, ...imageUrls];
    await provider.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: provider.images
    });
  } catch (error) {
    console.error('Upload provider images error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Delete provider image
export const deleteProviderImage = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Find the provider profile
    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Check if the image exists in the provider's images
    if (!provider.images.includes(imageUrl)) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the image from Cloudinary
    const publicId = imageUrl.split('/').pop()?.split('.')[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`hajiz_providers/${publicId}`);
    }

    // Remove the image from the provider's images array
    provider.images = provider.images.filter(img => img !== imageUrl);
    await provider.save();

    res.status(200).json({
      message: 'Image deleted successfully',
      images: provider.images
    });
  } catch (error) {
    console.error('Delete provider image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};