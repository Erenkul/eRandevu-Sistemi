import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Business } from '../../types';
import { mockBusiness, mockService, mockStaff } from '../../test/fixtures';

// ── Mock firebase/firestore before importing the service ──────────────────────
const mockDocReturnValues: Record<string, { id: string; path: string }> = {};
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'collection-ref'),
  doc: vi.fn((_db: any, _col: string, id: string) => {
    const key = `${_col}/${id}`;
    if (!mockDocReturnValues[key]) {
      mockDocReturnValues[key] = { id, path: key };
    }
    return mockDocReturnValues[key];
  }),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn((...args) => args[0]),   // pass-through: returns collectionRef
  where: vi.fn(() => 'where-constraint'),
  orderBy: vi.fn(() => 'orderBy-constraint'),
  limit: vi.fn(() => 'limit-constraint'),
  serverTimestamp: vi.fn(() => 'server-timestamp'),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
    })),
  },
  onSnapshot: vi.fn(),
  runTransaction: vi.fn(),
}));

// ── Mock lib/firebase so initializeApp is never called ───────────────────────
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {},
  COLLECTIONS: {
    BUSINESSES: 'businesses',
    SERVICES: 'services',
    STAFF: 'staff',
    APPOINTMENTS: 'appointments',
    CUSTOMERS: 'customers',
    NOTIFICATIONS: 'notifications',
    USERS: 'users',
  },
}));

// ── Import after mocks are hoisted ────────────────────────────────────────────
import {
  getBusiness,
  getBusinessBySlug,
  getServices,
  getAllServices,
  getStaff,
  getAllStaff,
  getAppointments,
  getTodayAppointments,
  getCustomers,
  getCustomerByPhone,
  getAppointmentsByPhone,
  subscribeToAppointments,
  getAvailableSlots,
  updateAppointmentStatus,
  createAppointment,
  createService,
  updateService,
  deleteService,
  createStaff,
  updateStaff,
  deleteStaff,
  updateBusiness,
  createOrUpdateCustomer,
} from '../firestore';

import { getDoc, getDocs, onSnapshot, runTransaction, updateDoc, addDoc, deleteDoc, doc } from 'firebase/firestore';

const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockOnSnapshot = vi.mocked(onSnapshot);
const mockRunTransaction = vi.mocked(runTransaction);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockAddDoc = vi.mocked(addDoc);
const mockDeleteDoc = vi.mocked(deleteDoc);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a fake Firestore DocumentSnapshot */
function makeDocSnap(id: string, data: object | null) {
  return {
    exists: () => data !== null,
    id,
    data: () => data,
  } as unknown as Awaited<ReturnType<typeof getDoc>>;
}

/** Build a fake Firestore QuerySnapshot */
function makeQuerySnap(docs: { id: string; data: object }[]) {
  return {
    empty: docs.length === 0,
    docs: docs.map(d => ({
      id: d.id,
      data: () => d.data,
    })),
  } as unknown as Awaited<ReturnType<typeof getDocs>>;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getBusiness', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns business when document exists', async () => {
    mockGetDoc.mockResolvedValueOnce(makeDocSnap('biz-1', { name: 'Test Salon', slug: 'test-salon' }));

    const result = await getBusiness('biz-1');

    expect(result).toEqual({ id: 'biz-1', name: 'Test Salon', slug: 'test-salon' });
  });

  it('returns null when document does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce(makeDocSnap('biz-999', null));

    const result = await getBusiness('biz-999');

    expect(result).toBeNull();
  });
});

describe('getBusinessBySlug', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns business when found by slug', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([{ id: 'biz-1', data: { name: 'Test Salon', slug: 'test-salon' } }])
    );

    const result = await getBusinessBySlug('test-salon');

    expect(result).toEqual({ id: 'biz-1', name: 'Test Salon', slug: 'test-salon' });
  });

  it('returns null when no business matches the slug', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getBusinessBySlug('ghost-slug');

    expect(result).toBeNull();
  });
});

