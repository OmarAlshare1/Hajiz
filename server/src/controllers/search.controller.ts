import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServiceProvider } from '../models/ServiceProvider';

export const searchProviders = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      query,
      location,
      category,
      rating,
      service,
      page = 1,
      limit = 10
    } = req.query;

    const searchQuery: any = {};

    // Text search
    if (query) {
      searchQuery.$text = { $search: query as string };
    }

    // Category filter
    if (category) {
      searchQuery.category = category;
    }

    // Rating filter
    if (rating) {
      searchQuery.rating = { $gte: Number(rating) };
    }

    // Service filter
    if (service) {
      searchQuery['services.name'] = { $regex: service, $options: 'i' };
    }

    // Location-based search
    if (location) {
      const [lng, lat] = (location as string).split(',').map(Number);
      searchQuery.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10km radius
        }
      };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute search
    const [providers, total] = await Promise.all([
      ServiceProvider.find(searchQuery)
        .populate('userId', 'name phone email')
        .select('-services.description')
        .sort(location ? { location: 1 } : { rating: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ServiceProvider.countDocuments(searchQuery)
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
  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await ServiceProvider.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getPopularServices = async (_req: Request, res: Response) => {
  try {
    const providers = await ServiceProvider.aggregate([
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
  } catch (error) {
    console.error('Get popular services error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
}; 