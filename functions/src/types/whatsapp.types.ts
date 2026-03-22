export interface WhatsAppMessage {
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
  text?: {
    body: string;
  };
}

export interface BookingData {
  customerName: string;
  customerPhone: string;
  serviceName: string;
  staffName: string;
  date: string;
  time: string;
  businessName: string;
}

export type MessageType = typeof import('../config/constants').MESSAGE_TYPES[keyof typeof import('../config/constants').MESSAGE_TYPES];
