import { IUser } from '../models/User';
import { IAppointment } from '../models/Appointment';
import twilio from 'twilio';

export enum NotificationType {
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  NEW_REVIEW = 'NEW_REVIEW'
}

class NotificationService {
  private twilioClient: twilio.Twilio | null = null; // Private Twilio client instance

  private getTwilioClient(): twilio.Twilio {
    if (this.twilioClient) {
      return this.twilioClient;
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.error('Twilio credentials (Account SID or Auth Token) are not set. Cannot initialize Twilio client.');
      throw new Error('Twilio credentials missing.');
    }

    this.twilioClient = twilio(accountSid, authToken);
    return this.twilioClient;
  }

  // FIX: Change to public so it can be called from auth.controller.ts
  public async sendSMS(to: string, message: string): Promise<void> {
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
    } catch (error: any) {
      console.error(`Error sending SMS to ${to}:`, error.message);
      throw error;
    }
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