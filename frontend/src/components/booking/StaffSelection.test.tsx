import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffSelection } from './StaffSelection';
import type { Staff } from '../../types';

describe('StaffSelection Component', () => {
    const mockOnStaffSelect = vi.fn();

    const mockStaff: Staff[] = [
        {
            id: '1',
            businessId: 'b1',
            name: 'Ahmet Yılmaz',
            role: 'barber',
            phone: '5051234567',
            email: 'ahmet@example.com',
            serviceIds: [],
            workingHours: {},
            isActive: true,
            createdAt: {} as any,
            updatedAt: {} as any,
        },
        {
            id: '2',
            businessId: 'b1',
            name: 'Mehmet Kaya',
            role: 'owner',
            phone: '5059876543',
            email: 'mehmet@example.com',
            serviceIds: [],
            workingHours: {},
            isActive: true,
            createdAt: {} as any,
            updatedAt: {} as any,
        },
    ];

    const renderComponent = (props = {}) => {
        return render(
            <StaffSelection
                staffList={[]}
                selectedStaff={null}
                onStaffSelect={mockOnStaffSelect}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no staff available', () => {
        renderComponent();
        expect(screen.getByText('Personel Seçin')).toBeInTheDocument();
        expect(screen.getByText('Henüz personel eklenmemiş.')).toBeInTheDocument();
    });

    it('renders staff cards correctly', () => {
        renderComponent({ staffList: mockStaff });

        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Berber')).toBeInTheDocument();
        expect(screen.getByText('Mehmet Kaya')).toBeInTheDocument();
        expect(screen.getByText('İşletme Sahibi')).toBeInTheDocument();
    });

    it('calls onStaffSelect when staff card is clicked', () => {
        renderComponent({ staffList: mockStaff, selectedStaff: null });

        const staffCard = screen.getByText('Ahmet Yılmaz').closest('.staff-card');
        if (staffCard) {
            fireEvent.click(staffCard);
            expect(mockOnStaffSelect).toHaveBeenCalledWith(mockStaff[0]);
        }
    });

    it('shows selected state for selected staff', () => {
        renderComponent({ staffList: mockStaff, selectedStaff: mockStaff[0] });

        const selectedCard = screen.getByText('Ahmet Yılmaz').closest('.staff-card');
        expect(selectedCard).toHaveClass('selected');
    });

    it('displays staff availability as Müsait', () => {
        renderComponent({ staffList: mockStaff });

        expect(screen.getAllByText('Müsait').length).toBeGreaterThan(0);
    });

    it('displays initials when no avatar is provided', () => {
        renderComponent({ staffList: [mockStaff[0]] });

        const staffCard = screen.getByText('Ahmet Yılmaz').closest('.staff-card');
        const avatarDiv = staffCard?.querySelector('.staff-avatar');
        expect(avatarDiv?.textContent).toBe('AY');
    });

    it('displays avatar image when avatarUrl is provided', () => {
        const staffWithAvatar = [{
            ...mockStaff[0],
            avatarUrl: 'https://example.com/avatar.jpg'
        }];
        renderComponent({ staffList: staffWithAvatar });

        const img = screen.getByAltText('Ahmet Yılmaz');
        expect(img).toBeInTheDocument();
    });
});
