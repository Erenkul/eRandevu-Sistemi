import { useState, useEffect, useTransition } from 'react';
import { getBusinessBySlug } from '../services/firestore';
import type { Business } from '../types';

interface UseBusinessBySlugResult {
    data: Business | null;
    loading: boolean;
    error: string | null;
}

export function useBusinessBySlug(slug: string | undefined): UseBusinessBySlugResult {
    const [state, setState] = useState<{ data: Business | null; loading: boolean; error: string | null }>({
        data: null,
        loading: false,
        error: null,
    });
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (!slug) return;

        startTransition(async () => {
            setState(s => ({ ...s, loading: true, error: null }));
            try {
                const business = await getBusinessBySlug(slug);
                setState({ data: business, loading: false, error: null });
            } catch (err) {
                setState({ data: null, loading: false, error: err instanceof Error ? err.message : 'İşletme bulunamadı.' });
            }
        });
    }, [slug]);

    return { data: state.data, loading: isPending || state.loading, error: state.error };
}
