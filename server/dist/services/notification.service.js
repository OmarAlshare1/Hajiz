"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationType = void 0;
const twilio_1 = __importDefault(require("twilio"));
var NotificationType;
(function (NotificationType) {
    NotificationType["APPOINTMENT_BOOKED"] = "APPOINTMENT_BOOKED";
    NotificationType["APPOINTMENT_CONFIRMED"] = "APPOINTMENT_CONFIRMED";
    NotificationType["APPOINTMENT_CANCELLED"] = "APPOINTMENT_CANCELLED";
    NotificationType["APPOINTMENT_REMINDER"] = "APPOINTMENT_REMINDER";
    NotificationType["NEW_REVIEW"] = "NEW_REVIEW";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
class NotificationService {
    constructor() {
        this.twilioClient = null;
    }
    getTwilioClient() {
        if (this.twilioClient) {
            return this.twilioClient;
        }
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        if (!accountSid || !authToken) {
            console.error('Twilio credentials (Account SID or Auth Token) are not set. Cannot initialize Twilio client.');
            throw new Error('Twilio credentials missing.');
        }
        this.twilioClient = (0, twilio_1.default)(accountSid, authToken);
        return this.twilioClient;
    }
    async sendSMS(to, message) {
        const from = process.env.TWILIO_PHONE_NUMBER;
        if (!from) {
            console.error('Twilio Phone Number is not set. Cannot send SMS.');
            throw new Error('Twilio Phone Number missing.');
        }
        try {
            const client = this.getTwilioClient();
            await client.messages.create({
                body: message,
                from: from,
                to: to
            });
            console.log(`SMS sent to ${to}: ${message}`);
        }
        catch (error) {
            console.error(`Error sending SMS to ${to}:`, error.message);
            throw error;
        }
    }
    async sendEmail(email, subject, message) {
        console.log(`Email to ${email}: ${subject} - ${message}`);
    }
    async sendPushNotification(userId, title, message) {
        console.log(`Push notification to ${userId}: ${title} - ${message}`);
    }
    formatAppointmentTime(dateTime) {
        return new Intl.DateTimeFormat('ar-SY', {
            dateStyle: 'full',
            timeStyle: 'short'
        }).format(dateTime);
    }
    async sendAppointmentNotification(type, recipient, appointment) {
        const formattedTime = this.formatAppointmentTime(appointment.dateTime);
        let message = '';
        switch (type) {
            case NotificationType.APPOINTMENT_BOOKED:
                message = `تم حجز موعد جديد في ${formattedTime}`;
                break;
            case NotificationType.APPOINTMENT_CONFIRMED:
                message = `تم تأكيد موعدك في ${formattedTime}`;
                break;
            case NotificationType.APPOINTMENT_CANCELLED:
                message = `تم إلغاء الموعد في ${formattedTime}`;
                break;
            case NotificationType.APPOINTMENT_REMINDER:
                message = `تذكير: لديك موعد غداً في ${formattedTime}`;
                break;
            default:
                return;
        }
        try {
            if (recipient.phone) {
                await this.sendSMS(recipient.phone, message);
            }
            if (recipient.email) {
                await this.sendEmail(recipient.email, 'إشعار من تطبيق حاجز', message);
            }
            const rec = recipient;
            if (rec &&
                typeof rec === 'object' &&
                '_id' in rec &&
                typeof rec._id === 'object') {
                await this.sendPushNotification(rec._id.toString(), 'إشعار من تطبيق حاجز', message);
            }
        }
        catch (error) {
            console.error('Failed to send notification:', error);
        }
    }
    async sendReviewNotification(provider, appointmentId, rating) {
        const message = `تم إضافة تقييم جديد (${rating} نجوم) على موعد #${appointmentId}`;
        try {
            if (provider.phone) {
                await this.sendSMS(provider.phone, message);
            }
            if (provider.email) {
                await this.sendEmail(provider.email, 'تقييم جديد - حاجز', message);
            }
            const prov = provider;
            if (prov &&
                typeof prov === 'object' &&
                '_id' in prov &&
                typeof prov._id === 'object') {
                await this.sendPushNotification(prov._id.toString(), 'تقييم جديد', message);
            }
        }
        catch (error) {
            console.error('Failed to send review notification:', error);
        }
    }
}
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map