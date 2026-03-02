import { useState, useEffect } from 'react';
import { getTodayAppointments, getAppointments, getCustomers } from '../services/firestore';

export interface DashboardStats {
    todayCount: number;
    todayRevenue: number;
    weeklyCount: number;
    totalCustomers: number;
    pendingCount: number;
    confirmedCount: number;
}

interface UseDashboardStatsResult {
    data: DashboardStats | null;
    loading: boolean;
    error: string | null;
}

export function useDashboardStats(businessId: string | undefined): UseDashboardStatsResult {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!businessId) {
            setData(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        const fetchStats = async () => {
            // Today's appointments
            const today = await getTodayAppointments(businessId);

            // This week
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 7);

            const weekly = await getAppointments(businessId, {
                startDate: weekStart,
                endDate: weekEnd,
            });

            // Customers (best-effort — non-blocking)
            let totalCustomers = 0;
            try {
                const customers = await getCustomers(businessId);
                totalCustomers = customers.length;
            } catch {
                // customer collection may be empty on first run
            }

            const active = today.filter(a => a.status !== 'cancelled' && a.status !== 'noShow');

            return {
                todayCount: active.length,
                todayRevenue: active.reduce((sum, a) => sum + (a.totalPrice || 0), 0),
                weeklyCount: weekly.filter(a => a.status !== 'cancelled' && a.status !== 'noShow').length,
                totalCustomers,
                pendingCount: today.filter(a => a.status === 'pending').length,
                confirmedCount: today.filter(a => a.status === 'confirmed').length,
            };
        };

        fetchStats()
            .then((stats) => { if (!cancelled) setData(stats); })
            .catch((err) => { if (!cancelled) setError(err.message || 'İstatistikler alınamadı.'); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [businessId]);

    return { data, loading, error };
}
