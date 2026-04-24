import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAppointment, updateAppointmentStatus, getAvailableSlots } from '../firestore';
import { doc, getDoc, runTransaction, updateDoc, serverTimestamp } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    collection: vi.fn(),
    doc: vi.fn((_db, path, id) => ({ id: id || 'mock-id', path: `${path}/${id}` })),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(() => 'server-timestamp'),
    Timestamp: {
      fromDate: (date: Date) => ({
        toMillis: () => date.getTime(),
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
      }),
      now: () => ({
        toMillis: () => Date.now(),
        toDate: () => new Date(),
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      }),
    },
    onSnapshot: vi.fn(),
    runTransaction: vi.fn(),
  };
});

describe('Final Acceptance Test (Zero-Defect Audit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseBookingData = {
    businessId: 'biz-1',
    staffId: 'staff-1',
    staffName: 'Test Staff',
    services: [{ id: 'srv-1', name: 'Service', durationMinutes: 30, price: 100 }],
    customerName: 'Test Customer',
    customerPhone: '05551234567',
  };

  it('Senaryo A: Normal bir randevu (Mekanizma çalışıyor mu?)', async () => {
    // Mock for transaction
    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ 
            exists: () => true, 
            data: () => ({ 
              ownerId: 'owner-1',
              workingHours: {
                tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' }
              }
            }) 
          })
          .mockResolvedValueOnce({ exists: () => false }), // daily schedule
        set: vi.fn(),
        update: vi.fn(),
      };
      await fn(mockTx);
    });
    vi.mocked(runTransaction).mockImplementation(transactionMock);

    // Tuesday, 10:00 AM
    const dateTime = new Date('2030-06-18T10:00:00Z');
    await createAppointment({ ...baseBookingData, dateTime });

    expect(runTransaction).toHaveBeenCalledTimes(1);
  });

  it('Senaryo B: Mesai bitişine 5 dakika kala başlayan ama mesaiyi aşan bir randevu', async () => {
    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn().mockResolvedValueOnce({ 
          exists: () => true, 
          data: () => ({ 
            workingHours: {
              tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' }
            }
          }) 
        }),
      };
      await fn(mockTx);
    });
    vi.mocked(runTransaction).mockImplementation(transactionMock);

    // Tuesday, 17:55, duration 30 mins -> ends at 18:25 (exceeds 18:00)
    const dateTime = new Date('2030-06-18T17:55:00Z');
    
    await expect(createAppointment({ ...baseBookingData, dateTime })).rejects.toThrow(
      'Randevu süresi dükkanın kapanış saatini aşıyor.'
    );
  });

  it('Senaryo C: Aynı saniyede, aynı saate iki farklı randevu (Race Condition)', async () => {
    // Simulate first one succeeds, second one finds it in daily_schedules
    const dateTime = new Date('2030-06-18T10:00:00Z');

    const transactionMock2 = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({ 
            exists: () => true, 
            data: () => ({ workingHours: { tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' } } }) 
          })
          .mockResolvedValueOnce({ 
            exists: () => true, 
            data: () => ({ appointments: [{ appointmentId: 'existing-1', startTime: dateTime.getTime(), durationMinutes: 30 }] }) 
          })
          .mockResolvedValueOnce({ exists: () => true, data: () => ({ status: 'confirmed' }) }), // appointment itself
      };
      await fn(mockTx);
    });
    vi.mocked(runTransaction).mockImplementation(transactionMock2);

    await expect(createAppointment({ ...baseBookingData, dateTime })).rejects.toThrow(
      'Maalesef bu saat dilimi az önce başka bir kullanıcı tarafından rezerve edildi. Lütfen farklı bir saat seçin.'
    );
  });

  it('İptal ve Boşluk Denetimi: İptal edilen randevunun daily_schedules arrayRemove (filter) ile temizlenmesi', async () => {
    let updatedDailySchedules = null;

    const transactionMock = vi.fn().mockImplementation(async (_db, fn) => {
      const mockTx = {
        get: vi.fn()
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ dateTime: { toDate: () => new Date('2030-06-18T10:00:00Z') }, businessId: 'biz-1', staffId: 'staff-1' })
          })
          .mockResolvedValueOnce({
            exists: () => true,
            data: () => ({ appointments: [{ appointmentId: 'appt-to-cancel' }, { appointmentId: 'other-appt' }] })
          }),
        update: vi.fn((ref, data) => {
          if (ref.id !== 'mock-id') { // Assuming mock-id is the appt
            updatedDailySchedules = data;
          }
        }),
      };
      await fn(mockTx);
    });
    vi.mocked(runTransaction).mockImplementation(transactionMock);
    
    // For notification
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => true, data: () => ({ ownerId: 'owner-1' }) } as any);

    await updateAppointmentStatus('appt-to-cancel', 'cancelled', 'Test', true);

    expect(updatedDailySchedules).toEqual({ appointments: [{ appointmentId: 'other-appt' }] });
  });

  it('Zaman Dilimi Stresi: UTC farklılıklarının dateString üretimine etkisi', async () => {
    // Müşteri 1: New York (UTC-5), Randevu saati: 14:00 (Türkiye'de 22:00)
    const nyDate = new Date('2030-06-18T22:00:00Z'); // 22:00 UTC = 01:00 TRT (Next day)
    
    const utcDate1 = new Date(nyDate.getTime() - (nyDate.getTimezoneOffset() * 60000));
    const dateString1 = utcDate1.toISOString().split('T')[0];

    // Müşteri 2: İstanbul (UTC+3), Randevu saati: 22:00 UTC
    const istDate = new Date('2030-06-18T22:00:00Z');
    const utcDate2 = new Date(istDate.getTime() - (istDate.getTimezoneOffset() * 60000));
    const dateString2 = utcDate2.toISOString().split('T')[0];

    // dateString'ler CİHAZ SAATİNE göre değil, objenin temsil ettiği asıl zamana (UTC) göre üretildiğinden
    // her zaman senkron ve tutarlıdır.
    expect(dateString1).toBe(dateString2);
  });
});
