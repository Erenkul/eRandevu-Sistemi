// ===========================================
// eRandevu - Service Templates for Onboarding
// ===========================================

export interface ServiceTemplate {
    name: string;
    duration: number;
    price: number;
    category: string;
}

export interface BusinessTypeTemplate {
    name: string;
    icon: string;
    services: ServiceTemplate[];
}

export const SERVICE_TEMPLATES: Record<string, BusinessTypeTemplate> = {
    barber: {
        name: 'Berber / Kuaför',
        icon: 'Scissors',
        services: [
            { name: 'Saç Kesimi', duration: 30, price: 150, category: 'Saç' },
            { name: 'Sakal Tıraşı', duration: 20, price: 80, category: 'Sakal' },
            { name: 'Saç + Sakal', duration: 45, price: 200, category: 'Kombo' },
            { name: 'Saç Yıkama', duration: 15, price: 50, category: 'Bakım' },
            { name: 'Cilt Bakımı', duration: 30, price: 120, category: 'Bakım' },
        ]
    },
    beauty: {
        name: 'Güzellik Salonu',
        icon: 'Sparkles',
        services: [
            { name: 'Manikür', duration: 45, price: 200, category: 'Tırnak' },
            { name: 'Pedikür', duration: 60, price: 250, category: 'Tırnak' },
            { name: 'Cilt Bakımı', duration: 60, price: 400, category: 'Cilt' },
            { name: 'Kaş Alımı', duration: 15, price: 80, category: 'Bakım' },
            { name: 'Ağda', duration: 45, price: 300, category: 'Epilasyon' },
        ]
    },
    clinic: {
        name: 'Klinik / Muayenehane',
        icon: 'Stethoscope',
        services: [
            { name: 'Muayene', duration: 30, price: 500, category: 'Muayene' },
            { name: 'Kontrol', duration: 15, price: 200, category: 'Muayene' },
            { name: 'Konsültasyon', duration: 45, price: 750, category: 'Muayene' },
        ]
    },
    spa: {
        name: 'Spa / Masaj',
        icon: 'Leaf',
        services: [
            { name: 'Klasik Masaj', duration: 60, price: 500, category: 'Masaj' },
            { name: 'Thai Masajı', duration: 90, price: 800, category: 'Masaj' },
            { name: 'Aromaterapi', duration: 60, price: 600, category: 'Masaj' },
            { name: 'Sauna', duration: 30, price: 200, category: 'Wellness' },
        ]
    },
    fitness: {
        name: 'Fitness / PT',
        icon: 'Dumbbell',
        services: [
            { name: 'PT Seansı', duration: 60, price: 400, category: 'Antrenman' },
            { name: 'Grup Dersi', duration: 45, price: 150, category: 'Antrenman' },
            { name: 'Danışmanlık', duration: 30, price: 200, category: 'Danışmanlık' },
        ]
    },
    custom: {
        name: 'Diğer',
        icon: 'Building2',
        services: []
    }
};

export const DEFAULT_WORKING_HOURS = {
    monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
    saturday: { isOpen: true, openTime: '10:00', closeTime: '18:00' },
    sunday: { isOpen: false, openTime: '10:00', closeTime: '17:00' },
};

export const DAY_NAMES: Record<string, string> = {
    monday: 'Pazartesi',
    tuesday: 'Salı',
    wednesday: 'Çarşamba',
    thursday: 'Perşembe',
    friday: 'Cuma',
    saturday: 'Cumartesi',
    sunday: 'Pazar',
};

export const TIME_OPTIONS = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];
