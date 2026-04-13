import { useState, useEffect, useTransition } from 'react';
import { getBusiness } from '../services/firestore';
import type { Business } from '../types';

interface UseBusinessResult {
    data: Business | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useBusiness(businessId: string | undefined): UseBusinessResult {
    const [state, setState] = useState<{ data: Business | null; loading: boolean; error: string | null }>({
        data: null,
        loading: false,
        error: null,
    });
    const [tick, setTick] = useState(0);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!businessId) return;

        startTransition(async () => {
            setState(s => ({ ...s, loading: true, error: null }));
            try {
                const business = await getBusiness(businessId);
                setState({ data: business, loading: false, error: null });
            } catch (err) {
                setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'İşletme bilgileri alınamadı.' });
            }
        });
    }, [businessId, tick]);

    const refetch = () => setTick(t => t + 1);

    return { data: state.data, loading: isPending || state.loading, error: state.error, refetch };
}
