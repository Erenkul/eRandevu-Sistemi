import React from 'react';
import { Star, Users } from 'lucide-react';
import './StaffSelection.css';
import type { Staff } from '../../types';

interface StaffSelectionProps {
    staffList?: Staff[];
    selectedStaff: Staff | null;
    onStaffSelect: (staff: Staff | null) => void;
}

export const StaffSelection: React.FC<StaffSelectionProps> = ({
    staffList = [],
    selectedStaff,
    onStaffSelect,
}) => {
    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const roles: Record<string, string> = {
        'owner': 'İşletme Sahibi',
        'barber': 'Berber',
        'assistant': 'Çırak'
    };

    return (
        <div className="staff-selection">
            <h1 className="staff-selection-title">Personel Seçin</h1>
            <p className="staff-selection-subtitle">
                Randevunuz için tercih ettiğiniz personeli seçin.
            </p>

            <div className="staff-list">
                {/* Staff Cards */}
                {staffList.map((staff) => (
                    <div
                        key={staff.id}
                        className={`staff-card ${selectedStaff?.id === staff.id ? 'selected' : ''}`}
                        onClick={() => onStaffSelect(staff)}
                    >
                        <div className="staff-avatar">
                            {staff.avatarUrl ? (
                                <img src={staff.avatarUrl} alt={staff.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (
                                getInitials(staff.name)
                            )}
                        </div>
                        <div className="staff-name">{staff.name}</div>
                        <div className="staff-role">{roles[staff.role] || staff.role}</div>
                        {/* Rating is not in Staff type yet, removing or mocking */}
                        {/* <div className="staff-rating">
                            <Star size={16} fill="currentColor" />
                            5.0 <span>(10)</span>
                        </div> */}
                        <div className={`staff-availability available`}>
                            Müsait
                        </div>
                    </div>
                ))}

                {staffList.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#666' }}>
                        Henüz personel eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};