describe('getServices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only active services sorted by order', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'srv-2', data: { ...mockService, id: 'srv-2', isActive: true, order: 2, businessId: 'biz-1' } },
        { id: 'srv-1', data: { ...mockService, id: 'srv-1', isActive: true, order: 1, businessId: 'biz-1' } },
        { id: 'srv-3', data: { ...mockService, id: 'srv-3', isActive: false, order: 0, businessId: 'biz-1' } },
      ])
    );

    const result = await getServices('biz-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('srv-1'); // sorted by order
    expect(result[1].id).toBe('srv-2');
    result.forEach(s => expect(s.isActive).toBe(true));
  });

  it('returns empty array when no services', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getServices('biz-1');

    expect(result).toEqual([]);
  });
});

describe('getAllServices', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all services including inactive, sorted by order', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'srv-2', data: { isActive: false, order: 1 } },
        { id: 'srv-1', data: { isActive: true, order: 0 } },
      ])
    );

    const result = await getAllServices('biz-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('srv-1');
    expect(result[1].id).toBe('srv-2');
  });
});

describe('getStaff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only active staff', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'staff-1', data: { ...mockStaff, id: 'staff-1', isActive: true } },
        { id: 'staff-2', data: { ...mockStaff, id: 'staff-2', isActive: false } },
      ])
    );

    const result = await getStaff('biz-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('staff-1');
  });

  it('returns empty array when no active staff', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getStaff('biz-1');

    expect(result).toEqual([]);
  });
});

describe('getAllStaff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all staff regardless of active status', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'staff-1', data: { isActive: true } },
        { id: 'staff-2', data: { isActive: false } },
      ])
    );

    const result = await getAllStaff('biz-1');

    expect(result).toHaveLength(2);
  });
});

describe('getAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  const makeApptData = (id: string, dateMillis: number) => ({
    id,
    dateTime: {
      toMillis: () => dateMillis,
      toDate: () => new Date(dateMillis),
      seconds: Math.floor(dateMillis / 1000),
      nanoseconds: 0,
    },
    businessId: 'biz-1',
    status: 'confirmed',
  });

  it('returns appointments sorted by dateTime ascending', async () => {
    const t1 = Date.now();
    const t2 = t1 + 3600000;
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'appt-2', data: makeApptData('appt-2', t2) },
        { id: 'appt-1', data: makeApptData('appt-1', t1) },
      ])
    );

    const result = await getAppointments('biz-1');

    expect(result[0].id).toBe('appt-1');
    expect(result[1].id).toBe('appt-2');
  });

  it('returns empty array when no appointments', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getAppointments('biz-1');

    expect(result).toEqual([]);
  });

  it('accepts optional filters without throwing', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    await expect(
      getAppointments('biz-1', {
        staffId: 'staff-1',
        status: 'confirmed',
        startDate: new Date(),
        endDate: new Date(),
      })
    ).resolves.toEqual([]);
  });
});

describe('getTodayAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('delegates to getAppointments with today date range', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getTodayAppointments('biz-1');

    expect(result).toEqual([]);
    expect(mockGetDocs).toHaveBeenCalledTimes(1);
  });
});

describe('getCustomers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns customers from query', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'cust-1', data: { name: 'Ahmet Yılmaz', phone: '+905551234567' } },
        { id: 'cust-2', data: { name: 'Mehmet Demir', phone: '+905559999999' } },
      ])
    );

    const result = await getCustomers('biz-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('cust-1');
  });

  it('returns empty array when no customers', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getCustomers('biz-1');

    expect(result).toEqual([]);
  });
});

describe('getCustomerByPhone', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns customer when found', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([{ id: 'cust-1', data: { name: 'Ahmet', phone: '+905551234567' } }])
    );

    const result = await getCustomerByPhone('biz-1', '+905551234567');

    expect(result).toEqual({ id: 'cust-1', name: 'Ahmet', phone: '+905551234567' });
  });

  it('returns null when not found', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getCustomerByPhone('biz-1', '+905550000000');

    expect(result).toBeNull();
  });

  it('normalises phone before querying — 0 prefix', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([{ id: 'cust-1', data: { phone: '+905551234567' } }])
    );

    const result = await getCustomerByPhone('biz-1', '05551234567');

    // Should still find the record (phone normalised to +90...)
    expect(result).not.toBeNull();
  });
});

