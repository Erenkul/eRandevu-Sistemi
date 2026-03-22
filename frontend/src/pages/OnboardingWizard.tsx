import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Building2,
    Clock,
    Scissors,
    Users,
    Eye,
    AlertCircle,
    Sparkles,
    Stethoscope,
    Leaf,
    Dumbbell,
    Plus,
    X,
} from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../lib/firebase';
import { useAuth } from '../contexts';
import { createService, createStaff } from '../services/firestore';
import {
    SERVICE_TEMPLATES,
    DEFAULT_WORKING_HOURS,
    DAY_NAMES,
    TIME_OPTIONS,
    type ServiceTemplate,
} from '../data/serviceTemplates';
import './OnboardingWizard.css';

// Step definitions
const STEPS = [
    { id: 1, title: 'İşletme Bilgileri', icon: Building2 },
    { id: 2, title: 'Çalışma Saatleri', icon: Clock },
    { id: 3, title: 'İşletme Türü', icon: Scissors },
    { id: 4, title: 'Personel', icon: Users },
    { id: 5, title: 'Önizleme', icon: Eye },
];

// Icon mapping for business types
const BUSINESS_TYPE_ICONS: Record<string, React.ElementType> = {
    Scissors,
    Sparkles,
    Stethoscope,
    Leaf,
    Dumbbell,
    Building2,
};

interface WorkingHoursData {
    [key: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

interface StaffData {
    name: string;
    phone: string;
    role: 'owner' | 'barber' | 'assistant';
}

const formatOnboardingPhone = (value: string): string => {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
};

const validateOnboardingPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('5');
};

export const OnboardingWizard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1: Business Info
    const [businessInfo, setBusinessInfo] = useState({
        name: user?.businessName || '',
        slug: '',
        phone: user?.phoneNumber || '',
        address: '',
        city: 'İstanbul',
    });

    const formatBizPhone = (value: string): string => {
        let cleaned = value.replace(/\D/g, '');
        if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
        
        if (cleaned.length <= 3) return cleaned;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
        if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    };

    // Step 2: Working Hours
    const [workingHours, setWorkingHours] = useState<WorkingHoursData>(DEFAULT_WORKING_HOURS);

    // Step 3: Business Type & Services
    const [selectedBusinessType, setSelectedBusinessType] = useState<string | null>(null);
    const [selectedServices, setSelectedServices] = useState<ServiceTemplate[]>([]);

