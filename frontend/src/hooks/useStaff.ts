import { useState, useEffect } from 'react';
import { getStaff } from '../services/firestore';
import type { Staff } from '../types';

interface UseStaffResult {
    data: Staff[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useStaff(businessId: string | undefined): UseStaffResult {
    const [data, setData] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!businessId) {
            setData([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getStaff(businessId)
            .then((staff) => {
                if (!cancelled) setData(staff);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Personel listesi alınamadı.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [businessId, tick]);

    const refetch = () => setTick(t => t + 1);

    return { data, loading, error, refetch };
}
