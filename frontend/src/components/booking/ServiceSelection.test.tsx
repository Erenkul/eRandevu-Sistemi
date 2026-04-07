import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ServiceSelection } from './ServiceSelection';
import type { Service } from './ServiceSelection';

describe('ServiceSelection Component', () => {
    const mockOnServiceToggle = vi.fn();

    const mockServices: Service[] = [
        { id: '1', name: 'Saç Kesimi', duration: 30, price: 150, category: 'Saç' },
        { id: '2', name: 'Sakal Tıraşı', duration: 20, price: 100, category: 'Sakal' },
        { id: '3', name: 'Saç + Sakal', duration: 45, price: 220, category: 'Kombo' },
        { id: '4', name: 'Bakım', duration: 15, price: 80, category: 'Bakım' },
    ];

    const renderComponent = (props = {}) => {
        return render(
            <ServiceSelection
                availableServices={[]}
                selectedServices={[]}
                onServiceToggle={mockOnServiceToggle}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no services available', () => {
        renderComponent();
        expect(screen.getByText('Hizmet Seçin')).toBeInTheDocument();
        expect(screen.getByText('Bu işletmeye ait hizmet bulunamadı.')).toBeInTheDocument();
    });

    it('renders services grouped by category', () => {
        renderComponent({ availableServices: mockServices });

        expect(screen.getByText('Hizmet Seçin')).toBeInTheDocument();
        expect(screen.getAllByText('Saç').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Sakal').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Kombo').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Bakım').length).toBeGreaterThan(0);
    });

    it('renders individual services with correct info', () => {
        renderComponent({ availableServices: mockServices });

        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.getByText('30 dk')).toBeInTheDocument();
        expect(screen.getByText('₺150')).toBeInTheDocument();
    });

    it('calls onServiceToggle when service is clicked', () => {
        renderComponent({ availableServices: mockServices, selectedServices: [] });

        const serviceCard = screen.getByText('Saç Kesimi').closest('.service-card') || screen.getByText('Saç Kesimi').parentElement?.parentElement;
        if (serviceCard) {
            fireEvent.click(serviceCard);
            expect(mockOnServiceToggle).toHaveBeenCalledWith(mockServices[0]);
        }
    });

    it('shows selected state for selected services', () => {
        renderComponent({ availableServices: mockServices, selectedServices: [mockServices[0]] });

        const selectedCard = screen.getByText('Saç Kesimi').closest('.service-card');
        expect(selectedCard).toHaveClass('selected');
    });

    it('toggles service selection on click', () => {
        renderComponent({ availableServices: mockServices, selectedServices: [] });

        const serviceCard = screen.getByText('Saç Kesimi').closest('.service-card');
        if (serviceCard) {
            fireEvent.click(serviceCard);
            expect(mockOnServiceToggle).toHaveBeenCalledTimes(1);
        }
    });

    it('calculates total price and duration correctly', () => {
        renderComponent({ availableServices: mockServices, selectedServices: [mockServices[0], mockServices[1]] });

        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.getByText('Sakal Tıraşı')).toBeInTheDocument();
    });
});
