import React from 'react';
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
} from 'lucide-react';
import { Logo } from '../../components/ui';
import { useOnboardingState } from './hooks/useOnboardingState';
import { Step1BusinessInfo } from './steps/Step1BusinessInfo';
import { Step2WorkingHours } from './steps/Step2WorkingHours';
import { Step3BusinessType } from './steps/Step3BusinessType';
import { Step4Staff } from './steps/Step4Staff';
import { Step5Preview } from './steps/Step5Preview';
import '../OnboardingWizard.css';

const STEPS = [
    { id: 1, title: 'İşletme Bilgileri', icon: Building2 },
    { id: 2, title: 'Çalışma Saatleri', icon: Clock },
    { id: 3, title: 'İşletme Türü', icon: Scissors },
    { id: 4, title: 'Personel', icon: Users },
    { id: 5, title: 'Önizleme', icon: Eye },
];

export const OnboardingWizard: React.FC = () => {
    const {
        currentStep,
        loading,
        error,
        businessInfo,
        setBusinessInfo,
        workingHours,
        selectedBusinessType,
        availableServices,
        selectedServices,
        staffList,
        handleNameChange,
        handleBusinessTypeSelect,
        toggleService,
        handleWorkingHoursChange,
        handleStaffChange,
        addStaff,
        removeStaff,
        canProceed,
        handleNext,
        handleBack,
        handleSubmit,
    } = useOnboardingState();

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

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <Step1BusinessInfo
                        businessInfo={businessInfo}
                        onNameChange={handleNameChange}
                        onBusinessInfoChange={setBusinessInfo}
                    />
                );
            case 2:
                return (
                    <Step2WorkingHours
                        workingHours={workingHours}
                        onWorkingHoursChange={handleWorkingHoursChange}
                    />
                );
            case 3:
                return (
                    <Step3BusinessType
                        selectedBusinessType={selectedBusinessType}
                        availableServices={availableServices}
                        selectedServices={selectedServices}
                        onBusinessTypeSelect={handleBusinessTypeSelect}
                        onToggleService={toggleService}
                    />
                );
            case 4:
                return (
                    <Step4Staff
                        staffList={staffList}
                        onStaffChange={handleStaffChange}
                        onAddStaff={addStaff}
                        onRemoveStaff={removeStaff}
                    />
                );
            case 5:
                return (
                    <Step5Preview
                        businessInfo={businessInfo}
                        workingHours={workingHours}
                        selectedServices={selectedServices}
                        staffList={staffList}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="onboarding-page">
            <div className="onboarding-header">
                <div className="onboarding-logo">
                    <Logo variant="default" className="login-logo-override" />
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
