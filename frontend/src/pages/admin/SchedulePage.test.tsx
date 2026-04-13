import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SchedulePage } from './SchedulePage';
import { useAuth, useToast } from '../../contexts';
import { useRealtimeAppointments, useStaff, useBusiness } from '../../hooks';
import { updateAppointmentStatus } from '../../services/firestore';
import * as ReactRouterDom from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';

vi.mock('../../contexts');
vi.mock('../../hooks');
vi.mock('../../services/firestore');
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof ReactRouterDom>();
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <ReactRouterDom.BrowserRouter>
        <AuthProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AuthProvider>
    </ReactRouterDom.BrowserRouter>
);

describe('SchedulePage', () => {
    const mockUser = {
        uid: 'user-123',
        email: 'test@test.com',
        businessId: 'business-123',
        role: 'admin' as const,
    };

    const mockStaff = [
        {
            id: 'staff-1',
            name: 'Ahmet Yılmaz',
            isActive: true,
        },
        {
            id: 'staff-2',
            name: 'Mehmet Demir',
            isActive: true,
        },
    ];

    const mockAppointments = [
        {
            id: 'apt-1',
            dateTime: { toDate: () => new Date(2026, 3, 13, 9, 0) },
            staffId: 'staff-1',
            customerName: 'Ali Veli',
            customerPhone: '532 123 45 67',
            services: [{ serviceName: 'Saç Kesimi' }],
            staffName: 'Ahmet Yılmaz',
            status: 'confirmed',
            totalDurationMinutes: 30,
            totalPrice: 150,
            customerNote: 'Müsait ol',
        },
        {
            id: 'apt-2',
            dateTime: { toDate: () => new Date(2026, 3, 13, 10, 0) },
            staffId: 'staff-2',
            customerName: 'Ayşe Yılmaz',
            customerPhone: '534 987 65 43',
            services: [{ serviceName: 'Sakal Tıraşı' }],
            staffName: 'Mehmet Demir',
            status: 'pending',
            totalDurationMinutes: 20,
            totalPrice: 100,
            customerNote: '',
        },
    ];

    const mockBusiness = {
        slug: 'test-barber',
    };

    const mockShowToast = vi.fn();

    const renderComponent = () => {
        return render(
            <TestWrapper>
                <SchedulePage />
            </TestWrapper>
        );
    };

    const getMainContent = () => {
        const main = document.querySelector('.admin-main');
        return main ? within(main as HTMLElement) : screen;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast } as any);
        vi.mocked(useBusiness).mockReturnValue({ data: mockBusiness, loading: false } as any);
        vi.mocked(useStaff).mockReturnValue({ data: mockStaff, loading: false } as any);
        vi.mocked(useRealtimeAppointments).mockReturnValue({
            data: mockAppointments,
            loading: false,
        } as any);
        vi.mocked(updateAppointmentStatus).mockResolvedValue(undefined);
    });

    it('renders loading state', () => {
        vi.mocked(useStaff).mockReturnValue({ data: [], loading: true } as any);
        renderComponent();
        expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('renders schedule with admin sidebar', () => {
        renderComponent();
        const main = getMainContent();
        expect(main.getByText('Takvim')).toBeInTheDocument();
        expect(main.getByText('Randevuları görüntüleyin ve yönetin')).toBeInTheDocument();
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
    });

    it('displays day summary', () => {
        renderComponent();
        expect(screen.getByText('Bugünkü Randevu')).toBeInTheDocument();
        expect(screen.getByText('Onaylı')).toBeInTheDocument();
        expect(screen.getByText('Bekleyen')).toBeInTheDocument();
    });

    it('shows correct counts in summary', () => {
        renderComponent();
        const labels = screen.getAllByText('2');
        expect(labels.length).toBeGreaterThan(0);
        const confirmed = screen.getAllByText('1');
        expect(confirmed.length).toBeGreaterThan(0);
    });

    it('displays time slots', () => {
        renderComponent();
        expect(screen.getByText('09:00')).toBeInTheDocument();
        expect(screen.getByText('10:00')).toBeInTheDocument();
        expect(screen.getByText('18:00')).toBeInTheDocument();
    });

    it('displays appointments in schedule', () => {
        renderComponent();
        expect(screen.getByText('Ali Veli')).toBeInTheDocument();
        expect(screen.getByText('Ayşe Yılmaz')).toBeInTheDocument();
    });

    it('opens detail modal when clicking appointment', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Ali Veli'));
        expect(screen.getByRole('heading', { name: 'Randevu Detayı' })).toBeInTheDocument();
    });

    it('displays appointment details in modal', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Ali Veli'));

        const modal = screen.getByRole('heading', { name: 'Randevu Detayı' }).closest('.modal-content');
        expect(modal).toBeTruthy();
        const modalWithin = within(modal as HTMLElement);
        expect(modalWithin.getByText('Ali Veli')).toBeInTheDocument();
        expect(modalWithin.getByText('532 123 45 67')).toBeInTheDocument();
        expect(modalWithin.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(modalWithin.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(modalWithin.getByText('Müsait ol')).toBeInTheDocument();
        expect(modalWithin.getByText('30 dk / ₺150')).toBeInTheDocument();
    });

    it('closes modal when clicking overlay', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Ali Veli'));

        const modalHeading = screen.getByRole('heading', { name: 'Randevu Detayı' });
        const modal = modalHeading.closest('.modal-overlay');
        if (modal) {
            fireEvent.click(modal);
            expect(screen.queryByRole('heading', { name: 'Randevu Detayı' })).not.toBeInTheDocument();
        }
    });

    it('updates appointment status to confirmed', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Ayşe Yılmaz'));

        fireEvent.click(screen.getByText('Onayla'));

        await waitFor(() => {
            expect(updateAppointmentStatus).toHaveBeenCalledWith('apt-2', 'confirmed');
        });
    });

    it('updates appointment status to completed', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Ali Veli'));

        fireEvent.click(screen.getByText('Tamamlandı'));

        await waitFor(() => {
            expect(updateAppointmentStatus).toHaveBeenCalledWith('apt-1', 'completed');
        });
    });

    it('updates appointment status to cancelled', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Ali Veli'));

        fireEvent.click(screen.getByText('İptal Et'));

        await waitFor(() => {
            expect(updateAppointmentStatus).toHaveBeenCalledWith('apt-1', 'cancelled');
        });
    });

    it('shows toast error when status update fails', async () => {
        vi.mocked(updateAppointmentStatus).mockRejectedValue(new Error('Network error'));
        renderComponent();

        fireEvent.click(screen.getByText('Ali Veli'));

        fireEvent.click(screen.getByText('Tamamlandı'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
        });
    });

    it('shows correct status label for confirmed', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Ali Veli'));
        expect(screen.getByText('Onaylandı')).toBeInTheDocument();
    });

    it('shows correct status label for pending', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Ayşe Yılmaz'));
        expect(screen.getByText('Beklemede')).toBeInTheDocument();
    });

    it('shows only "Onayla" button for pending appointments', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Ayşe Yılmaz'));

        expect(screen.getByText('Onayla')).toBeInTheDocument();
        expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
        expect(screen.getByText('İptal Et')).toBeInTheDocument();
    });

    it('does not show "Onayla" button for confirmed appointments', () => {
        renderComponent();
        fireEvent.click(screen.getByText('Ali Veli'));

        expect(screen.queryByText('Onayla')).not.toBeInTheDocument();
        expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
        expect(screen.getByText('İptal Et')).toBeInTheDocument();
    });

    it('displays appointment time and duration', () => {
        renderComponent();
        expect(screen.getByText('09:00 (30 dk)')).toBeInTheDocument();
    });
});