    // Step 4: Staff
    const [staffList, setStaffList] = useState<StaffData[]>([
        { name: user?.displayName || '', phone: user?.phoneNumber || '', role: 'owner' }
    ]);

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        const slug = name
            .toLowerCase()
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ş/g, 's')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');

        setBusinessInfo(prev => ({ ...prev, name, slug }));
    };

    // Handle business type selection
    const handleBusinessTypeSelect = (typeKey: string) => {
        setSelectedBusinessType(typeKey);
        const template = SERVICE_TEMPLATES[typeKey];
        if (template) {
            setSelectedServices(template.services);
        }
    };

    // Toggle service selection
    const toggleService = (service: ServiceTemplate) => {
        setSelectedServices(prev => {
            const exists = prev.some(s => s.name === service.name);
            if (exists) {
                return prev.filter(s => s.name !== service.name);
            } else {
                return [...prev, service];
            }
        });
    };

    // Handle working hours change
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

    // Handle staff change
    const handleStaffChange = (index: number, field: keyof StaffData, value: string) => {
        let finalValue = value;
        if (field === 'phone') {
            finalValue = formatOnboardingPhone(value);
        }
        setStaffList(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: finalValue };
            return updated;
        });
    };

    // Add new staff member
    const addStaff = () => {
        setStaffList(prev => [...prev, { name: '', phone: '', role: 'barber' }]);
    };

    // Remove staff member
    const removeStaff = (index: number) => {
        setStaffList(prev => prev.filter((_, i) => i !== index));
    };

    // Validate current step
    const canProceed = (): boolean => {
        switch (currentStep) {
            case 1:
                return !!(businessInfo.name && businessInfo.slug && businessInfo.phone && validateOnboardingPhone(businessInfo.phone) && businessInfo.address);
            case 2:
                return Object.values(workingHours).some(h => h.isOpen);
            case 3:
                return true; // Optional step
            case 4:
                return staffList.every(staff => !staff.phone || validateOnboardingPhone(staff.phone)); // Valid staff phones format
            case 5:
                return true;
            default:
                return false;
        }
    };

    // Go to next step
    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
            setError(null);
        }
    };

    // Go to previous step
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            setError(null);
        }
    };

    // Submit all data
    const handleSubmit = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Update existing Business Document (created during registration)
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

            // 2. Create Services from templates
            for (const service of selectedServices) {
                await createService(businessId, {
                    name: service.name,
                    durationMinutes: service.duration,
                    price: service.price,
                    category: service.category,
                    isActive: true,
                });
            }

            // 3. Create Staff members
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

            // 4. Update User Profile with final businessName
            const userRef = doc(db, COLLECTIONS.USERS, user.uid);
            await updateDoc(userRef, {
                businessName: businessInfo.name
            });

            // 5. Navigate to Admin Dashboard
            navigate('/admin', { replace: true });

        } catch (err: unknown) {
            console.error('Error creating business:', err);
            const errorMessage = err instanceof Error ? err.message : 'İşletme oluşturulurken bir hata oluştu';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Render progress bar
    const renderProgress = () => (
        <div className="onboarding-progress">
            {STEPS.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="progress-step">
                        <div
                            className={`progress-circle ${currentStep === step.id ? 'active' :
                                currentStep > step.id ? 'completed' : ''
                                }`}
                        >
                            {currentStep > step.id ? <Check size={16} /> : step.id}
                        </div>
                    </div>
                    {index < STEPS.length - 1 && (
                        <div className={`progress-line ${currentStep > step.id ? 'completed' : ''}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // Step 1: Business Info
    const renderStep1 = () => (
        <>
            <div className="step-header">
                <h2>İşletme Bilgileri</h2>
                <p>İşletmenizin temel bilgilerini girin</p>
            </div>

            <div className="form-group">
                <label>İşletme Adı</label>
                <input
                    type="text"
                    value={businessInfo.name}
                    onChange={handleNameChange}
                    placeholder="Örn: Makas Kuaför"
                />
            </div>

            <div className="form-group">
                <label>İşletme Linki</label>
                <input
                    type="text"
                    value={businessInfo.slug}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, slug: e.target.value })}
                    placeholder="makas-kuafor"
                />
                <div className="slug-preview">
                    erandevu.com/book/<strong>{businessInfo.slug || 'isletme-adi'}</strong>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Telefon</label>
                    <input
                        type="tel"
                        value={businessInfo.phone}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, phone: formatBizPhone(e.target.value) })}
                        placeholder="5XX XXX XX XX"
                    />
                </div>
                <div className="form-group">
                    <label>Şehir</label>
                    <select
                        value={businessInfo.city}
                        onChange={(e) => setBusinessInfo({ ...businessInfo, city: e.target.value })}
                    >
                        <option value="İstanbul">İstanbul</option>
                        <option value="Ankara">Ankara</option>
                        <option value="İzmir">İzmir</option>
                        <option value="Bursa">Bursa</option>
                        <option value="Antalya">Antalya</option>
                        <option value="Konya">Konya</option>
                        <option value="Adana">Adana</option>
                        <option value="Diğer">Diğer</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label>Adres</label>
                <input
                    type="text"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                    placeholder="Mahalle, Cadde, No..."
                />
            </div>
        </>
    );

    // Step 2: Working Hours
    const renderStep2 = () => (
        <>
            <div className="step-header">
                <h2>Çalışma Saatleri</h2>
                <p>İşletmenizin açık olduğu gün ve saatleri belirleyin</p>
            </div>

            <div className="working-hours-grid">
                {Object.keys(workingHours).map((day) => (
                    <div key={day} className="working-hours-row">
                        <span className="day-name">{DAY_NAMES[day]}</span>
                        <div className="day-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={workingHours[day].isOpen}
                                    onChange={(e) => handleWorkingHoursChange(day, 'isOpen', e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className={`time-selects ${!workingHours[day].isOpen ? 'disabled' : ''}`}>
                            <select
                                value={workingHours[day].openTime}
                                onChange={(e) => handleWorkingHoursChange(day, 'openTime', e.target.value)}
                            >
                                {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                            <span>-</span>
                            <select
                                value={workingHours[day].closeTime}
                                onChange={(e) => handleWorkingHoursChange(day, 'closeTime', e.target.value)}
                            >
                                {TIME_OPTIONS.map(time => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    // Step 3: Business Type & Services
    const renderStep3 = () => (
        <>
            <div className="step-header">
                <h2>İşletme Türü</h2>
                <p>İşletmenize uygun türü seçin, hazır hizmetlerle başlayın</p>
            </div>

            <div className="business-type-grid">
                {Object.entries(SERVICE_TEMPLATES).map(([key, template]) => {
                    const IconComponent = BUSINESS_TYPE_ICONS[template.icon] || Building2;
                    return (
                        <div
                            key={key}
                            className={`business-type-card ${selectedBusinessType === key ? 'selected' : ''}`}
                            onClick={() => handleBusinessTypeSelect(key)}
                        >
                            <div className="business-type-icon">
                                <IconComponent size={24} />
                            </div>
                            <div className="business-type-name">{template.name}</div>
                        </div>
                    );
                })}
            </div>

            {selectedBusinessType && selectedServices.length > 0 && (
                <div className="services-preview">
                    <h4>
                        <Check size={16} />
                        Eklenecek Hizmetler ({selectedServices.length})
                    </h4>
                    <div className="service-tags">
                        {selectedServices.map((service, index) => (
                            <div key={index} className="service-tag" onClick={() => toggleService(service)}>
                                <span>{service.name}</span>
                                <span className="service-tag-price">₺{service.price}</span>
                                <span className="service-tag-duration">{service.duration}dk</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

    // Step 4: Staff
    const renderStep4 = () => (
        <>
            <div className="step-header">
                <h2>Personel Ekle</h2>
                <p>İşletmenizde çalışan kişileri ekleyin</p>
            </div>

            {staffList.map((staff, index) => (
                <div key={index} className="staff-form">
                    <div className="staff-form-header">
                        <span className="staff-number">Personel {index + 1}</span>
                        {staffList.length > 1 && (
                            <button
                                type="button"
                                className="staff-remove-btn"
                                onClick={() => removeStaff(index)}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="role-select">
                        {(['owner', 'barber', 'assistant'] as const).map((role) => (
                            <div
                                key={role}
                                className={`role-option ${staff.role === role ? 'selected' : ''}`}
                                onClick={() => handleStaffChange(index, 'role', role)}
                            >
                                <span>
                                    {role === 'owner' ? 'İşletme Sahibi' :
                                        role === 'barber' ? 'Uzman' : 'Asistan'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>İsim</label>
                            <input
                                type="text"
                                value={staff.name}
                                onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                                placeholder="Ad Soyad"
                            />
                        </div>
                        <div className="form-group">
                            <label>Telefon</label>
                            <input
                                type="tel"
                                value={staff.phone}
                                onChange={(e) => handleStaffChange(index, 'phone', e.target.value)}
                                placeholder="5XX XXX XX XX"
                            />
                            {staff.phone && !validateOnboardingPhone(staff.phone) && (
                                <span style={{ color: 'red', fontSize: '12px' }}>Lütfen geçerli bir format girin (5XX XXX XX XX)</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <button type="button" className="add-staff-btn" onClick={addStaff}>
                <Plus size={18} />
                Personel Ekle
            </button>
        </>
    );

    // Step 5: Preview
    const renderStep5 = () => (
        <>
            <div className="step-header">
                <h2>Önizleme</h2>
                <p>Bilgilerinizi kontrol edin ve tamamlayın</p>
            </div>

            <div className="preview-section">
                <h4><Building2 size={16} /> İşletme Bilgileri</h4>
                <div className="preview-item">
                    <span className="preview-label">İsim</span>
                    <span className="preview-value">{businessInfo.name}</span>
                </div>
                <div className="preview-item">
                    <span className="preview-label">Link</span>
                    <span className="preview-value">erandevu.com/book/{businessInfo.slug}</span>
                </div>
                <div className="preview-item">
                    <span className="preview-label">Telefon</span>
                    <span className="preview-value">{businessInfo.phone}</span>
                </div>
                <div className="preview-item">
                    <span className="preview-label">Adres</span>
                    <span className="preview-value">{businessInfo.address}, {businessInfo.city}</span>
                </div>
            </div>

            <div className="preview-section">
                <h4><Clock size={16} /> Çalışma Saatleri</h4>
                {Object.entries(workingHours)
                    .filter(([_, hours]) => hours.isOpen)
                    .map(([day, hours]) => (
                        <div key={day} className="preview-item">
                            <span className="preview-label">{DAY_NAMES[day]}</span>
                            <span className="preview-value">{hours.openTime} - {hours.closeTime}</span>
                        </div>
                    ))}
            </div>

            {selectedServices.length > 0 && (
                <div className="preview-section">
                    <h4><Scissors size={16} /> Hizmetler ({selectedServices.length})</h4>
                    {selectedServices.slice(0, 5).map((service, index) => (
                        <div key={index} className="preview-item">
                            <span className="preview-label">{service.name}</span>
                            <span className="preview-value">₺{service.price} • {service.duration}dk</span>
                        </div>
                    ))}
                    {selectedServices.length > 5 && (
                        <div className="preview-item">
                            <span className="preview-label">...</span>
                            <span className="preview-value">+{selectedServices.length - 5} hizmet daha</span>
                        </div>
                    )}
                </div>
            )}

            {staffList.filter(s => s.name).length > 0 && (
                <div className="preview-section">
                    <h4><Users size={16} /> Personel</h4>
                    {staffList.filter(s => s.name).map((staff, index) => (
                        <div key={index} className="preview-item">
                            <span className="preview-label">{staff.name}</span>
                            <span className="preview-value">
                                {staff.role === 'owner' ? 'İşletme Sahibi' :
                                    staff.role === 'barber' ? 'Uzman' : 'Asistan'}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            case 4: return renderStep4();
            case 5: return renderStep5();
            default: return null;
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-header">
                <div className="onboarding-logo">
                    <h1>e<span>Randevu</span></h1>
                </div>
            </div>

            {renderProgress()}

            <div className="onboarding-container">
                <div className="onboarding-card">
                    {error && (
                        <div className="error-message">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {renderStepContent()}

                    <div className="onboarding-nav">
                        {currentStep > 1 && (
                            <button className="nav-btn nav-btn-back" onClick={handleBack}>
                                <ChevronLeft size={18} />
                                Geri
                            </button>
                        )}

                        {(currentStep === 3 || currentStep === 4) && (
                            <button className="nav-btn nav-btn-skip" onClick={handleNext}>
                                Atla
                            </button>
                        )}

                        {currentStep < 5 ? (
                            <button
                                className="nav-btn nav-btn-next"
                                onClick={handleNext}
                                disabled={!canProceed()}
                            >
                                Devam
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                className="nav-btn nav-btn-next"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Oluşturuluyor...' : 'Tamamla'}
                                <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
