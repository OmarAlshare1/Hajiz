import { IUser } from '../models/User';
import { IAppointment } from '../models/Appointment';
import axios from 'axios';

export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  NEW_REVIEW = 'NEW_REVIEW'
}

class NotificationService {
  private aiSensyApiKey: string | null = null;
  private aiSensyBaseUrl = 'https://backend.aisensy.com/campaign/t1/api/v2';

  private getAiSensyApiKey(): string {
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

  // Send SMS using AiSensy (Note: AiSensy primarily focuses on WhatsApp, SMS might not be available)
  public async sendSMS(to: string, message: string): Promise<void> {
    // For now, we'll redirect SMS to WhatsApp since AiSensy is WhatsApp-focused
    console.log(`Redirecting SMS to WhatsApp for ${to}: ${message}`);
    await this.sendWhatsApp(to, message);
  }

  // Send WhatsApp message using AiSensy API
  public async sendWhatsApp(to: string, message: string): Promise<void> {
    try {
      const apiKey = this.getAiSensyApiKey();
      const campaignName = process.env.AISENSY_CAMPAIGN_NAME || 'verification_campaign';
      
      // Format phone number - remove whatsapp: prefix if present
      const phoneNumber = to.replace('whatsapp:', '');
      
      // Ensure phone number has country code
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const payload = {
        apiKey: apiKey,
        campaignName: campaignName,
        destination: formattedNumber,
        userName: 'User', // Default name, can be customized
        templateParams: [message], // For simple text templates
        source: 'Hajiz App'
      };

      const response = await axios.post(this.aiSensyBaseUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        console.log(`WhatsApp message sent via AiSensy to ${formattedNumber}: ${message}`);
      } else {
        throw new Error(`AiSensy API returned status ${response.status}`);
      }
    } catch (error: any) {
      console.error(`Error sending WhatsApp message via AiSensy to ${to}:`, error.message);
      throw error;
    }
  }

  // Generate a 6-digit verification code
  public generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification code via WhatsApp
  public async sendVerificationCode(
    phoneNumber: string, 
    code: string, 
    type: 'login' | 'register' | 'password_reset',
    language: 'ar' | 'en' = 'ar'
  ): Promise<void> {
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
    } else {
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

  private async sendEmail(email: string, subject: string, message: string): Promise<void> {
    // TODO: Implement email sending using a service like SendGrid
    console.log(`Email to ${email}: ${subject} - ${message}`);
  }

  private async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    // TODO: Implement push notifications using a service like Firebase Cloud Messaging
    console.log(`Push notification to ${userId}: ${title} - ${message}`);
  }

  private formatAppointmentTime(dateTime: Date): string {
    return new Intl.DateTimeFormat('ar-SY', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(dateTime);
  }

  public async sendAppointmentNotification(
    type: NotificationType,
    recipient: IUser,
    appointment: IAppointment
  ): Promise<void> {
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
        await this.sendEmail(
          recipient.email,
          'إشعار من تطبيق حجز',
          message
        );
      }

      const rec: any = recipient;
      if (
        rec &&
        typeof rec === 'object' &&
        '_id' in rec &&
        typeof rec._id === 'object'
      ) {
        await this.sendPushNotification(
          rec._id.toString(),
          'إشعار من تطبيق حجز',
          message
        );
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  public async sendReviewNotification(
    provider: IUser,
    appointmentId: string,
    rating: number
  ): Promise<void> {
    const message = `تم إضافة تقييم جديد (${rating} نجوم) على موعد #${appointmentId}`;

    try {
      if (provider.phone) {
        await this.sendSMS(provider.phone, message);
      }

      if (provider.email) {
        await this.sendEmail(
          provider.email,
          'تقييم جديد - حجز',
          message
        );
      }

      const prov: any = provider;
      if (
        prov &&
        typeof prov === 'object' &&
        '_id' in prov &&
        typeof prov._id === 'object'
      ) {
        await this.sendPushNotification(
          prov._id.toString(),
          'تقييم جديد',
          message
        );
      }
    } catch (error) {
      console.error('Failed to send review notification:', error);
    }
  }
}

export const notificationService = new NotificationService();