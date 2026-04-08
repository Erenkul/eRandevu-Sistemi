import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffPage } from './StaffPage';
import { useAuth, useToast } from '../../contexts';
import { useStaff } from '../../hooks';
import { createStaff, updateStaff, deleteStaff } from '../../services/firestore';
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

describe('StaffPage', () => {
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
            role: 'barber',
            phone: '532 123 45 67',
            email: 'ahmet@test.com',
            isActive: true,
        },
        {
            id: 'staff-2',
            name: 'Mehmet Demir',
            role: 'assistant',
            phone: '534 987 65 43',
            email: 'mehmet@test.com',
            isActive: true,
        },
        {
            id: 'staff-3',
            name: 'Ali Kaya',
            role: 'barber',
            phone: '',
            email: '',
            isActive: false,
        },
    ];

    const mockShowToast = vi.fn();
    const mockRefetch = vi.fn();

    const renderComponent = () => {
        return render(
            <TestWrapper>
                <StaffPage />
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
        vi.mocked(useStaff).mockReturnValue({
            data: mockStaff,
            loading: false,
            refetch: mockRefetch,
        } as any);
    });

    it('renders loading state', () => {
        vi.mocked(useStaff).mockReturnValue({ data: [], loading: true, refetch: mockRefetch } as any);
        renderComponent();
        expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('renders staff list with admin sidebar', () => {
        renderComponent();
        const main = getMainContent();
        expect(main.getByText('Personel')).toBeInTheDocument();
        expect(main.getByText('Ekibinizi yönetin')).toBeInTheDocument();
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
    });

    it('filters staff by search term', () => {
        renderComponent();
        const searchInput = screen.getByPlaceholderText('Personel ara...');
        fireEvent.change(searchInput, { target: { value: 'ahmet' } });
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.queryByText('Mehmet Demir')).not.toBeInTheDocument();
    });

    it('filters staff by role', () => {
        renderComponent();
        const searchInput = screen.getByPlaceholderText('Personel ara...');
        fireEvent.change(searchInput, { target: { value: 'barber' } });
        expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
        expect(screen.getByText('Ali Kaya')).toBeInTheDocument();
        expect(screen.queryByText('Mehmet Demir')).not.toBeInTheDocument();
    });

    it('opens add staff modal when clicking "Yeni Personel" button', () => {
        renderComponent();
        const addButton = screen.getByText('Yeni Personel');
        fireEvent.click(addButton);
        expect(screen.getByRole('heading', { name: 'Yeni Personel Ekle' })).toBeInTheDocument();
    });

    it('opens edit modal when clicking edit button', () => {
        renderComponent();
        const editButton = screen.getAllByTitle('Düzenle')[0];
        fireEvent.click(editButton);
        expect(screen.getByRole('heading', { name: 'Personeli Düzenle' })).toBeInTheDocument();
        expect(screen.getByDisplayValue('Ahmet Yılmaz')).toBeInTheDocument();
    });

    it('creates new staff on save', async () => {
        vi.mocked(createStaff).mockResolvedValue('new-staff-id');
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));

        const nameInput = screen.getByPlaceholderText('Örn: Ahmet Yılmaz');
        fireEvent.change(nameInput, { target: { value: 'Yeni Personel' } });

        const phoneInput = screen.getByPlaceholderText('5XX XXX XX XX');
        fireEvent.change(phoneInput, { target: { value: '511 111 11 11' } });

        fireEvent.click(screen.getByText('Ekle'));

        await waitFor(() => {
            expect(createStaff).toHaveBeenCalledWith('business-123', {
                name: 'Yeni Personel',
                role: 'barber',
                phone: '511 111 11 11',
                email: '',
                serviceIds: [],
            });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('updates existing staff on save', async () => {
        vi.mocked(updateStaff).mockResolvedValue(undefined);
        renderComponent();

        const editButton = screen.getAllByTitle('Düzenle')[0];
        fireEvent.click(editButton);

        const nameInput = screen.getByDisplayValue('Ahmet Yılmaz');
        fireEvent.change(nameInput, { target: { value: 'Güncellenmiş Ad' } });

        fireEvent.click(screen.getByText('Güncelle'));

        await waitFor(() => {
            expect(updateStaff).toHaveBeenCalledWith('staff-1', {
                name: 'Güncellenmiş Ad',
                role: 'barber',
                phone: '532 123 45 67',
                email: 'ahmet@test.com',
                serviceIds: [],
            });
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('shows toast error when phone validation fails', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        const nameInput = screen.getByPlaceholderText('Örn: Ahmet Yılmaz');
        fireEvent.change(nameInput, { target: { value: 'Test Personel' } });

        const phoneInput = screen.getByPlaceholderText('5XX XXX XX XX');
        fireEvent.change(phoneInput, { target: { value: '111 111 11 11' } });

        fireEvent.click(screen.getByText('Ekle'));

        expect(mockShowToast).toHaveBeenCalledWith('Lütfen geçerli bir telefon formatı girin (5XX XXX XX XX)', 'error');
    });

    it('shows toast error when save fails', async () => {
        vi.mocked(createStaff).mockRejectedValue(new Error('Network error'));
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        const nameInput = screen.getByPlaceholderText('Örn: Ahmet Yılmaz');
        fireEvent.change(nameInput, { target: { value: 'Test Personel' } });

        fireEvent.click(screen.getByText('Ekle'));

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error');
        });
    });

    it('deletes staff when confirmed', async () => {
        vi.mocked(deleteStaff).mockResolvedValue(undefined);
        vi.spyOn(window, 'confirm').mockReturnValueOnce(true);

        renderComponent();

        const deleteButton = screen.getAllByTitle('Sil')[0];
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(deleteStaff).toHaveBeenCalledWith('staff-1');
            expect(mockRefetch).toHaveBeenCalled();
        });
    });

    it('does not delete staff when cancelled', () => {
        vi.spyOn(window, 'confirm').mockReturnValueOnce(false);

        renderComponent();

        const deleteButton = screen.getAllByTitle('Sil')[0];
        fireEvent.click(deleteButton);

        expect(deleteStaff).not.toHaveBeenCalled();
    });

    it('shows staff role labels', () => {
        renderComponent();
        expect(screen.getAllByText('Berber').length).toBeGreaterThan(0);
        expect(screen.getByText('Çırak')).toBeInTheDocument();
    });

    it('shows staff contact information', () => {
        renderComponent();
        expect(screen.getByText('532 123 45 67')).toBeInTheDocument();
        expect(screen.getByText('ahmet@test.com')).toBeInTheDocument();
    });

    it('shows "-" for empty contact fields', () => {
        renderComponent();
        const allDashElements = screen.getAllByText('-');
        expect(allDashElements.length).toBeGreaterThan(0);
    });

    it('displays staff initials when no avatar', () => {
        renderComponent();
        expect(screen.getByText('AY')).toBeInTheDocument();
    });

    it('closes modal when clicking overlay', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        expect(screen.getByRole('heading', { name: 'Yeni Personel Ekle' })).toBeInTheDocument();

        const modalHeading = screen.getByRole('heading', { name: 'Yeni Personel Ekle' });
        const modal = modalHeading.closest('.modal-overlay');
        if (modal) {
            fireEvent.click(modal);
            expect(screen.queryByRole('heading', { name: 'Yeni Personel Ekle' })).not.toBeInTheDocument();
        }
    });

    it('shows "Aktif" status badge for active staff', () => {
        renderComponent();
        const activeBadges = screen.getAllByText('Aktif');
        expect(activeBadges.length).toBeGreaterThan(0);
    });

    it('shows "Pasif" status badge for inactive staff', () => {
        renderComponent();
        expect(screen.getByText('Pasif')).toBeInTheDocument();
    });

    it('disables submit button while submitting', async () => {
        vi.mocked(createStaff).mockImplementation(() => new Promise(() => {}));
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        const nameInput = screen.getByPlaceholderText('Örn: Ahmet Yılmaz');
        fireEvent.change(nameInput, { target: { value: 'Test' } });

        const submitButton = screen.getByText('Ekle');
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveTextContent('Kaydediliyor...');
        });
    });

    it('formats phone number correctly', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        const phoneInput = screen.getByPlaceholderText('5XX XXX XX XX');

        fireEvent.change(phoneInput, { target: { value: '5' } });
        expect(phoneInput).toHaveValue('5');

        fireEvent.change(phoneInput, { target: { value: '51' } });
        expect(phoneInput).toHaveValue('51');

        fireEvent.change(phoneInput, { target: { value: '511' } });
        expect(phoneInput).toHaveValue('511');

        fireEvent.change(phoneInput, { target: { value: '5111' } });
        expect(phoneInput).toHaveValue('511 1');

        fireEvent.change(phoneInput, { target: { value: '5111111' } });
        expect(phoneInput).toHaveValue('511 111 1');

        fireEvent.change(phoneInput, { target: { value: '5111111111' } });
        expect(phoneInput).toHaveValue('511 111 11 11');
    });

    it('shows phone validation error for invalid format', () => {
        renderComponent();

        fireEvent.click(screen.getByText('Yeni Personel'));
        const phoneInput = screen.getByPlaceholderText('5XX XXX XX XX');
        fireEvent.change(phoneInput, { target: { value: '111 111 11 11' } });

        expect(screen.getByText('* Lütfen geçerli bir format girin (5XX XXX XX XX)')).toBeInTheDocument();
    });
});
