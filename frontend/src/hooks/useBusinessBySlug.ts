import { useState, useEffect } from 'react';
import { getBusinessBySlug } from '../services/firestore';
import type { Business } from '../types';

interface UseBusinessBySlugResult {
    data: Business | null;
    loading: boolean;
    error: string | null;
}

export function useBusinessBySlug(slug: string | undefined): UseBusinessBySlugResult {
    const [data, setData] = useState<Business | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) {
            setData(null);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getBusinessBySlug(slug)
            .then((business) => {
                if (!cancelled) setData(business);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'İşletme bulunamadı.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [slug]);

    return { data, loading, error };
}
