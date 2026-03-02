import * as admin from 'firebase-admin';

export interface ServiceItem {
    name?: string;
    serviceName?: string;
    durationMinutes: number;
    price: number;
}

export interface Appointment {
    id?: string;
    businessId: string;
    staffId: string;
    staffName: string;
    customerName: string;
    customerPhone: string;
    services: ServiceItem[];
    dateTime: admin.firestore.Timestamp;
    totalDurationMinutes: number;
    totalPrice: number;
    status: 'pending' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled' | 'noShow';
    whatsappReminderEnabled?: boolean;
    whatsappReminderSent?: boolean;
    smsReminderEnabled?: boolean;
    smsReminderSent?: boolean;
    cancellationReason?: string;
}

export type MessageType = 'appointment_confirmation' | 'appointment_cancelled' | 'appointment_reminder' | 'appointment_confirmed';

export interface WhatsAppNotificationData {
    customerName: string;
    businessName: string;
    dateTime: Date;
    services?: string;
    staffName?: string;
    appointmentId?: string;
    bookingUrl?: string;
}

export interface WhatsAppPayload {
    phone: string;
    type: MessageType;
    data: WhatsAppNotificationData;
}
