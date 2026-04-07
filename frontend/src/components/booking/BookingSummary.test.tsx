import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingSummary } from './BookingSummary';
import type { Service } from './ServiceSelection';
import type { Staff } from '../../types';

describe('BookingSummary Component', () => {
    const mockOnConfirm = vi.fn();

    const mockServices: Service[] = [
        { id: '1', name: 'Saç Kesimi', duration: 30, price: 150, category: 'Saç' },
        { id: '2', name: 'Sakal Tıraşı', duration: 20, price: 100, category: 'Sakal' },
    ];

    const mockStaff: Staff = {
        id: '1',
        businessId: 'b1',
        name: 'Ahmet Yılmaz',
        role: 'barber',
        serviceIds: [],
        workingHours: {},
        isActive: true,
        createdAt: {} as any,
        updatedAt: {} as any,
    };

    const renderComponent = (props = {}) => {
        return render(
            <BookingSummary
                selectedServices={[]}
                selectedStaff={null}
                selectedDate={null}
                selectedTime={null}
                onConfirm={undefined}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with empty services state', () => {
        renderComponent();

        expect(screen.getByText('Randevu Özeti')).toBeInTheDocument();
        expect(screen.getByText('Henüz hizmet seçilmedi')).toBeInTheDocument();
    });

    it('renders selected services with price and duration', () => {
        renderComponent({ selectedServices: mockServices });

        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.getByText('30 dk')).toBeInTheDocument();
        expect(screen.getByText('₺150')).toBeInTheDocument();
    });

    it('renders selected staff name', () => {
        renderComponent({ selectedStaff: mockStaff });

        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    });

    it('renders Farketmez when no staff selected', () => {
        renderComponent({ selectedStaff: null });

        expect(screen.getByText('Farketmez')).toBeInTheDocument();
    });

    it('renders formatted date', () => {
        const date = new Date('2024-06-15');
        renderComponent({ selectedDate: date });

        expect(screen.getByText('15 Haziran 2024')).toBeInTheDocument();
    });

    it('renders Seçilmedi when no date selected', () => {
        renderComponent({ selectedDate: null });

        expect(screen.getAllByText('Seçilmedi').length).toBeGreaterThan(0);
    });

    it('renders selected time', () => {
        renderComponent({ selectedTime: '14:30' });

        expect(screen.getByText('14:30')).toBeInTheDocument();
    });

    it('calculates total price correctly', () => {
        renderComponent({ selectedServices: mockServices });

        expect(screen.getByText('₺250')).toBeInTheDocument();
    });

    it('calculates total duration correctly', () => {
        renderComponent({ selectedServices: mockServices });

        expect(screen.getByText('Tahmini süre: 50 dakika')).toBeInTheDocument();
    });

    it('renders confirm button when onConfirm provided', () => {
        renderComponent({ onConfirm: mockOnConfirm });

        expect(screen.getByText('Randevuyu Onayla')).toBeInTheDocument();
    });

    it('disables confirm button when requirements not met', () => {
        renderComponent({
            selectedServices: [],
            selectedDate: null,
            selectedTime: null,
            onConfirm: mockOnConfirm
        });

        const button = screen.getByText('Randevuyu Onayla');
        expect(button).toBeDisabled();
    });

    it('calls onConfirm when confirm button clicked', () => {
        renderComponent({
            selectedServices: mockServices,
            selectedStaff: mockStaff,
            selectedDate: new Date(),
            selectedTime: '14:30',
            onConfirm: mockOnConfirm
        });

        const button = screen.getByText('Randevuyu Onayla');
        fireEvent.click(button);
        expect(mockOnConfirm).toHaveBeenCalled();
    });
});
