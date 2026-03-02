import { useState, useEffect } from 'react';
import { getBusiness } from '../services/firestore';
import type { Business } from '../types';

interface UseBusinessResult {
    data: Business | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useBusiness(businessId: string | undefined): UseBusinessResult {
    const [data, setData] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (!businessId) {
            setData(null);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getBusiness(businessId)
            .then((business) => {
                if (!cancelled) {
                    setData(business);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message || 'İşletme bilgileri alınamadı.');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [businessId, tick]);

    const refetch = () => setTick(t => t + 1);

    return { data, loading, error, refetch };
}
