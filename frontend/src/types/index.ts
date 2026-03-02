// ===========================================
// eRandevu - TypeScript Type Definitions
// ===========================================

import { Timestamp } from 'firebase/firestore';

// ============ BUSINESS ============
export interface WorkingHours {
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
}

export interface Business {
  id: string;
  name: string;
  slug: string; // URL-friendly name: "saloon-tema"
  ownerId: string;
  description?: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  workingHours: {
    monday: WorkingHours;
    tuesday: WorkingHours;
    wednesday: WorkingHours;
    thursday: WorkingHours;
    friday: WorkingHours;
    saturday: WorkingHours;
    sunday: WorkingHours;
  };
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  smsQuota: number;
  smsUsed: number;
  subscriptionTier: 'starter' | 'professional' | 'business';
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'cancelled';
  trialEndsAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ SERVICE ============
export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  isActive: boolean;
  order: number; // Sıralama için
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ STAFF ============
export interface StaffWorkingHours {
  [day: string]: {
    isWorking: boolean;
    startTime: string;
    endTime: string;
    breakStart?: string;
    breakEnd?: string;
  };
}

export interface Staff {
  id: string;
  businessId: string;
  userId?: string; // Firebase Auth ile bağlıysa
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role: 'owner' | 'barber' | 'assistant';
  serviceIds: string[]; // Yapabildiği hizmetler
  workingHours: StaffWorkingHours;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ CUSTOMER ============
export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string; // E.164 format: +905551234567
  email?: string;
  notes?: string;
  whatsappOptIn: boolean; // WhatsApp izni
  smsOptIn: boolean; // SMS izni
  totalAppointments: number;
  totalSpent: number;
  lastVisit?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ APPOINTMENT ============
export type AppointmentStatus =
  | 'pending'    // Bekliyor
  | 'confirmed'  // Onaylandı
  | 'inProgress' // Devam ediyor
  | 'completed'  // Tamamlandı
  | 'cancelled'  // İptal edildi
  | 'noShow';    // Gelmedi

export interface AppointmentService {
  serviceId: string;
  serviceName: string;
  durationMinutes: number;
  price: number;
}

export interface Appointment {
  id: string;
  businessId: string;
  staffId: string;
  staffName: string;
  customerId?: string; // Kayıtlı müşteri ise
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNote?: string;
  services: AppointmentService[];
  dateTime: Timestamp; // Randevu başlangıç zamanı
  totalDurationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  cancellationReason?: string;
  whatsappReminderEnabled: boolean;
  whatsappReminderSent: boolean;
  smsReminderEnabled: boolean;
  smsReminderSent: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============ NOTIFICATION ============
export type NotificationType =
  | 'appointment_confirmation'
  | 'appointment_reminder_24h'
  | 'appointment_reminder_1h'
  | 'appointment_cancelled'
  | 'appointment_confirmed';

export type NotificationChannel = 'whatsapp' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  businessId: string;
  appointmentId: string;
  customerId?: string;
  customerPhone: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  errorMessage?: string;
  scheduledAt: Timestamp;
  sentAt?: Timestamp;
  createdAt: Timestamp;
}

// ============ USER (Auth) ============
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  businessId?: string; // İşletme sahibi ise
  role: 'admin' | 'staff' | 'customer';
}

// ============ DAILY STATS ============
export interface DailyStats {
  date: Timestamp;
  totalRevenue: number;
  appointmentCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  averageRevenue: number;
}

// ============ FORM TYPES ============
export interface BookingFormData {
  services: Service[];
  staffId: string;
  dateTime: Date;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerNote?: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  category?: string;
  isActive: boolean;
}

export interface StaffFormData {
  name: string;
  phone?: string;
  email?: string;
  role: 'owner' | 'barber' | 'assistant';
  serviceIds: string[];
}