describe('getAppointmentsByPhone', () => {
  beforeEach(() => vi.clearAllMocks());

  const makeApptWithTime = (id: string, ms: number) => ({
    id,
    dateTime: { toMillis: () => ms, toDate: () => new Date(ms), seconds: 0, nanoseconds: 0 },
  });

  it('returns appointments sorted by dateTime descending (newest first)', async () => {
    const t1 = Date.now();
    const t2 = t1 + 3600000;
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([
        { id: 'appt-1', data: makeApptWithTime('appt-1', t1) },
        { id: 'appt-2', data: makeApptWithTime('appt-2', t2) },
      ])
    );

    const result = await getAppointmentsByPhone('+905551234567');

    // Newest first
    expect(result[0].id).toBe('appt-2');
    expect(result[1].id).toBe('appt-1');
  });

  it('returns empty array when no appointments found', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));

    const result = await getAppointmentsByPhone('+905550000000');

    expect(result).toEqual([]);
  });
});

describe('subscribeToAppointments', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls callback with sorted appointments when snapshot fires', () => {
    const t1 = Date.now();
    const t2 = t1 + 3600000;

    const fakeSnapshot = {
      docs: [
        { id: 'appt-2', data: () => ({ dateTime: { toMillis: () => t2 } }) },
        { id: 'appt-1', data: () => ({ dateTime: { toMillis: () => t1 } }) },
      ],
    };

    const unsubscribeMock = vi.fn();
    mockOnSnapshot.mockImplementation((_query, cb: any) => {
      cb(fakeSnapshot);
      return unsubscribeMock;
    });

    const callback = vi.fn();
    const unsubscribe = subscribeToAppointments('biz-1', callback);

    expect(callback).toHaveBeenCalledTimes(1);
    const received = callback.mock.calls[0][0];
    expect(received[0].id).toBe('appt-1'); // sorted ascending
    expect(received[1].id).toBe('appt-2');

    // Returns the unsubscribe function from onSnapshot
    unsubscribe();
    expect(unsubscribeMock).toHaveBeenCalledTimes(1);
  });
});

describe('updateAppointmentStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates status via updateDoc for non-cancelled status', async () => {
    // Mock getDoc for appointment and for notification (business lookup)
    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('appt-1', { customerId: 'user-1', businessId: 'biz-1', staffName: 'Test Staff' }))
      .mockResolvedValueOnce(makeDocSnap('biz-1', { ownerId: 'owner-1' })); // for notification
    mockUpdateDoc.mockResolvedValueOnce(undefined);
    // Mock addDoc for notification
    mockAddDoc.mockResolvedValueOnce({ id: 'notif-1' } as any);

    await updateAppointmentStatus('appt-1', 'completed');

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ status: 'completed' })
    );
  });

  it('uses transaction for cancelled status', async () => {
    const dateMs = Date.now();
    // First getDoc for the appointment
    // Then getDoc inside notifyAppointmentStatusChange for business
    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('appt-1', {
        status: 'confirmed',
        businessId: 'biz-1',
        staffId: 'staff-1',
        dateTime: { toDate: () => new Date(dateMs) },
        customerName: 'Test Customer',
      }))
      .mockResolvedValueOnce(makeDocSnap('biz-1', { ownerId: 'owner-1' })); // for notification
    mockRunTransaction.mockImplementation(async (_db, fn) => fn({ 
      get: vi.fn().mockResolvedValue({ exists: () => false }), 
      update: vi.fn(), 
      set: vi.fn(), 
      delete: vi.fn() 
    }));
    mockAddDoc.mockResolvedValueOnce({ id: 'notif-1' } as any); // for notification

    await updateAppointmentStatus('appt-1', 'cancelled', 'Customer request');

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
  });

  it('falls through to updateDoc when cancelled doc does not exist', async () => {
    // First getDoc returns null (appointment not found)
    // notifyAppointmentStatusChange also calls getDoc but we don't care since appointmentData will be undefined
    mockGetDoc.mockResolvedValue(makeDocSnap('appt-1', null));
    mockUpdateDoc.mockResolvedValueOnce(undefined);

    await updateAppointmentStatus('appt-1', 'cancelled');

    expect(mockUpdateDoc).toHaveBeenCalled();
  });
});

