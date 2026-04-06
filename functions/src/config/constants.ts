export const WHATSAPP_CONFIG = {
  API_URL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v21.0',
  PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || '',
  VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || '',
};

export const SMS_CONFIG = {
  API_URL: process.env.SMS_API_URL || 'https://api.iletimerkezi.com/v1',
  API_KEY: process.env.SMS_API_KEY || '',
  SENDER: process.env.SMS_SENDER || '',
};

export const MESSAGE_TYPES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  REMINDER_24H: 'reminder_24h',
  REMINDER_2H: 'reminder_2h',
  CANCELLATION: 'cancellation',
} as const;

export const WHATSAPP_TEMPLATE_NAMES = {
  BOOKING_CONFIRMATION: 'booking_confirmation',
  REMINDER_24H: 'reminder_24h',
  REMINDER_2H: 'reminder_2h',
  CANCELLATION: 'cancellation_notice',
} as const;

export const WHATSAPP_LANGUAGE = 'tr';

export const COLLECTIONS = {
  APPOINTMENTS: 'appointments',
  USERS: 'users',
} as const;

export const FIRESTORE_FIELDS = {
  DATE_TIME: 'dateTime',
  STATUS: 'status',
  REMINDER_SENT_24H: 'reminderSent24h',
  REMINDER_SENT_24H_AT: 'reminderSent24hAt',
  REMINDER_SENT_2H: 'reminderSent2h',
  REMINDER_SENT_2H_AT: 'reminderSent2hAt',
} as const;

export const APPOINTMENT_STATUS = {
  CONFIRMED: 'confirmed',
} as const;

export const TIME_CONSTANTS = {
  TWENTY_FOUR_HOURS_MS: 24 * 60 * 60 * 1000,
  TWO_HOURS_MS: 2 * 60 * 60 * 1000,
} as const;

export const SCHEDULES = {
  REMINDER_24H_CHECK: 'every 1 hours',
  REMINDER_2H_CHECK: 'every 30 minutes',
} as const;

export const SMS_RESPONSE_STATUS = {
  SUCCESS: 'success',
} as const;

export const SMS_ENDPOINTS = {
  SEND_SMS: '/send-sms',
} as const;

export const WEBHOOK_PARAMS = {
  HUB_MODE: 'hub.mode',
  HUB_VERIFY_TOKEN: 'hub.verify_token',
  HUB_CHALLENGE: 'hub.challenge',
} as const;

export const WEBHOOK_MODE = {
  SUBSCRIBE: 'subscribe',
} as const;
