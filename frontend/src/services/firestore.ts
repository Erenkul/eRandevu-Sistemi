// ===========================================
// eRandevu - Firestore Service
// ===========================================

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import type {
  QueryConstraint,
  Unsubscribe,
} from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import type {
  Business,
  Service,
  Staff,
  Appointment,
  Customer,
  ServiceFormData,
  StaffFormData,
  BookingFormData,
} from '../types';

// ============ BUSINESS OPERATIONS ============

export async function getBusiness(businessId: string): Promise<Business | null> {
  const docRef = doc(db, COLLECTIONS.BUSINESSES, businessId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Business;
  }
  return null;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const q = query(
    collection(db, COLLECTIONS.BUSINESSES),
    where('slug', '==', slug),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Business;
  }
  return null;
}

export async function getAllBusinesses(): Promise<Business[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.BUSINESSES));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Business));
}

export async function updateBusiness(businessId: string, data: Partial<Business>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BUSINESSES, businessId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ============ SERVICE OPERATIONS ============

export async function getServices(businessId: string): Promise<Service[]> {
  const q = query(
    collection(db, COLLECTIONS.SERVICES),
    where('businessId', '==', businessId),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
}

export async function getAllServices(businessId: string): Promise<Service[]> {
  const q = query(
    collection(db, COLLECTIONS.SERVICES),
    where('businessId', '==', businessId),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
}

export async function createService(businessId: string, data: ServiceFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.SERVICES), {
    businessId,
    ...data,
    order: 0, // Will be updated
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateService(serviceId: string, data: Partial<ServiceFormData>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.SERVICES, serviceId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(serviceId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.SERVICES, serviceId));
}

// ============ STAFF OPERATIONS ============

export async function getStaff(businessId: string): Promise<Staff[]> {
  const q = query(
    collection(db, COLLECTIONS.STAFF),
    where('businessId', '==', businessId),
    where('isActive', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
}

export async function getAllStaff(businessId: string): Promise<Staff[]> {
  const q = query(
    collection(db, COLLECTIONS.STAFF),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
}

export async function createStaff(businessId: string, data: StaffFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTIONS.STAFF), {
    businessId,
    ...data,
    isActive: true,
    workingHours: getDefaultWorkingHours(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateStaff(staffId: string, data: Partial<Staff>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STAFF, staffId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStaff(staffId: string): Promise<void> {
  // Soft delete - just mark as inactive
  await updateStaff(staffId, { isActive: false });
}

// ============ APPOINTMENT OPERATIONS ============

export async function getAppointments(
  businessId: string,
  filters?: {
    staffId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Appointment[]> {
  const constraints: QueryConstraint[] = [
    where('businessId', '==', businessId),
  ];

  if (filters?.staffId) {
    constraints.push(where('staffId', '==', filters.staffId));
  }
  if (filters?.status) {
    constraints.push(where('status', '==', filters.status));
  }
  if (filters?.startDate) {
    constraints.push(where('dateTime', '>=', Timestamp.fromDate(filters.startDate)));
  }
  if (filters?.endDate) {
    constraints.push(where('dateTime', '<=', Timestamp.fromDate(filters.endDate)));
  }

  constraints.push(orderBy('dateTime', 'asc'));

  const q = query(collection(db, COLLECTIONS.APPOINTMENTS), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
}

export async function getTodayAppointments(businessId: string): Promise<Appointment[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getAppointments(businessId, {
    startDate: today,
    endDate: tomorrow,
  });
}

export async function createAppointment(data: BookingFormData & { businessId: string; staffName: string }): Promise<string> {
  const services = data.services.map(s => ({
    serviceId: s.id,
    serviceName: s.name,
    durationMinutes: s.durationMinutes,
    price: s.price,
  }));

  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

  const docRef = await addDoc(collection(db, COLLECTIONS.APPOINTMENTS), {
    businessId: data.businessId,
    staffId: data.staffId,
    staffName: data.staffName,
    customerName: data.customerName,
    customerPhone: formatPhoneNumber(data.customerPhone),
    customerEmail: data.customerEmail || null,
    customerNote: data.customerNote || null,
    services,
    dateTime: Timestamp.fromDate(data.dateTime),
    totalDurationMinutes: totalDuration,
    totalPrice,
    status: 'pending',
    whatsappReminderEnabled: true,
    whatsappReminderSent: false,
    smsReminderEnabled: false,
    smsReminderSent: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  cancellationReason?: string
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);
  const updateData: Record<string, any> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === 'cancelled' && cancellationReason) {
    updateData.cancellationReason = cancellationReason;
  }

  await updateDoc(docRef, updateData);
}

// Fetch all appointments for a specific customer phone number (customer-facing)
export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
  const formattedPhone = formatPhoneNumber(phone);
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('customerPhone', '==', formattedPhone),
    orderBy('dateTime', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
}

// Real-time listener for appointments
export function subscribeToAppointments(
  businessId: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('businessId', '==', businessId),
    where('dateTime', '>=', Timestamp.fromDate(today)),
    orderBy('dateTime', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Appointment));
    callback(appointments);
  });
}

// ============ CUSTOMER OPERATIONS ============

export async function getCustomers(businessId: string): Promise<Customer[]> {
  const q = query(
    collection(db, COLLECTIONS.CUSTOMERS),
    where('businessId', '==', businessId),
    orderBy('name', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
}

export async function getCustomerByPhone(businessId: string, phone: string): Promise<Customer | null> {
  const formattedPhone = formatPhoneNumber(phone);
  const q = query(
    collection(db, COLLECTIONS.CUSTOMERS),
    where('businessId', '==', businessId),
    where('phone', '==', formattedPhone),
    limit(1)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Customer;
  }
  return null;
}

export async function createOrUpdateCustomer(
  businessId: string,
  data: { name: string; phone: string; email?: string }
): Promise<string> {
  const formattedPhone = formatPhoneNumber(data.phone);
  const existing = await getCustomerByPhone(businessId, formattedPhone);

  if (existing) {
    // Update existing customer
    await updateDoc(doc(db, COLLECTIONS.CUSTOMERS, existing.id), {
      name: data.name,
      email: data.email || existing.email,
      updatedAt: serverTimestamp(),
    });
    return existing.id;
  }

  // Create new customer
  const docRef = await addDoc(collection(db, COLLECTIONS.CUSTOMERS), {
    businessId,
    name: data.name,
    phone: formattedPhone,
    email: data.email || null,
    whatsappOptIn: true,
    smsOptIn: false,
    totalAppointments: 0,
    totalSpent: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ============ HELPER FUNCTIONS ============

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If starts with 0, replace with +90
  if (digits.startsWith('0')) {
    return '+90' + digits.slice(1);
  }

  // If starts with 90, add +
  if (digits.startsWith('90') && digits.length === 12) {
    return '+' + digits;
  }

  // If 10 digits (without country code), add +90
  if (digits.length === 10) {
    return '+90' + digits;
  }

  // Already formatted or unknown format
  return phone.startsWith('+') ? phone : '+' + digits;
}

function getDefaultWorkingHours() {
  const defaultDay = {
    isWorking: true,
    startTime: '09:00',
    endTime: '18:00',
  };

  return {
    monday: defaultDay,
    tuesday: defaultDay,
    wednesday: defaultDay,
    thursday: defaultDay,
    friday: defaultDay,
    saturday: { ...defaultDay, endTime: '17:00' },
    sunday: { isWorking: false, startTime: '09:00', endTime: '18:00' },
  };
}

// ============ AVAILABILITY CHECK ============

export async function getAvailableSlots(
  businessId: string,
  staffId: string,
  date: Date,
  durationMinutes: number
): Promise<string[]> {
  // Get business working hours
  const business = await getBusiness(businessId);
  if (!business) return [];

  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[date.getDay()] as keyof typeof business.workingHours;
  const workingHours = business.workingHours[dayOfWeek];

  if (!workingHours || !workingHours.isOpen) return [];

  // Get existing appointments for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await getAppointments(businessId, {
    staffId,
    startDate: startOfDay,
    endDate: endOfDay,
  });

  // Filter out cancelled appointments
  const activeAppointments = appointments.filter(
    apt => apt.status !== 'cancelled' && apt.status !== 'noShow'
  );

  // Calculate available slots
  const slots: string[] = [];
  const [openHour, openMin] = workingHours.openTime.split(':').map(Number);
  const [closeHour, closeMin] = workingHours.closeTime.split(':').map(Number);

  const currentTime = new Date(date);
  currentTime.setHours(openHour, openMin, 0, 0);

  const closeTime = new Date(date);
  closeTime.setHours(closeHour, closeMin, 0, 0);

  const now = new Date();

  while (currentTime.getTime() + durationMinutes * 60000 <= closeTime.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

    // Check if slot is in the past
    if (currentTime <= now) {
      currentTime.setTime(currentTime.getTime() + 30 * 60000);
      continue;
    }

    // Check for conflicts
    const hasConflict = activeAppointments.some(apt => {
      const aptStart = apt.dateTime.toDate();
      const aptEnd = new Date(aptStart.getTime() + apt.totalDurationMinutes * 60000);
      return currentTime < aptEnd && slotEnd > aptStart;
    });

    if (!hasConflict) {
      slots.push(currentTime.toISOString());
    }

    currentTime.setTime(currentTime.getTime() + 30 * 60000); // 30 minute intervals
  }

  return slots;
}