describe('getAvailableSlots', () => {
  beforeEach(() => vi.resetAllMocks());

  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const makeBusinessWithHours = (isOpen: boolean) => ({
    ...mockBusiness,
    workingHours: Object.fromEntries(
      allDays.map(day => [day, { isOpen, openTime: '09:00', closeTime: '10:00' }])
    ) as Business['workingHours'],
  });

  it('returns empty array when business not found', async () => {
    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('biz-1', null)) // getBusiness → not found
      .mockResolvedValueOnce(makeDocSnap('schedule', null)); // daily schedule

    const result = await getAvailableSlots('biz-1', 'staff-1', new Date(), 30);

    expect(result).toEqual([]);
  });

  it('returns empty array when business is closed on the requested day', async () => {
    // All days are set to isOpen=false so any date works
    const monday = new Date('2030-06-18T10:00:00Z');

    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('biz-1', makeBusinessWithHours(false)))
      .mockResolvedValueOnce(makeDocSnap('schedule', null));

    const result = await getAvailableSlots('biz-1', 'staff-1', monday, 30);

    expect(result).toEqual([]);
  });

  it('returns slots for an open business with no existing appointments', async () => {
    // All days set to isOpen=true; 09:00-10:00 window gives 1-2 slots with 30-min duration
    const monday = new Date('2030-06-18T10:00:00Z');

    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('biz-1', makeBusinessWithHours(true)))
      .mockResolvedValueOnce(makeDocSnap('schedule', null)); // no existing appointments

    const result = await getAvailableSlots('biz-1', 'staff-1', monday, 30);

    // 09:00 and 09:30 slots fit in 09:00-10:00 window with 30-min duration
    expect(result.length).toBeGreaterThan(0);
    result.forEach(slot => {
      expect(typeof slot).toBe('string');
      expect(() => new Date(slot)).not.toThrow();
    });
  });

  it('excludes conflicting slots', async () => {
    const monday = new Date('2030-06-18T10:00:00Z');
    // Conflict at local 09:00 on June 18, 2030
    const openTime = new Date('2030-06-18T09:00:00');

    // Existing appointment blocks 09:00
    const activeAppointments = [{
      appointmentId: 'existing-1',
      startTime: openTime.getTime(),
      durationMinutes: 30,
    }];

    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('biz-1', makeBusinessWithHours(true)))
      .mockResolvedValueOnce(makeDocSnap('schedule', { appointments: activeAppointments }));

    const slotsWithConflict = await getAvailableSlots('biz-1', 'staff-1', monday, 30);

    // Now without conflict
    mockGetDoc
      .mockResolvedValueOnce(makeDocSnap('biz-1', makeBusinessWithHours(true)))
      .mockResolvedValueOnce(makeDocSnap('schedule', null));

    const slotsWithout = await getAvailableSlots('biz-1', 'staff-1', monday, 30);

    expect(slotsWithout.length).toBeGreaterThan(slotsWithConflict.length);
  });
});

