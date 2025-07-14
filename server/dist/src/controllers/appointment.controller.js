"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.updateAppointmentStatus = exports.getProviderAppointments = exports.getCustomerAppointments = exports.getAppointment = exports.createAppointment = void 0;
const express_validator_1 = require("express-validator");
const Appointment_1 = require("../models/Appointment");
const ServiceProvider_1 = require("../models/ServiceProvider");
const createAppointment = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { serviceProviderId, serviceId, dateTime, notes } = req.body;
        const provider = await ServiceProvider_1.ServiceProvider.findById(serviceProviderId);
        if (!provider) {
            return res.status(404).json({ message: 'Service provider not found' });
        }
        const service = provider.services.find(s => { var _a; return ((_a = s._id) === null || _a === void 0 ? void 0 : _a.toString()) === serviceId; });
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        const existingAppointment = await Appointment_1.Appointment.findOne({
            serviceProvider: serviceProviderId,
            dateTime,
            status: { $in: ['pending', 'confirmed'] }
        });
        if (existingAppointment) {
            return res.status(400).json({ message: 'This time slot is already booked' });
        }
        const appointmentDate = new Date(dateTime);
        const appointmentDateString = appointmentDate.toISOString().split('T')[0];
        const availabilityException = provider.availabilityExceptions.find(exception => new Date(exception.date).toISOString().split('T')[0] === appointmentDateString);
        if (availabilityException && !availabilityException.isAvailable) {
            return res.status(400).json({ message: 'Provider is not available on this date' });
        }
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][appointmentDate.getDay()];
        const appointmentTime = appointmentDate.toTimeString().substring(0, 5);
        if (availabilityException && availabilityException.customHours) {
            const { open, close } = availabilityException.customHours;
            if (open && close && (appointmentTime < open || appointmentTime > close)) {
                return res.status(400).json({ message: 'Appointment time is outside of available hours for this date' });
            }
        }
        else {
            const workingHoursForDay = provider.workingHours.find(wh => wh.day === dayOfWeek);
            if (!workingHoursForDay || workingHoursForDay.isClosed ||
                (appointmentTime < workingHoursForDay.open || appointmentTime > workingHoursForDay.close)) {
                return res.status(400).json({ message: 'Appointment time is outside of provider\'s working hours' });
            }
        }
        const appointment = new Appointment_1.Appointment({
            customer: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
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
    }
    catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.createAppointment = createAppointment;
const getAppointment = async (req, res) => {
    var _a, _b;
    try {
        const appointment = await Appointment_1.Appointment.findById(req.params.id)
            .populate('customer', 'name phone email')
            .populate('serviceProvider', 'businessName category location');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.customer.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString()) &&
            appointment.serviceProvider.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to view this appointment' });
        }
        res.json(appointment);
    }
    catch (error) {
        console.error('Get appointment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getAppointment = getAppointment;
const getCustomerAppointments = async (req, res) => {
    var _a;
    try {
        const appointments = await Appointment_1.Appointment.find({ customer: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id })
            .populate('serviceProvider', 'businessName category location')
            .sort({ dateTime: -1 });
        res.json(appointments);
    }
    catch (error) {
        console.error('Get customer appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCustomerAppointments = getCustomerAppointments;
const getProviderAppointments = async (req, res) => {
    var _a;
    try {
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (!provider) {
            return res.status(404).json({ message: 'Provider profile not found' });
        }
        const appointments = await Appointment_1.Appointment.find({ serviceProvider: provider._id })
            .populate('customer', 'name phone email')
            .sort({ dateTime: -1 });
        res.json(appointments);
    }
    catch (error) {
        console.error('Get provider appointments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.getProviderAppointments = getProviderAppointments;
const updateAppointmentStatus = async (req, res) => {
    var _a, _b;
    try {
        const { status } = req.body;
        const appointment = await Appointment_1.Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        const provider = await ServiceProvider_1.ServiceProvider.findOne({ userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id });
        if (appointment.customer.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()) &&
            (!provider || appointment.serviceProvider.toString() !== provider._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to update this appointment' });
        }
        const validTransitions = {
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
    }
    catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.updateAppointmentStatus = updateAppointmentStatus;
const addReview = async (req, res) => {
    var _a;
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { rating, review } = req.body;
        const appointment = await Appointment_1.Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (appointment.customer.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to review this appointment' });
        }
        if (appointment.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed appointments' });
        }
        if (appointment.rating) {
            return res.status(400).json({ message: 'Appointment already reviewed' });
        }
        appointment.rating = rating;
        appointment.review = review;
        await appointment.save();
        const provider = await ServiceProvider_1.ServiceProvider.findById(appointment.serviceProvider);
        if (provider) {
            const appointments = await Appointment_1.Appointment.find({
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
    }
    catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
    return;
};
exports.addReview = addReview;
//# sourceMappingURL=appointment.controller.js.map