import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { Appointment } from '../models/Appointment';
import { ServiceProvider } from '../models/ServiceProvider';

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      serviceProviderId,
      serviceId,
      dateTime,
      notes
    } = req.body;

    // Get service provider and verify service exists
    const provider = await ServiceProvider.findById(serviceProviderId);
    if (!provider) {
      return res.status(404).json({ message: 'Service provider not found' });
    }

    const service = provider.services.find(s => s._id?.toString() === serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if the requested time slot is available
    const existingAppointment = await Appointment.findOne({
      serviceProvider: serviceProviderId,
      dateTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment
    const appointment = new Appointment({
      customer: req.user?._id,
      serviceProvider: serviceProviderId,
      service: {
        name: service.name,
        duration: service.duration,
        price: service.price
      },
      dateTime,
      notes
    });

    await appointment.save();

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('serviceProvider', 'businessName category location');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to view this appointment
    if (
      appointment.customer.toString() !== req.user?._id.toString() &&
      appointment.serviceProvider.toString() !== req.user?._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to view this appointment' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const getCustomerAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find({ customer: req.user?._id })
      .populate('serviceProvider', 'businessName category location')
      .sort({ dateTime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get customer appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProviderAppointments = async (req: Request, res: Response) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const appointments = await Appointment.find({ serviceProvider: provider._id })
      .populate('customer', 'name phone email')
      .sort({ dateTime: -1 });

    res.json(appointments);
  } catch (error) {
    console.error('Get provider appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to update this appointment
    const provider = await ServiceProvider.findOne({ userId: req.user?._id });
    if (
      appointment.customer.toString() !== req.user?._id.toString() &&
      (!provider || appointment.serviceProvider.toString() !== (provider._id as unknown as string).toString())
    ) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    // Validate status transition
    const validTransitions: { [key: string]: string[] } = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled'],
      completed: [],
      cancelled: []
    };

    if (!validTransitions[appointment.status].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${appointment.status} to ${status}`
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, review } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user is authorized to review this appointment
    if (appointment.customer.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this appointment' });
    }

    // Check if appointment is completed
    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments' });
    }

    // Check if already reviewed
    if (appointment.rating) {
      return res.status(400).json({ message: 'Appointment already reviewed' });
    }

    appointment.rating = rating;
    appointment.review = review;
    await appointment.save();

    // Update provider's average rating
    const provider = await ServiceProvider.findById(appointment.serviceProvider);
    if (provider) {
      const appointments = await Appointment.find({
        serviceProvider: provider._id,
        rating: { $exists: true }
      });

      const totalRatings = appointments.reduce((sum, apt) => sum + (apt.rating || 0), 0);
      provider.rating = totalRatings / appointments.length;
      provider.totalRatings = appointments.length;
      await provider.save();
    }

    res.json({
      message: 'Review added successfully',
      appointment
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  return;
}; 