describe('createAppointment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.mocked(doc).mockReturnValue({ id: 'mock-appt-id', path: 'appointments/mock-appt-id' } as any);
  });

  const baseBookingData = {
    businessId: 'biz-1',
    staffId: 'staff-1',
    staffName: 'Ayşe Hanım',
    services: [
      { id: 'srv-1', name: 'Saç Kesimi', durationMinutes: 30, price: 150 },
    ],
    dateTime: new Date('2030-06-18T10:00:00Z'),
    customerName: 'Ahmet Yılmaz',
    customerPhone: '05551234567',
    customerEmail: 'ahmet@example.com',
    customerNote: 'First visit',
  };

  const mockBusinessData = {
    ownerId: 'owner-1',
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: false, openTime: '10:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' },
    },
  };

  it('creates appointment successfully when no conflicts exist', async () => {
    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ exists: () => true, data: () => mockBusinessData }) // businessSnap
          .mockResolvedValueOnce({ exists: () => false }), // dailyScheduleSnap
        set: vi.fn(),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    mockRunTransaction.mockImplementation(transactionMock);
    mockAddDoc.mockResolvedValueOnce({ id: 'notif-1' } as any); // for notification

    const result = await createAppointment(baseBookingData);

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(result).toBe('mock-appt-id');
  });

  it('throws conflict error when slot is already booked', async () => {
    const existingStartTime = new Date('2030-06-18T10:00:00Z').getTime();
    const activeAppointments = [{
      appointmentId: 'existing-1',
      startTime: existingStartTime,
      durationMinutes: 30,
    }];

    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ exists: () => true, data: () => mockBusinessData }) // businessSnap
          .mockResolvedValueOnce({ exists: () => true, data: () => ({ appointments: activeAppointments }) }) // dailyScheduleSnap
          .mockResolvedValueOnce({ // for the appointment in the loop
            exists: () => true,
            data: () => ({ status: 'confirmed' }),
          }),
        set: vi.fn(),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    mockRunTransaction.mockImplementation(transactionMock);

    await expect(createAppointment(baseBookingData)).rejects.toThrow(
      'Maalesef bu saat dilimi az önce başka bir kullanıcı tarafından rezerve edildi'
    );
  });

  it('allows booking when conflicting appointment is cancelled', async () => {
    const existingStartTime = new Date('2030-06-18T10:00:00Z').getTime();
    const activeAppointments = [{
      appointmentId: 'existing-1',
      startTime: existingStartTime,
      durationMinutes: 30,
    }];

    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ exists: () => true, data: () => mockBusinessData }) // businessSnap
          .mockResolvedValueOnce({ exists: () => true, data: () => ({ appointments: activeAppointments }) }) // dailyScheduleSnap
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ status: 'cancelled' }),
          }),
        set: vi.fn(),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    mockRunTransaction.mockImplementation(transactionMock);
    mockAddDoc.mockResolvedValueOnce({ id: 'notif-1' } as any);

    const result = await createAppointment(baseBookingData);

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(result).toBe('mock-appt-id');
  });

  it('allows booking when conflicting appointment is noShow', async () => {
    const existingStartTime = new Date('2030-06-18T10:00:00Z').getTime();
    const activeAppointments = [{
      appointmentId: 'existing-1',
      startTime: existingStartTime,
      durationMinutes: 30,
    }];

    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ exists: () => true, data: () => mockBusinessData }) // businessSnap
          .mockResolvedValueOnce({ exists: () => true, data: () => ({ appointments: activeAppointments }) }) // dailyScheduleSnap
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ status: 'noShow' }),
          }),
        set: vi.fn(),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    mockRunTransaction.mockImplementation(transactionMock);
    mockAddDoc.mockResolvedValueOnce({ id: 'notif-2' } as any);

    const result = await createAppointment(baseBookingData);

    expect(mockRunTransaction).toHaveBeenCalledTimes(1);
    expect(result).toBe('mock-appt-id');
  });

  it('formats phone number when creating appointment', async () => {
    let storedPhone = '';
    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn().mockResolvedValue({ exists: () => false }),
        set: vi.fn().mockImplementation((_ref, data) => {
          if (data.customerPhone) {
            storedPhone = data.customerPhone;
          }
        }),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    mockRunTransaction.mockImplementation(transactionMock);

    await createAppointment(baseBookingData);

    expect(storedPhone).toBe('+905551234567');
  });
});

