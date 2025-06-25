import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ServiceProvider } from '../models/ServiceProvider';

export const searchProviders = async (req: Request, res: Response) => {
  try {
    // Validate request
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

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    let providers, total;

    // Handle location-based search separately due to $near operator limitations
    if (location) {
      const [lng, lat] = (location as string).split(',').map(Number);
      
      // For location-based search, use aggregation pipeline
      const pipeline: any[] = [
        {
          $geoNear: {
             near: {
               type: 'Point' as const,
               coordinates: [lng, lat] as [number, number]
             },
             distanceField: 'distance',
             maxDistance: 10000, // 10km radius
             spherical: true
           }
         }
       ];

      // Add match stage for other filters
      const matchStage: any = {};
      if (query) {
        matchStage.$text = { $search: query as string };
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

      // Add lookup for user data
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

      // Add pagination
      pipeline.push(
        { $skip: skip },
        { $limit: Number(limit) }
      );

      // Execute aggregation
      providers = await ServiceProvider.aggregate(pipeline);
      
      // Get total count for pagination
      const countPipeline: any[] = pipeline.slice(0, -2); // Remove skip and limit
      countPipeline.push({ $count: 'total' });
      const countResult = await ServiceProvider.aggregate(countPipeline);
      total = countResult[0]?.total || 0;
    } else {
      // Execute regular search without location
      [providers, total] = await Promise.all([
        ServiceProvider.find(searchQuery)
          .populate('userId', 'name phone email')
          .select('-services.description')
          .sort({ rating: -1 })
          .skip(skip)
          .limit(Number(limit)),
        ServiceProvider.countDocuments(searchQuery)
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
  } catch (error) {
    console.error('Search providers error:', error);
    console.error('Error stack:', (error as Error).stack);
    console.error('Request query:', req.query);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
    return;
  }
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