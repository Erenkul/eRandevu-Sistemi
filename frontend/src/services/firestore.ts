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
  runTransaction,
} from 'firebase/firestore';
import type {
  Unsubscribe,
  QueryConstraint,
} from 'firebase/firestore';
import { db, COLLECTIONS, auth } from '../lib/firebase';
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

interface DailyScheduleAppointment {
  appointmentId: string;
  startTime: number;
  durationMinutes: number;
}

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
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  const allServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  return allServices
    .filter(s => s.isActive)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getAllServices(businessId: string): Promise<Service[]> {
  const q = query(
    collection(db, COLLECTIONS.SERVICES),
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  const allServices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
  return allServices.sort((a, b) => (a.order || 0) - (b.order || 0));
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
    where('businessId', '==', businessId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Staff))
    .filter(staff => staff.isActive);
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

// ============ APPOINTMENT NOTIFICATION HELPER ============

async function notifyAppointmentStatusChange(
  appointmentId: string,
  appointmentData: Partial<Appointment>,
  newStatus: string,
  cancelledByCustomer: boolean
): Promise<void> {
  try {
    const { createNotification } = await import('./notifications');

    if (newStatus === 'cancelled') {
      if (!appointmentData.businessId) {
        console.log('[Notify] No businessId for cancellation notification');
        return;
      }
      const businessSnap = await getDoc(doc(db, COLLECTIONS.BUSINESSES, appointmentData.businessId));
      if (businessSnap.exists()) {
        const businessOwnerId = businessSnap.data().ownerId;
        console.log('[Notify] Creating cancellation notification for owner:', businessOwnerId);
        await createNotification({
          userId: businessOwnerId,
          type: 'appointment_cancelled',
          title: 'Randevu İptal Edildi',
          message: cancelledByCustomer
            ? `${appointmentData.customerName} randevuyu iptal etti.`
            : 'Bir randevu iptal edildi.',
          appointmentId,
          businessId: appointmentData.businessId,
        });
      }
      return;
    }

    if (!appointmentData.customerId) {
      console.log('[Notify] No customerId for status notification:', newStatus);
      return;
    }

    let title = '';
    let message = '';

    switch (newStatus) {
      case 'confirmed':
        title = 'Randevunuz Onaylandı';
        message = `Randevunuz ${appointmentData.staffName} tarafından onaylandı.`;
        break;
      case 'completed':
        title = 'Randevunuz Tamamlandı';
        message = `Randevunuz başarıyla tamamlandı.`;
        break;
      default:
        return;
    }

    console.log('[Notify] Creating notification for customer:', appointmentData.customerId, newStatus);
    await createNotification({
      userId: appointmentData.customerId,
      type: newStatus === 'confirmed' ? 'appointment_confirmed' : 'appointment_completed',
      title,
      message,
      appointmentId,
      businessId: appointmentData.businessId as string,
    });
  } catch (error) {
    console.error('[Notify] Error creating notification:', error);
  }
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
  const queryConstraints: QueryConstraint[] = [where('businessId', '==', businessId)];

  // NATIVE FIRESTORE FİLTRELEME (Okuma Maliyetlerini Dramatik Düşürür)
  if (filters?.staffId) {
    queryConstraints.push(where('staffId', '==', filters.staffId));
  }
  if (filters?.status) {
    queryConstraints.push(where('status', '==', filters.status));
  }
  if (filters?.startDate) {
    queryConstraints.push(where('dateTime', '>=', Timestamp.fromDate(filters.startDate)));
  }
  if (filters?.endDate) {
    queryConstraints.push(where('dateTime', '<=', Timestamp.fromDate(filters.endDate)));
  }

  const q = query(collection(db, COLLECTIONS.APPOINTMENTS), ...queryConstraints);
  const snapshot = await getDocs(q);

  const appointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  return appointments.sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());
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

  // Firestore Web SDK'sında Transaction içinde query yapılamaz.
  // Bu yüzden çakışmaları (race condition) o güne ait tek bir "gölge" dokümanı okuyarak çözüyoruz.
  const appointmentDate = new Date(data.dateTime);
  const utcDate = new Date(appointmentDate.getTime() - (appointmentDate.getTimezoneOffset() * 60000));
  const dateString = utcDate.toISOString().split('T')[0];

  const dailyScheduleRef = doc(db, 'daily_schedules', `${data.businessId}_${data.staffId}_${dateString}`);
  const appointmentRef = doc(collection(db, COLLECTIONS.APPOINTMENTS)); // Henüz kaydedilmeyen yeni ID

  let businessOwnerId: string | null = null;

  await runTransaction(db, async (transaction) => {
    const newStart = data.dateTime.getTime();
    const newEnd = newStart + totalDuration * 60000;

    console.log(`[createAppointment] İstek: Start=${new Date(newStart).toISOString()}, End=${new Date(newEnd).toISOString()}, Duration=${totalDuration}m`);

    const businessSnap = await transaction.get(doc(db, COLLECTIONS.BUSINESSES, data.businessId));
    if (businessSnap.exists()) {
      const businessData = businessSnap.data();
      businessOwnerId = businessData.ownerId;
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[appointmentDate.getDay()];
      const workingHours = businessData.workingHours?.[dayOfWeek];
      
      if (!workingHours || !workingHours.isOpen) {
        throw new Error('İşletme bu gün kapalı.');
      }
      
      const [closeHour, closeMin] = workingHours.closeTime.split(':').map(Number);
      const closeTimeMs = new Date(appointmentDate).setHours(closeHour, closeMin, 0, 0);
      
      if (newEnd > closeTimeMs) {
        throw new Error('Randevu süresi dükkanın kapanış saatini aşıyor.');
      }
    }

    const dailyScheduleSnap = await transaction.get(dailyScheduleRef);
    let dailyAppointments: DailyScheduleAppointment[] = [];

    if (dailyScheduleSnap.exists()) {
      dailyAppointments = dailyScheduleSnap.data().appointments || [];
    }

    let isConflict = false;

    // Aynı personele ait o günkü tüm rezervasyonları kontrol et
    for (const apt of dailyAppointments) {
      const aptStart = apt.startTime;
      const aptEnd = aptStart + apt.durationMinutes * 60000;

      // Zaman aralığı kesişiyorsa (Overlap formülü)
      if (newStart < aptEnd && newEnd > aptStart) {
        console.log(`[createAppointment] Olası çakışma yakalandı: Mevcut Randevu=${apt.appointmentId}`);
        // Gerçek randevunun durumunu Transaction içinde oku (Belki iptal edilmiştir)
        const existingAptRef = doc(db, COLLECTIONS.APPOINTMENTS, apt.appointmentId);
        const existingAptSnap = await transaction.get(existingAptRef);

        if (existingAptSnap.exists()) {
          const aptStatus = existingAptSnap.data().status;
          if (aptStatus !== 'cancelled' && aptStatus !== 'noShow') {
            console.log(`[createAppointment] Çakışma kesinleşti: ${apt.appointmentId} (${aptStatus})`);
            isConflict = true;
            break; // Çakışma kesinleşti
          } else {
            console.log(`[createAppointment] Mevcut randevu iptal edilmiş veya noShow: ${apt.appointmentId}`);
          }
        } else {
          console.log(`[createAppointment] DİKKAT! Hayalet veri (Ghost Record): ${apt.appointmentId} asıl koleksiyonda yok!`);
        }
      }
    }

    if (isConflict) {
      throw new Error('Maalesef bu saat dilimi az önce başka bir kullanıcı tarafından rezerve edildi. Lütfen farklı bir saat seçin.');
    }

    // Çakışma yoksa yeni randevuyu gölge dokümanına (o günün programına) ekle
    dailyAppointments.push({
      appointmentId: appointmentRef.id,
      startTime: newStart,
      durationMinutes: totalDuration,
    });

    transaction.set(dailyScheduleRef, {
      businessId: data.businessId,
      staffId: data.staffId,
      date: dateString,
      appointments: dailyAppointments
    }, { merge: true });

    // Asıl randevu dokümanını oluştur
    transaction.set(appointmentRef, {
      businessId: data.businessId,
      staffId: data.staffId,
      staffName: data.staffName,
      customerName: data.customerName,
      customerPhone: formatPhoneNumber(data.customerPhone),
      customerEmail: data.customerEmail || null,
      customerNote: data.customerNote || null,
      customerId: auth.currentUser?.uid || null,
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
  });

  const appointmentId = appointmentRef.id;

  if (businessOwnerId) {
    console.log('[CreateAppt] Creating notification for business owner:', businessOwnerId);
    const { createNotification } = await import('./notifications');
    await createNotification({
      userId: businessOwnerId,
      type: 'new_appointment_request',
      title: 'Yeni Randevu Talebi',
      message: `${data.customerName} adlı müşteri yeni bir randevu talep etti.`,
      appointmentId: appointmentId,
      businessId: data.businessId,
    });
  } else {
    console.log('[CreateAppt] No businessOwnerId, skipping notification');
  }

  return appointmentId;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: string,
  cancellationReason?: string,
  isCustomerCancellation = false
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APPOINTMENTS, appointmentId);

  const aptSnap = await getDoc(docRef);
  if (!aptSnap.exists()) return;
  const appointmentData = aptSnap.data();

  if (status === 'cancelled') {
    const updateData: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    let updated = false;
    await runTransaction(db, async (t) => {
      const snap = await t.get(docRef);
      if (!snap.exists()) return;

      updated = true;
      const data = snap.data();
      const date = data.dateTime.toDate();
      const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      const dateString = utcDate.toISOString().split('T')[0];
      const dailyRef = doc(db, 'daily_schedules', `${data.businessId}_${data.staffId}_${dateString}`);

      const dailySnap = await t.get(dailyRef);

      t.update(docRef, updateData);

      if (dailySnap.exists()) {
        const dailyData = dailySnap.data();
        const filtered = (dailyData.appointments || []).filter((a: DailyScheduleAppointment) => a.appointmentId !== appointmentId);
        t.update(dailyRef, { appointments: filtered });
      }
    });
    if (!updated) {
      await updateDoc(docRef, updateData);
    }
    await notifyAppointmentStatusChange(appointmentId, appointmentData, status, isCustomerCancellation);
    return;
  }

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(docRef, updateData);
  await notifyAppointmentStatusChange(appointmentId, appointmentData, status, false);
}

// Fetch all appointments for a specific customer phone number (customer-facing)
export async function getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
  const formattedPhone = formatPhoneNumber(phone);
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('customerPhone', '==', formattedPhone)
  );
  const snapshot = await getDocs(q);
  const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  return apps.sort((a, b) => b.dateTime.toMillis() - a.dateTime.toMillis());
}

