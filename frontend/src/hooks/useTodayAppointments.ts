import { useState, useEffect } from 'react';
import { subscribeToAppointments } from '../services/firestore';
import type { Appointment } from '../types';

interface UseTodayAppointmentsResult {
    data: Appointment[];
    loading: boolean;
    error: string | null;
}

export function useTodayAppointments(businessId: string | undefined): UseTodayAppointmentsResult {
    const [data, setData] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!businessId) {
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);

        // Real-time subscription — firestore.ts'teki subscribeToAppointments kullanılıyor
        const unsubscribe = subscribeToAppointments(businessId, (appointments) => {
            // Bugünün randevularını filtrele
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayOnly = appointments.filter((apt) => {
                const aptDate = apt.dateTime?.toDate?.();
                return aptDate && aptDate >= today && aptDate < tomorrow;
            });

            setData(todayOnly);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [businessId]);

    return { data, loading, error };
}
