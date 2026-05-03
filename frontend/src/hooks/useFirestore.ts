// ===========================================
// eRandevu - Custom Hooks
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import {
  getBusiness,
  getBusinessBySlug,
  getServices,
  getAllServices,
  getStaff,
  getAllStaff,
  getAppointments,
  getAppointmentsByPhone,
  getTodayAppointments,
  getCustomers,
  subscribeToAppointments,
  getAvailableSlots,
  getAllBusinesses,
} from '../services/firestore';
import type { Business, Service, Staff, Appointment, Customer } from '../types';

// ============ GENERIC DATA HOOK ============

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

interface UseDataListResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// ============ BUSINESS HOOKS ============

export function useBusiness(businessId: string | undefined): UseDataResult<Business> {
  const [data, setData] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const business = await getBusiness(businessId);
      setData(business);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İşletme bilgileri alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useBusinessBySlug(slug: string | undefined): UseDataResult<Business> {
  const [data, setData] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const business = await getBusinessBySlug(slug);
      setData(business);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İşletme bulunamadı.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ SERVICES HOOKS ============

export function useServices(businessId: string | undefined, includeInactive = false): UseDataListResult<Service> {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const services = includeInactive
        ? await getAllServices(businessId)
        : await getServices(businessId);
      setData(services);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Hizmetler alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId, includeInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ STAFF HOOKS ============

export function useStaff(businessId: string | undefined, includeInactive = false): UseDataListResult<Staff> {
  const [data, setData] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const staff = includeInactive
        ? await getAllStaff(businessId)
        : await getStaff(businessId);
      setData(staff);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Personel listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId, includeInactive]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ APPOINTMENTS HOOKS ============

interface UseAppointmentsFilters {
  staffId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useAppointments(
  businessId: string | undefined,
  filters?: UseAppointmentsFilters
): UseDataListResult<Appointment> {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const appointments = await getAppointments(businessId, filters);
      setData(appointments);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Randevular alınamadı.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, filters?.staffId, filters?.status, filters?.startDate?.getTime(), filters?.endDate?.getTime()]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useTodayAppointments(businessId: string | undefined): UseDataListResult<Appointment> {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const appointments = await getTodayAppointments(businessId);
      setData(appointments);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bugünkü randevular alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Real-time appointments hook
export function useRealtimeAppointments(businessId: string | undefined): UseDataListResult<Appointment> {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(businessId !== undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      return;
    }

    let unsubscribe: () => void;

    const setupSubscription = () => {
      setLoading(true);
      setError(null);

      unsubscribe = subscribeToAppointments(businessId, (appointments) => {
        setData(appointments);
        setLoading(false);
      });
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [businessId]);

  const refetch = useCallback(() => {
    // Real-time listener auto-updates, but we can force re-subscribe
  }, []);

  return { data, loading, error, refetch };
}

// ============ CUSTOMERS HOOKS ============

export function useCustomers(businessId: string | undefined): UseDataListResult<Customer> {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const customers = await getCustomers(businessId);
      setData(customers);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Müşteri listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ AVAILABILITY HOOKS ============

// Cache mekanizması: SWR (Stale-While-Revalidate) mantığı için basit bir bellek önbelleği
const slotsCache: Record<string, { data: string[]; timestamp: number }> = {};
const SLOTS_CACHE_TTL = 30000; // 30 saniye

export function clearSlotsCache() {
  Object.keys(slotsCache).forEach(key => delete slotsCache[key]);
}

export function clearStatsCache() {
  Object.keys(statsCache).forEach(key => delete statsCache[key]);
}

interface UseAvailableSlotsParams {
  businessId: string | undefined;
  staffId: string | undefined;
  date: Date | undefined;
  durationMinutes: number;
}

export function useAvailableSlots({
  businessId,
  staffId,
  date,
  durationMinutes,
}: UseAvailableSlotsParams): UseDataListResult<string> {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId || !staffId || !date) {
      setData([]);
      return;
    }

    const cacheKey = `${businessId}_${staffId}_${date.toDateString()}_${durationMinutes}`;
    const cached = slotsCache[cacheKey];

    // Caching (SWR): Veri bellekte varsa hemen göster
    if (cached) {
      setData(cached.data);
      // Eğer veri taze ise hiç internete çıkma
      if (Date.now() - cached.timestamp < SLOTS_CACHE_TTL) {
        return;
      }
      // Bayat ise loading spinner göstermeden arka planda çek
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const slots = await getAvailableSlots(businessId, staffId, date, durationMinutes);
      
      // Cache'i güncelle
      slotsCache[cacheKey] = { data: slots, timestamp: Date.now() };
      
      setData(slots);
    } catch (err: unknown) {
      if (!cached) {
        setError(err instanceof Error ? err.message : 'Müsait saatler alınamadı.');
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, staffId, date?.toDateString(), durationMinutes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ DASHBOARD STATS HOOK ============

// Admin paneli için Dashboard cache'i
const statsCache: Record<string, { data: DashboardStats; timestamp: number }> = {};
const STATS_CACHE_TTL = 60000; // 1 dakika (60 saniye)

interface DashboardStats {
  todayCount: number;
  todayRevenue: number;
  weeklyCount: number;
  totalCustomers: number;
  pendingCount: number;
  confirmedCount: number;
}

export function useDashboardStats(businessId: string | undefined): UseDataResult<DashboardStats> {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    const cached = statsCache[businessId];
    if (cached) {
      setData(cached.data);
      if (Date.now() - cached.timestamp < STATS_CACHE_TTL) {
        setLoading(false);
        return;
      }
    } else {
      setLoading(true);
    }

    try {
      setError(null);

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const [todayAppts, weeklyAppts, customers] = await Promise.all([
        getTodayAppointments(businessId),
        getAppointments(businessId, { startDate: weekStart, endDate: weekEnd }),
        getCustomers(businessId),
      ]);

      const activeToday = todayAppts.filter(a => a.status !== 'cancelled' && a.status !== 'noShow');

      const newData = {
        todayCount: activeToday.length,
        todayRevenue: activeToday.reduce((sum, a) => sum + (a.totalPrice || 0), 0),
        weeklyCount: weeklyAppts.filter(a => a.status !== 'cancelled' && a.status !== 'noShow').length,
        totalCustomers: customers.length,
        pendingCount: todayAppts.filter(a => a.status === 'pending').length,
        confirmedCount: todayAppts.filter(a => a.status === 'confirmed').length,
      };

      statsCache[businessId] = { data: newData, timestamp: Date.now() };
      setData(newData);
    } catch (err: unknown) {
      if (!cached) {
        setError(err instanceof Error ? err.message : 'İstatistikler alınamadı.');
      }
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return { data, loading, error, refetch: fetchData };
}

// ============ CUSTOMER-FACING APPOINTMENTS HOOK ============

// Fetches all appointments for the currently logged-in customer using their phone number
export function useCustomerAppointments(phone: string | undefined): UseDataListResult<Appointment> {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!phone) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const appointments = await getAppointmentsByPhone(phone);
      setData(appointments);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Randevularınız alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ ALL BUSINESSES HOOK ============

export function useBusinesses(): UseDataListResult<Business> {
  const [data, setData] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const businesses = await getAllBusinesses();
      setData(businesses);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'İşletmeler alınamadı.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