// Real-time listener for appointments
export function subscribeToAppointments(
  businessId: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // REAL-TIME DİNLEME MİNİMİZASYONU (Gereksiz eski verileri akıştan çıkartır)
  const q = query(
    collection(db, COLLECTIONS.APPOINTMENTS),
    where('businessId', '==', businessId),
    where('dateTime', '>=', Timestamp.fromDate(today))
  );

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Appointment))
      .sort((a, b) => a.dateTime.toMillis() - b.dateTime.toMillis());

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

  // MÜKEMMEL GÜVENLİK: Artık hiçbir şekilde "getAppointments" ile Müşteri Özel Verileri public çekilmiyor!
  // Bunun yerine sadece zaman logunu tutan 'daily_schedules' gölge dokümanı kullanılıyor. (Data Leak engeli)
  const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  const dateString = utcDate.toISOString().split('T')[0];
  const dailyRef = doc(db, 'daily_schedules', `${businessId}_${staffId}_${dateString}`);
  const dailySnap = await getDoc(dailyRef);
  
  let activeAppointments: DailyScheduleAppointment[] = [];
  if (dailySnap.exists()) {
    activeAppointments = dailySnap.data().appointments || [];
    console.log(`[getAvailableSlots] ${dateString} için ${activeAppointments.length} aktif randevu bulundu:`, activeAppointments);
  } else {
    console.log(`[getAvailableSlots] ${dateString} için günlük program (gölge doküman) henüz oluşturulmamış (boş).`);
  }

  // Calculate available slots
  const slots: string[] = [];


  // Türkiye saati (+03:00) baz alınarak ISO formatında date objeleri oluşturulur.
  // Bu sayede sunucunun yerel saati ne olursa olsun her zaman doğru TR saat dilimi kullanılır.
  const currentTime = new Date(`${dateString}T${workingHours.openTime}:00+03:00`);
  const closeTime = new Date(`${dateString}T${workingHours.closeTime}:00+03:00`);

  console.log(`[getAvailableSlots] DateString: ${dateString}, Open (ISO): ${currentTime.toISOString()}, Close (ISO): ${closeTime.toISOString()}`);

  const now = new Date();

  while (currentTime.getTime() + durationMinutes * 60000 <= closeTime.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60000);

    // Check if slot is in the past
    if (currentTime <= now) {
      currentTime.setTime(currentTime.getTime() + 30 * 60000);
      continue;
    }

    // Doğrudan gölge dokümanın sızdırılamaz array nesneleri üzerinde overlap kontrolü
    const hasConflict = activeAppointments.some(apt => {
      // Hata koruması: Geçersiz veriler varsa direkt atla
      if (!apt || typeof apt.startTime !== 'number' || typeof apt.durationMinutes !== 'number') {
        console.log(`[getAvailableSlots] HATA: Geçersiz randevu objesi atlandı:`, apt);
        return false;
      }
      
      const aptStart = apt.startTime;
      const aptEnd = aptStart + apt.durationMinutes * 60000;
      
      const isOverlap = currentTime.getTime() < aptEnd && slotEnd.getTime() > aptStart;
      if (isOverlap) {
        console.log(`[getAvailableSlots] ÇAKIŞMA! Slot: ${currentTime.toISOString()} - ${slotEnd.toISOString()} | Mevcut: ${new Date(aptStart).toISOString()} - ${new Date(aptEnd).toISOString()}`);
      }
      return isOverlap;
    });

    if (!hasConflict) {
      slots.push(currentTime.toISOString());
    }

    currentTime.setTime(currentTime.getTime() + 30 * 60000); // 30 minute intervals
  }

  return slots;
}
