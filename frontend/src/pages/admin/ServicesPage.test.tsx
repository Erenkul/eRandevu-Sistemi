import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServicesPage } from './ServicesPage';
import { useAuth, useToast } from '../../contexts';
import { useServices } from '../../hooks';
import { createService, updateService, deleteService } from '../../services/firestore';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../../contexts/ToastContext';

vi.mock('../../contexts');
vi.mock('../../hooks');
vi.mock('../../services/firestore');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
        <AuthProvider>
            <ToastProvider>
                {children}
            </ToastProvider>
        </AuthProvider>
    </BrowserRouter>
);

describe('ServicesPage', () => {
    const mockUser = {
        uid: 'user-123',
        email: 'test@test.com',
        businessId: 'business-123',
        role: 'admin' as const,
    };

    const mockServices = [
        {
            id: 'svc-1',
            name: 'Saç Kesimi',
            durationMinutes: 30,
            price: 150,
            category: 'Saç',
            description: 'Klasik saç kesimi',
            isActive: true,
        },
        {
            id: 'svc-2',
            name: 'Sakal Tıraşı',
            durationMinutes: 20,
            price: 100,
            category: 'Sakal',
            description: 'Hassas sakal tıraşı',
            isActive: true,
        },
        {
            id: 'svc-3',
            name: 'Bakım',
            durationMinutes: 15,
            price: 80,
            category: 'Bakım',
            description: 'Saç bakımı',
            isActive: false,
        },
    ];

    const mockShowToast = vi.fn();
    const mockRefetch = vi.fn();

    const renderComponent = () => {
        return render(
            <TestWrapper>
                <ServicesPage />
            </TestWrapper>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useToast).mockReturnValue({ showToast: mockShowToast } as any);
        vi.mocked(useServices).mockReturnValue({
            data: mockServices,
            loading: false,
            refetch: mockRefetch,
        } as any);
    });

    const getMainContent = () => {
        const main = document.querySelector('.admin-main');
        return main ? within(main as HTMLElement) : screen;
    };

    it('renders loading state', () => {
        vi.mocked(useServices).mockReturnValue({ data: [], loading: true, refetch: mockRefetch } as any);
        renderComponent();
        expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('renders services list with admin sidebar', () => {
        renderComponent();
        const main = getMainContent();
        expect(main.getByText('Hizmetler')).toBeInTheDocument();
        expect(main.getByText('İşletmenizde sunduğunuz hizmetleri yönetin')).toBeInTheDocument();
        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.getByText('Sakal Tıraşı')).toBeInTheDocument();
    });

    it('filters services by search term', () => {
        renderComponent();
        const searchInput = screen.getByPlaceholderText('Hizmet ara...');
        fireEvent.change(searchInput, { target: { value: 'saç' } });
        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.getAllByText('Bakım').length).toBeGreaterThan(0);
        expect(screen.queryByText('Sakal Tıraşı')).not.toBeInTheDocument();
    });

    it('filters services by category', () => {
        renderComponent();
        const categoryChips = screen.getAllByText('Saç');
        const chipButton = categoryChips.find(el => el.closest('.category-chip'));
        if (chipButton) fireEvent.click(chipButton);
        expect(screen.getByText('Saç Kesimi')).toBeInTheDocument();
        expect(screen.queryByText('Sakal Tıraşı')).not.toBeInTheDocument();
    });

    it('opens add service modal when clicking "Yeni Hizmet" button', () => {
        renderComponent();
        const addButtons = screen.getAllByText('Yeni Hizmet');
        const topbarButton = addButtons.find(el => el.closest('.add-service-btn'));
        if (topbarButton) fireEvent.click(topbarButton);
        expect(screen.getByRole('heading', { name: 'Yeni Hizmet Ekle' })).toBeInTheDocument();
    });

    it('opens add service modal when clicking add card', () => {
        renderComponent();
        const addCardSpan = screen.getAllByText('Yeni Hizmet Ekle').find(el => el.closest('.add-card'));
        if (addCardSpan) fireEvent.click(addCardSpan);
        expect(screen.getByRole('heading', { name: 'Yeni Hizmet Ekle' })).toBeInTheDocument();
    });

    it('opens edit modal when clicking edit button', () => {
        renderComponent();
        const editButton = screen.getAllByTitle('Düzenle')[0];
        fireEvent.click(editButton);
        expect(screen.getByRole('heading', { name: 'Hizmeti Düzenle' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Saç Kesimi')).toBeInTheDocument();
    });

    it('creates new service on save', async () => {
        vi.mocked(createService).mockResolvedValue('new-service-id');
        renderComponent();

        const addButtons = screen.getAllByText('Yeni Hizmet');
        const topbarButton = addButtons.find(el => el.closest('.add-service-btn'));
        if (topbarButton) fireEvent.click(topbarButton);

        const nameInput = screen.getAllByPlaceholderText('Örn: Saç Kesimi')[0];
        fireEvent.change(nameInput, { target: { value: 'Yeni Hizmet' } });

        const spinbuttons = screen.getAllByRole('spinbutton');
        fireEvent.change(spinbuttons[0], { target: { value: '45' } });
        fireEvent.change(spinbuttons[1], { target: { value: '200' } });

        fireEvent.click(screen.getByText('Ekle'));

        await waitFor(() => {
            expect(createService).toHaveBeenCalledWith('business-123', {
                name: 'Yeni Hizmet',
                durationMinutes: 45,
                price: 200,
                category: 'Saç',
                description: '',
                isActive: true,
            });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('updates existing service on save', async () => {
        vi.mocked(updateService).mockResolvedValue(undefined);
        renderComponent();

        const editButton = screen.getAllByTitle('Düzenle')[0];
        fireEvent.click(editButton);

        const nameInput = screen.getByDisplayValue('Saç Kesimi');
        fireEvent.change(nameInput, { target: { value: 'Güncellenmiş Hizmet' } });

        const spinbuttons = screen.getAllByRole('spinbutton');
        fireEvent.change(spinbuttons[1], { target: { value: '180' } });

        fireEvent.click(screen.getByText('Güncelle'));

        await waitFor(() => {
            expect(updateService).toHaveBeenCalledWith('svc-1', {
                name: 'Güncellenmiş Hizmet',
                durationMinutes: 30,
                price: 180,
                category: 'Saç',
                description: 'Klasik saç kesimi',
                isActive: true,
            });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('shows toast error when save fails', async () => {
        vi.mocked(createService).mockRejectedValue(new Error('Network error'));
        renderComponent();

        const addButtons = screen.getAllByText('Yeni Hizmet');
        const topbarButton = addButtons.find(el => el.closest('.add-service-btn'));
        if (topbarButton) fireEvent.click(topbarButton);

        const nameInput = screen.getAllByPlaceholderText('Örn: Saç Kesimi')[0];
        fireEvent.change(nameInput, { target: { value: 'Test' } });

        fireEvent.click(screen.getByText('Ekle'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
        });
    });

    it('deletes service when confirmed', async () => {
        vi.mocked(deleteService).mockResolvedValue(undefined);
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        renderComponent();

        const deleteButton = screen.getAllByTitle('Sil')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteService).toHaveBeenCalledWith('svc-1');
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('does not delete service when cancelled', () => {
        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

        renderComponent();

        const deleteButton = screen.getAllByTitle('Sil')[0];
        fireEvent.click(deleteButton);

        expect(deleteService).not.toHaveBeenCalled();
    });

    it('toggles service active status', async () => {
        vi.mocked(updateService).mockResolvedValue(undefined);
        renderComponent();

        const toggle = screen.getAllByRole('checkbox')[0];
        fireEvent.click(toggle);

        await waitFor(() => {
            expect(updateService).toHaveBeenCalledWith('svc-1', { isActive: false });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('closes modal when clicking overlay', () => {
        renderComponent();

        const addButtons = screen.getAllByText('Yeni Hizmet');
        const topbarButton = addButtons.find(el => el.closest('.add-service-btn'));
        if (topbarButton) fireEvent.click(topbarButton);

        const modalHeading = screen.getByRole('heading', { name: 'Yeni Hizmet Ekle' });
        const modal = modalHeading.closest('.modal-overlay');
        if (modal) {
            fireEvent.click(modal);
            expect(screen.queryByRole('heading', { name: 'Yeni Hizmet Ekle' })).not.toBeInTheDocument();
        }
    });

    it('shows "Aktif" label for active services', () => {
        renderComponent();
        const activeLabels = screen.getAllByText('Aktif');
        expect(activeLabels.length).toBeGreaterThan(0);
    });

    it('shows "Pasif" label for inactive services', () => {
        renderComponent();
        expect(screen.getByText('Pasif')).toBeInTheDocument();
    });

    it('disables submit button while submitting', async () => {
        vi.mocked(createService).mockImplementation(() => new Promise(() => {}));
        renderComponent();

        const addButtons = screen.getAllByText('Yeni Hizmet');
        const topbarButton = addButtons.find(el => el.closest('.add-service-btn'));
        if (topbarButton) fireEvent.click(topbarButton);

        const nameInput = screen.getAllByPlaceholderText('Örn: Saç Kesimi')[0];
        fireEvent.change(nameInput, { target: { value: 'Test' } });

        const submitButton = screen.getByText('Ekle');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveTextContent('Kaydediliyor...');
        });
    });
});
