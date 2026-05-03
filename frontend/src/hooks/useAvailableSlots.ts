import { useState, useEffect } from 'react';
import { getAvailableSlots } from '../services/firestore';

interface UseAvailableSlotsParams {
    businessId: string | undefined;
    staffId: string | undefined;
    date: Date | undefined;
    durationMinutes: number;
}

interface UseAvailableSlotsResult {
    data: string[]; // ISO date strings
    loading: boolean;
    error: string | null;
}

export function useAvailableSlots({
    businessId,
    staffId,
    date,
    durationMinutes,
}: UseAvailableSlotsParams): UseAvailableSlotsResult {
    const [data, setData] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Tüm parametreler hazır değilse sorgu yapma
        if (!businessId || !staffId || !date || durationMinutes <= 0) {
            setData([]);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAvailableSlots(businessId, staffId, date, durationMinutes)
            .then((slots) => {
                if (!cancelled) setData(slots);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Müsait saatler alınamadı.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };

        // date nesnesini dependency olarak kullanmak sonsuz render'a yol açar,
        // bunun yerine timestamp kullanıyoruz.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [businessId, staffId, date?.toDateString(), durationMinutes]);

    return { data, loading, error };
}
