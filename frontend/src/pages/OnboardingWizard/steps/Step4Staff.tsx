import React from 'react';
import { Plus, X } from 'lucide-react';
import { validateOnboardingPhone, type StaffData } from '../hooks/useOnboardingState';

interface Step4StaffProps {
    staffList: StaffData[];
    onStaffChange: (index: number, field: keyof StaffData, value: string) => void;
    onAddStaff: () => void;
    onRemoveStaff: (index: number) => void;
}

export const Step4Staff: React.FC<Step4StaffProps> = ({
    staffList,
    onStaffChange,
    onAddStaff,
    onRemoveStaff,
}) => (
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
                            onClick={() => onRemoveStaff(index)}
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
                            onClick={() => onStaffChange(index, 'role', role)}
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
                            onChange={(e) => onStaffChange(index, 'name', e.target.value)}
                            placeholder="Ad Soyad"
                        />
                    </div>
                    <div className="form-group">
                        <label>Telefon</label>
                        <input
                            type="tel"
                            value={staff.phone}
                            onChange={(e) => onStaffChange(index, 'phone', e.target.value)}
                            placeholder="5XX XXX XX XX"
                        />
                        {staff.phone && !validateOnboardingPhone(staff.phone) && (
                            <span style={{ color: 'red', fontSize: '12px' }}>Lütfen geçerli bir format girin (5XX XXX XX XX)</span>
                        )}
                    </div>
                </div>
            </div>
        ))}

        <button type="button" className="add-staff-btn" onClick={onAddStaff}>
            <Plus size={18} />
            Personel Ekle
        </button>
    </>
);
