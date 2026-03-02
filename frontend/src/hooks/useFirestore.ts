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
  getTodayAppointments,
  getCustomers,
  subscribeToAppointments,
  getAvailableSlots,
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
    } catch (err: any) {
      setError(err.message || 'İşletme bilgileri alınamadı.');
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
    } catch (err: any) {
      setError(err.message || 'İşletme bulunamadı.');
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
    } catch (err: any) {
      setError(err.message || 'Hizmetler alınamadı.');
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
    } catch (err: any) {
      setError(err.message || 'Personel listesi alınamadı.');
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
    } catch (err: any) {
      setError(err.message || 'Randevular alınamadı.');
    } finally {
      setLoading(false);
    }
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
    } catch (err: any) {
      setError(err.message || 'Bugünkü randevular alınamadı.');
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAppointments(businessId, (appointments) => {
      setData(appointments);
      setLoading(false);
    });

    return () => unsubscribe();
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
    } catch (err: any) {
      setError(err.message || 'Müşteri listesi alınamadı.');
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

    try {
      setLoading(true);
      setError(null);
      const slots = await getAvailableSlots(businessId, staffId, date, durationMinutes);
      setData(slots);
    } catch (err: any) {
      setError(err.message || 'Müsait saatler alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId, staffId, date?.toDateString(), durationMinutes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============ DASHBOARD STATS HOOK ============

interface DashboardStats {
  todayAppointments: number;
  todayRevenue: number;
  totalCustomers: number;
  pendingAppointments: number;
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

    try {
      setLoading(true);
      setError(null);

      const [todayAppts, customers] = await Promise.all([
        getTodayAppointments(businessId),
        getCustomers(businessId),
      ]);

      const completedToday = todayAppts.filter(a => a.status === 'completed');
      const pendingToday = todayAppts.filter(a => a.status === 'pending' || a.status === 'confirmed');

      setData({
        todayAppointments: todayAppts.length,
        todayRevenue: completedToday.reduce((sum, a) => sum + a.totalPrice, 0),
        totalCustomers: customers.length,
        pendingAppointments: pendingToday.length,
      });
    } catch (err: any) {
      setError(err.message || 'İstatistikler alınamadı.');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
