// Shared test fixtures for hook tests
import type { Business, Service, Staff, Appointment, Customer } from '../types';

export const fakeTimestamp = {
  toDate: () => new Date('2025-01-01T10:00:00Z'),
  seconds: 1735725600,
  nanoseconds: 0,
};

const workingHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
  saturday: { isOpen: false, openTime: '10:00', closeTime: '16:00' },
  sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' },
};

export const mockBusiness: Business = {
  id: 'biz-1',
  name: 'Test Salon',
  slug: 'test-salon',
  ownerId: 'user-1',
  address: 'Test Cad. No:1',
  city: 'İstanbul',
  phone: '+905001234567',
  email: 'test@salon.com',
  workingHours,
  whatsappEnabled: true,
  smsEnabled: false,
  smsQuota: 100,
  smsUsed: 0,
  subscriptionTier: 'starter',
  subscriptionStatus: 'trial',
  onboardingCompleted: true,
  createdAt: fakeTimestamp as unknown as Business['createdAt'],
  updatedAt: fakeTimestamp as unknown as Business['updatedAt'],
};

export const mockService: Service = {
  id: 'srv-1',
  businessId: 'biz-1',
  name: 'Saç Kesimi',
  durationMinutes: 30,
  price: 150,
  category: 'Saç',
  isActive: true,
  order: 0,
  createdAt: fakeTimestamp as unknown as Service['createdAt'],
  updatedAt: fakeTimestamp as unknown as Service['updatedAt'],
};

export const mockService2: Service = {
  id: 'srv-2',
  businessId: 'biz-1',
  name: 'Saç Boyama',
  durationMinutes: 60,
  price: 300,
  category: 'Saç',
  isActive: false,
  order: 1,
  createdAt: fakeTimestamp as unknown as Service['createdAt'],
  updatedAt: fakeTimestamp as unknown as Service['updatedAt'],
};

export const mockStaff: Staff = {
  id: 'staff-1',
  businessId: 'biz-1',
  name: 'Ayşe Hanım',
  phone: '+905001234568',
  email: 'ayse@salon.com',
  role: 'barber',
  serviceIds: ['srv-1'],
  isActive: true,
  workingHours: {
    monday: { isWorking: true, startTime: '09:00', endTime: '18:00' },
  },
  createdAt: fakeTimestamp as unknown as Staff['createdAt'],
  updatedAt: fakeTimestamp as unknown as Staff['updatedAt'],
};

export const mockAppointment: Appointment = {
  id: 'appt-1',
  businessId: 'biz-1',
  staffId: 'staff-1',
  staffName: 'Ayşe Hanım',
  customerName: 'Ahmet Yılmaz',
  customerPhone: '+905551234567',
  services: [{ serviceId: 'srv-1', serviceName: 'Saç Kesimi', price: 150, durationMinutes: 30 }],
  totalPrice: 150,
  totalDurationMinutes: 30,
  status: 'confirmed',
  whatsappReminderEnabled: true,
  whatsappReminderSent: false,
  smsReminderEnabled: false,
  smsReminderSent: false,
  dateTime: fakeTimestamp as unknown as Appointment['dateTime'],
  createdAt: fakeTimestamp as unknown as Appointment['createdAt'],
  updatedAt: fakeTimestamp as unknown as Appointment['updatedAt'],
};

export const mockAppointmentPending: Appointment = {
  ...mockAppointment,
  id: 'appt-2',
  status: 'pending',
};

export const mockCustomer: Customer = {
  id: 'cust-1',
  businessId: 'biz-1',
  name: 'Ahmet Yılmaz',
  phone: '+905551234567',
  whatsappOptIn: true,
  smsOptIn: false,
  totalAppointments: 3,
  totalSpent: 450,
  createdAt: fakeTimestamp as unknown as Customer['createdAt'],
  updatedAt: fakeTimestamp as unknown as Customer['updatedAt'],
};
