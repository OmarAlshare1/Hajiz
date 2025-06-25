import { Request, Response } from 'express';
import { ServiceProvider } from '../models/ServiceProvider';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';

// Create service provider profile
export const createProvider = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      businessName,
      category,
      description,
      location,
      services,
      workingHours
    } = req.body;

    // Check if provider profile already exists
    const existingProvider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider profile already exists' });
    }

    // Create new provider profile
    const provider = new ServiceProvider({
      userId: req.user?._id,
      businessName,
      category,
      description,
      location,
      services,
      workingHours
    });

    await provider.save();

    // Update user role to provider
    await User.findByIdAndUpdate(req.user?._id, { role: 'provider' });

    res.status(201).json({
      message: 'Provider profile created successfully',
      provider
    });
  } catch (error) {
    console.error('Create provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Get provider profile
export const getProvider = async (req: Request, res: Response) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user?._id })
      .populate('userId', 'name phone email');

    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Update provider profile
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      businessName,
      category,
      description,
      location,
      services,
      workingHours
    } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (businessName) provider.businessName = businessName;
    if (category) provider.category = category;
    if (description) provider.description = description;
    if (location) provider.location = location;
    if (services) provider.services = services;
    if (workingHours) provider.workingHours = workingHours;

    await provider.save();

    res.json({
      message: 'Provider profile updated successfully',
      provider
    });
  } catch (error) {
    console.error('Update provider error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Search providers
export const searchProviders = async (req: Request, res: Response) => {
  try {
    const { category, location, rating } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (location) {
      const [longitude, latitude] = (location as string).split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 10000 // 10km
        }
      };
    }

    const providers = await ServiceProvider.find(query)
      .populate('userId', 'name phone')
      .limit(20);

    res.json(providers);
  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProviderById = async (req: Request, res: Response) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate('userId', 'name phone email');

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json(provider);
  } catch (error) {
    console.error('Get provider by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const { location, service, rating } = req.query;
    const query: any = {};

    if (location) {
      const [lng, lat] = (location as string).split(',').map(Number);
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: 10000 // 10km radius
        }
      };
    }

    if (service) {
      query['services.name'] = { $regex: service, $options: 'i' };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    const providers = await ServiceProvider.find(query)
      .populate('userId', 'name phone email')
      .select('-services.description');

    res.json(providers);
  } catch (error) {
    console.error('Get all providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addService = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, duration, price, description } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    provider.services.push({ name, duration, price, description });
    await provider.save();

    res.json({
      message: 'Service added successfully',
      service: provider.services[provider.services.length - 1]
    });
  } catch (error) {
    console.error('Add service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { serviceId } = req.params;
    const { name, duration, price, description } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const service = provider.services.find(s => s._id!.toString() === serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (name) service.name = name;
    if (duration) service.duration = duration;
    if (price) service.price = price;
    if (description) service.description = description;

    await provider.save();

    res.json({
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const service = provider.services.find(s => s._id!.toString() === serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    provider.services = provider.services.filter(s => s._id!.toString() !== serviceId);
    await provider.save();

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const updateWorkingHours = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { workingHours } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    provider.workingHours = workingHours;
    await provider.save();

    res.json({
      message: 'Working hours updated successfully',
      workingHours: provider.workingHours
    });
  } catch (error) {
    console.error('Update working hours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const addAvailabilityException = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { date, isAvailable, customHours } = req.body;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Check if an exception already exists for this date
    const existingExceptionIndex = provider.availabilityExceptions.findIndex(
      exception => new Date(exception.date).toDateString() === new Date(date).toDateString()
    );

    if (existingExceptionIndex !== -1) {
      // Update existing exception
      provider.availabilityExceptions[existingExceptionIndex] = {
        ...provider.availabilityExceptions[existingExceptionIndex],
        isAvailable,
        customHours
      };
    } else {
      // Add new exception
      provider.availabilityExceptions.push({
        date: new Date(date),
        isAvailable,
        customHours
      });
    }

    await provider.save();

    res.json({
      message: 'Availability exception added successfully',
      availabilityExceptions: provider.availabilityExceptions
    });
  } catch (error) {
    console.error('Add availability exception error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const deleteAvailabilityException = async (req: Request, res: Response) => {
  try {
    const { exceptionId } = req.params;

    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Remove the exception with the given ID
    provider.availabilityExceptions = provider.availabilityExceptions.filter(
      exception => exception._id!.toString() !== exceptionId
    );

    await provider.save();

    res.json({
      message: 'Availability exception deleted successfully',
      availabilityExceptions: provider.availabilityExceptions
    });
  } catch (error) {
    console.error('Delete availability exception error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getAvailabilityExceptions = async (req: Request, res: Response) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    res.json(provider.availabilityExceptions);
  } catch (error) {
    console.error('Get availability exceptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

// Get reviews for a specific provider
export const getProviderReviews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find all completed appointments for this provider that have reviews
    const appointments = await Appointment.find({
      serviceProvider: id,
      status: 'completed',
      rating: { $exists: true }
    })
    .populate('customer', 'name')
    .select('rating review customer createdAt')
    .sort({ createdAt: -1 });

    // Transform the data to match the expected review format
    const reviews = appointments.map(appointment => ({
      _id: appointment._id,
      rating: appointment.rating,
      comment: appointment.review,
      customer: appointment.customer,
      createdAt: appointment.createdAt
    }));

    res.json(reviews);
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};