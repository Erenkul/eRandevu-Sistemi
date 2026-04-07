import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../../lib/firebase';
import { useAuth } from '../../contexts';
import { createService, createStaff } from '../../services/firestore';
import {
    SERVICE_TEMPLATES,
    DEFAULT_WORKING_HOURS,
    type ServiceTemplate,
} from '../../data/serviceTemplates';

export interface WorkingHoursData {
    [key: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

export interface StaffData {
    name: string;
    phone: string;
    role: 'owner' | 'barber' | 'assistant';
}

export interface BusinessInfoData {
    name: string;
    slug: string;
    phone: string;
    address: string;
    city: string;
}

export const formatOnboardingPhone = (value: string): string => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
};

export const validateOnboardingPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('5');
};

export const useOnboardingState = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [businessInfo, setBusinessInfo] = useState<BusinessInfoData>({
        name: user?.businessName || '',
        slug: '',
        phone: user?.phoneNumber || '',
        address: '',
        city: 'İstanbul',
    });
    const [workingHours, setWorkingHours] = useState<WorkingHoursData>(DEFAULT_WORKING_HOURS);
    const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
    const [availableServices, setAvailableServices] = useState<ServiceTemplate[]>([]);
    const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);
    const [staffList, setStaffList] = useState<StaffData[]>([
        { name: user?.displayName || '', phone: user?.phoneNumber || '', role: 'owner' }
    ]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
        setBusinessInfo(prev => ({ ...prev, name, slug }));
    };

    const handleBusinessTypeSelect = (typeKey: string) => {
        setSelectedBusinessType(typeKey);
        const template = SERVICE_TEMPLATES[typeKey];
        if (template) {
            setAvailableServices(template.services);
            setSelectedServices(template.services);
        }
    };

    const toggleService = (service: ServiceTemplate) => {
        setSelectedServices(prev => {
            const exists = prev.some(s => s.name === service.name);
            return exists ? prev.filter(s => s.name !== service.name) : [...prev, service];
        });
    };

    const handleWorkingHoursChange = (
        day: string,
        field: 'isOpen' | 'openTime' | 'closeTime',
        value: boolean | string
    ) => {
        setWorkingHours(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleStaffChange = (index: number, field: keyof StaffData, value: string) => {
        const finalValue = field === 'phone' ? formatOnboardingPhone(value) : value;
        setStaffList(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: finalValue };
            return updated;
        });
    };

    const addStaff = () => {
        setStaffList(prev => [...prev, { name: '', phone: '', role: 'barber' }]);
    };

    const removeStaff = (index: number) => {
        setStaffList(prev => prev.filter((_, i) => i !== index));
    };

    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!(businessInfo.name && businessInfo.slug && businessInfo.phone && validateOnboardingPhone(businessInfo.phone) && businessInfo.address);
            case 2:
                return Object.values(workingHours).some(h => h.isOpen);
            case 3:
                return true;
            case 4:
                return staffList.every(staff => !staff.phone || validateOnboardingPhone(staff.phone));
            case 5:
                return true;
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 5) { setCurrentStep(prev => prev + 1); setError(null); }
    };

    const handleBack = () => {
        if (currentStep > 1) { setCurrentStep(prev => prev - 1); setError(null); }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            if (!user.businessId) {
                throw new Error('İşletme kimliği bulunamadı. Lütfen tekrar giriş yapın.');
            }
            const businessId = user.businessId;
            const businessRef = doc(db, COLLECTIONS.BUSINESSES, businessId);
            await updateDoc(businessRef, {
                name: businessInfo.name,
                slug: businessInfo.slug,
                phone: businessInfo.phone,
                address: businessInfo.address,
                city: businessInfo.city,
                workingHours: workingHours,
                whatsappEnabled: true,
                smsEnabled: false,
                smsQuota: 0,
                smsUsed: 0,
                subscriptionTier: 'starter',
                subscriptionStatus: 'trial',
                updatedAt: serverTimestamp(),
                onboardingCompleted: true,
                isActive: true
            });
            for (const service of selectedServices) {
                await createService(businessId, {
                    name: service.name,
                    durationMinutes: service.duration,
                    price: service.price,
                    category: service.category,
                    isActive: true,
                });
            }
            for (const staff of staffList) {
                if (staff.name) {
                    await createStaff(businessId, {
                        name: staff.name,
                        phone: staff.phone,
                        role: staff.role,
                        serviceIds: [],
                    });
                }
            }
            const userRef = doc(db, COLLECTIONS.USERS, user.uid);
            await updateDoc(userRef, { businessName: businessInfo.name });
            navigate('/admin', { replace: true });
        } catch (err: unknown) {
            console.error('Error creating business:', err);
            const errorMessage = err instanceof Error ? err.message : 'İşletme oluşturulurken bir hata oluştu';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return {
        currentStep, loading, error, businessInfo, setBusinessInfo,
        workingHours, selectedBusinessType, availableServices, selectedServices,
        staffList, handleNameChange, handleBusinessTypeSelect, toggleService,
        handleWorkingHoursChange, handleStaffChange, addStaff, removeStaff,
        canProceed, handleNext, handleBack, handleSubmit,
    };
};
