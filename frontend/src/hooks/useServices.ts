import { useState, useEffect } from 'react';
import { getServices } from '../services/firestore';
import type { Service } from '../types';

interface UseServicesResult {
    data: Service[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useServices(businessId: string | undefined): UseServicesResult {
    const [data, setData] = useState<Service[]>([]);
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

        getServices(businessId)
            .then((services) => {
                if (!cancelled) setData(services);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Hizmetler alınamadı.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [businessId, tick]);

    const refetch = () => setTick(t => t + 1);

    return { data, loading, error, refetch };
}