describe('createService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('adds a new service document and returns its ID', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'new-srv-id' } as any);

    const result = await createService('biz-1', {
      name: 'Saç Boyama',
      durationMinutes: 60,
      price: 300,
      isActive: true,
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        businessId: 'biz-1',
        name: 'Saç Boyama',
        durationMinutes: 60,
        price: 300,
        isActive: true,
        order: 0,
        createdAt: 'server-timestamp',
        updatedAt: 'server-timestamp',
      })
    );
    expect(result).toBe('new-srv-id');
  });
});

describe('updateService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates service with new data', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);

    await updateService('srv-1', { name: 'Updated Name', price: 200 });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Updated Name',
        price: 200,
        updatedAt: 'server-timestamp',
      })
    );
  });
});

describe('deleteService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes service document', async () => {
    mockDeleteDoc.mockResolvedValueOnce(undefined as any);

    await deleteService('srv-1');

    expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
  });
});

describe('createStaff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates staff with default working hours', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'new-staff-id' } as any);

    const result = await createStaff('biz-1', {
      name: 'Mehmet',
      email: 'mehmet@salon.com',
      role: 'barber',
      serviceIds: ['srv-1'],
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        businessId: 'biz-1',
        name: 'Mehmet',
        email: 'mehmet@salon.com',
        role: 'barber',
        serviceIds: ['srv-1'],
        isActive: true,
        workingHours: expect.any(Object),
        createdAt: 'server-timestamp',
        updatedAt: 'server-timestamp',
      })
    );
    expect(result).toBe('new-staff-id');
  });
});

describe('updateStaff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates staff data', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);

    await updateStaff('staff-1', { name: 'Updated Name' });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Updated Name',
        updatedAt: 'server-timestamp',
      })
    );
  });
});

describe('deleteStaff', () => {
  beforeEach(() => vi.clearAllMocks());

  it('soft deletes staff by marking as inactive', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);

    await deleteStaff('staff-1');

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        isActive: false,
        updatedAt: 'server-timestamp',
      })
    );
  });
});

describe('updateBusiness', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates business data', async () => {
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);

    await updateBusiness('biz-1', { name: 'New Salon Name', phone: '+905551234567' });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'New Salon Name',
        phone: '+905551234567',
        updatedAt: 'server-timestamp',
      })
    );
  });
});

describe('createOrUpdateCustomer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates new customer when phone does not exist', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));
    mockAddDoc.mockResolvedValueOnce({ id: 'new-cust-id' } as any);

    const result = await createOrUpdateCustomer('biz-1', {
      name: 'Yeni Müşteri',
      phone: '05551234567',
      email: 'new@example.com',
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        businessId: 'biz-1',
        name: 'Yeni Müşteri',
        phone: '+905551234567',
        email: 'new@example.com',
        whatsappOptIn: true,
        smsOptIn: false,
        totalAppointments: 0,
        totalSpent: 0,
      })
    );
    expect(result).toBe('new-cust-id');
  });

  it('updates existing customer when phone exists', async () => {
    mockGetDocs.mockResolvedValueOnce(
      makeQuerySnap([{ id: 'cust-1', data: { name: 'Eski İsim', phone: '+905551234567' } }])
    );
    mockUpdateDoc.mockResolvedValueOnce(undefined as any);

    const result = await createOrUpdateCustomer('biz-1', {
      name: 'Güncellenmiş İsim',
      phone: '+905551234567',
    });

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: 'Güncellenmiş İsim',
        updatedAt: 'server-timestamp',
      })
    );
    expect(result).toBe('cust-1');
  });

  it('formats phone number for new customer', async () => {
    mockGetDocs.mockResolvedValueOnce(makeQuerySnap([]));
    mockAddDoc.mockResolvedValueOnce({ id: 'new-cust-id' } as any);

    await createOrUpdateCustomer('biz-1', {
      name: 'Test',
      phone: '05551234567',
    });

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        phone: '+905551234567',
      })
    );
  });
});
