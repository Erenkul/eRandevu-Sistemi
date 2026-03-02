export const WHATSAPP_CONFIG = {
  API_URL: 'https://graph.facebook.com/v21.0',
  PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || 'erandevu_webhook_2025',
};

export const SMS_CONFIG = {
  API_URL: 'https://api.iletimerkezi.com/v1',
  API_KEY: process.env.SMS_API_KEY || '',
  SENDER: process.env.SMS_SENDER || 'ERANDEVU',
};

export const MESSAGE_TYPES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  REMINDER_24H: 'reminder_24h',
  REMINDER_2H: 'reminder_2h',
  CANCELLATION: 'cancellation',
} as const;
