import React from 'react';
import { Star, Users } from 'lucide-react';
import './StaffSelection.css';

export interface Staff {
    id: string;
    name: string;
    initials: string;
    role: string;
    rating: number;
    reviewCount: number;
    isAvailable: boolean;
}

interface StaffSelectionProps {
    selectedStaff: Staff | null;
    onStaffSelect: (staff: Staff | null) => void;
}

const mockStaff: Staff[] = [
    {
        id: '1',
        name: 'Mehmet Usta',
        initials: 'MU',
        role: 'Kıdemli Berber',
        rating: 4.9,
        reviewCount: 156,
        isAvailable: true,
    },
    {
        id: '2',
        name: 'Ali Usta',
        initials: 'AU',
        role: 'Kıdemli Berber',
        rating: 4.8,
        reviewCount: 98,
        isAvailable: true,
    },
    {
        id: '3',
        name: 'Ahmet Berber',
        initials: 'AB',
        role: 'Berber',
        rating: 4.7,
        reviewCount: 67,
        isAvailable: false,
    },
    {
        id: '4',
        name: 'Burak Çırak',
        initials: 'BÇ',
        role: 'Çırak',
        rating: 4.5,
        reviewCount: 23,
        isAvailable: true,
    },
];

export const StaffSelection: React.FC<StaffSelectionProps> = ({
    selectedStaff,
    onStaffSelect,
}) => {
    return (
        <div className="staff-selection">
            <h1 className="staff-selection-title">Personel Seçin</h1>
            <p className="staff-selection-subtitle">
                Randevunuz için tercih ettiğiniz personeli seçin veya "Farketmez" seçeneğini kullanın.
            </p>

            <div className="staff-list">
                {/* No Preference Option */}
                <div
                    className={`staff-card no-preference ${!selectedStaff ? 'selected' : ''}`}
                    onClick={() => onStaffSelect(null)}
                >
                    <div className="no-preference-icon">
                        <Users size={36} />
                    </div>
                    <div className="staff-name">Farketmez</div>
                    <div className="staff-role">Uygun olan personel</div>
                </div>

                {/* Staff Cards */}
                {mockStaff.map((staff) => (
                    <div
                        key={staff.id}
                        className={`staff-card ${selectedStaff?.id === staff.id ? 'selected' : ''}`}
                        onClick={() => onStaffSelect(staff)}
                    >
                        <div className="staff-avatar">{staff.initials}</div>
                        <div className="staff-name">{staff.name}</div>
                        <div className="staff-role">{staff.role}</div>
                        <div className="staff-rating">
                            <Star size={16} fill="currentColor" />
                            {staff.rating} <span>({staff.reviewCount})</span>
                        </div>
                        <div className={`staff-availability ${staff.isAvailable ? 'available' : 'busy'}`}>
                            {staff.isAvailable ? 'Müsait' : 'Meşgul'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
