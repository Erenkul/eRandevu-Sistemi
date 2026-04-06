import axios from 'axios';
import { WHATSAPP_CONFIG, WHATSAPP_TEMPLATE_NAMES, WHATSAPP_LANGUAGE } from '../config/constants';
import { WhatsAppMessage, BookingData } from '../types/whatsapp.types';

export class WhatsAppService {
  private static instance: WhatsAppService;
  private readonly apiUrl: string;
  private readonly phoneNumberId: string;
  private readonly accessToken: string;

  private constructor() {
    this.apiUrl = WHATSAPP_CONFIG.API_URL;
    this.phoneNumberId = WHATSAPP_CONFIG.PHONE_NUMBER_ID;
    this.accessToken = WHATSAPP_CONFIG.ACCESS_TOKEN;
  }

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          ...message,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('WhatsApp message sent successfully:', response.data);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendBookingConfirmation(data: BookingData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: data.customerPhone,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAMES.BOOKING_CONFIRMATION,
        language: { code: WHATSAPP_LANGUAGE },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.serviceName },
              { type: 'text', text: data.date },
              { type: 'text', text: data.time },
              { type: 'text', text: data.businessName },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  async send24HourReminder(data: BookingData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: data.customerPhone,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAMES.REMINDER_24H,
        language: { code: WHATSAPP_LANGUAGE },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.serviceName },
              { type: 'text', text: data.date },
              { type: 'text', text: data.time },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  async send2HourReminder(data: BookingData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: data.customerPhone,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAMES.REMINDER_2H,
        language: { code: WHATSAPP_LANGUAGE },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.serviceName },
              { type: 'text', text: data.time },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  async sendCancellationNotice(data: BookingData): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: data.customerPhone,
      type: 'template',
      template: {
        name: WHATSAPP_TEMPLATE_NAMES.CANCELLATION,
        language: { code: WHATSAPP_LANGUAGE },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: data.customerName },
              { type: 'text', text: data.serviceName },
              { type: 'text', text: data.date },
              { type: 'text', text: data.time },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }
}
