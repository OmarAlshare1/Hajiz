"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationType = void 0;
const axios_1 = __importDefault(require("axios"));
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
        this.aiSensyApiKey = null;
        this.aiSensyBaseUrl = 'https://backend.aisensy.com/campaign/t1/api/v2';
    }
    getAiSensyApiKey() {
        if (this.aiSensyApiKey) {
            return this.aiSensyApiKey;
        }
        const apiKey = process.env.AISENSY_API_KEY;
        if (!apiKey) {
            console.error('AiSensy API key is not set. Cannot send WhatsApp messages.');
            throw new Error('AiSensy API key missing.');
        }
        this.aiSensyApiKey = apiKey;
        return this.aiSensyApiKey;
    }
    async sendSMS(to, message) {
        console.log(`Redirecting SMS to WhatsApp for ${to}: ${message}`);
        await this.sendWhatsApp(to, message);
    }
    async sendWhatsApp(to, message) {
        try {
            const apiKey = this.getAiSensyApiKey();
            const campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'verification_campaign';
            const phoneNumber = to.replace('whatsapp:', '');
            const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            const payload = {
                apiKey: apiKey,
                campaignName: campaignName,
                destination: formattedNumber,
                userName: 'User',
                templateParams: [message],
                source: 'Hajiz App'
            };
            const response = await axios_1.default.post(this.aiSensyBaseUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                console.log(`WhatsApp message sent via AiSensy to ${formattedNumber}: ${message}`);
            }
            else {
                throw new Error(`AiSensy API returned status ${response.status}`);
            }
        }
        catch (error) {
            console.error(`Error sending WhatsApp message via AiSensy to ${to}:`, error.message);
            throw error;
        }
    }
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendVerificationCode(phoneNumber, code, type, language = 'ar') {
        let message = '';
        if (language === 'ar') {
            switch (type) {
                case 'register':
                    message = `مرحباً بك في حجز! رمز التحقق الخاص بك هو: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\n\nإذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`;
                    break;
                case 'login':
                    message = `رمز تسجيل الدخول إلى حجز: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\n\nإذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`;
                    break;
                case 'password_reset':
                    message = `رمز إعادة تعيين كلمة المرور لحساب حجز: ${code}\n\nهذا الرمز صالح لمدة 10 دقائق فقط.\n\nإذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.`;
                    break;
            }
        }
        else {
            switch (type) {
                case 'register':
                    message = `Welcome to Hajiz! Your verification code is: ${code}\n\nThis code is valid for 10 minutes only.\n\nIf you didn't request this code, please ignore this message.`;
                    break;
                case 'login':
                    message = `Your Hajiz login verification code: ${code}\n\nThis code is valid for 10 minutes only.\n\nIf you didn't request this code, please ignore this message.`;
                    break;
                case 'password_reset':
                    message = `Your Hajiz password reset code: ${code}\n\nThis code is valid for 10 minutes only.\n\nIf you didn't request this code, please ignore this message.`;
                    break;
            }
        }
        await this.sendWhatsApp(phoneNumber, message);
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
                await this.sendEmail(recipient.email, 'إشعار من تطبيق حجز', message);
            }
            const rec = recipient;
            if (rec &&
                typeof rec === 'object' &&
                '_id' in rec &&
                typeof rec._id === 'object') {
                await this.sendPushNotification(rec._id.toString(), 'إشعار من تطبيق حجز', message);
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
                await this.sendEmail(provider.email, 'تقييم جديد - حجز', message);
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