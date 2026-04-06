import axios from 'axios';
import { SMS_CONFIG, SMS_RESPONSE_STATUS, SMS_ENDPOINTS } from '../config/constants';
import { BookingData } from '../types/whatsapp.types';

export class SMSService {
  private static instance: SMSService;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly sender: string;

  private constructor() {
    this.apiUrl = SMS_CONFIG.API_URL;
    this.apiKey = SMS_CONFIG.API_KEY;
    this.sender = SMS_CONFIG.SENDER;
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  async sendBookingConfirmation(data: BookingData): Promise<boolean> {
    const message = `${data.customerName} bey/hanım, ${data.date} saat ${data.time} ${data.businessName} için ${data.serviceName} randevunuz onaylanmıştır.`;
    return this.sendMessage(data.customerPhone, message);
  }

  async send24HourReminder(data: BookingData): Promise<boolean> {
    const message = `${data.customerName} bey/hanım, yarın saat ${data.time} ${data.serviceName} randevunuzun olduğunu hatırlatırız.`;
    return this.sendMessage(data.customerPhone, message);
  }

  async send2HourReminder(data: BookingData): Promise<boolean> {
    const message = `${data.customerName} bey/hanım, 2 saat sonra ${data.serviceName} randevunuz başlıyor.`;
    return this.sendMessage(data.customerPhone, message);
  }

  async sendCancellationNotice(data: BookingData): Promise<boolean> {
    const message = `${data.customerName} bey/hanım, ${data.date} ${data.time} ${data.serviceName} randevunuz iptal edilmiştir.`;
    return this.sendMessage(data.customerPhone, message);
  }

  private async sendMessage(to: string, message: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}${SMS_ENDPOINTS.SEND_SMS}`,
        {
          to,
          message,
          sender: this.sender
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.status === SMS_RESPONSE_STATUS.SUCCESS;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }
}
