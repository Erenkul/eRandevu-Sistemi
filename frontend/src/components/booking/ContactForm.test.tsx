import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactForm } from './ContactForm';

vi.mock('../../contexts', () => ({
    useAuth: () => ({
        user: null,
        loading: false,
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ContactForm Component', () => {
    const mockOnChange = vi.fn();

    const renderComponent = (props = {}) => {
        return render(
            <ContactForm onChange={mockOnChange} {...props} />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form with all fields', () => {
        renderComponent();

        expect(screen.getByText('İletişim Bilgileri')).toBeInTheDocument();
        expect(screen.getByLabelText('Ad Soyad')).toBeInTheDocument();
        expect(screen.getByLabelText('Telefon')).toBeInTheDocument();
        expect(screen.getByLabelText('E-posta')).toBeInTheDocument();
        expect(screen.getByLabelText('Not')).toBeInTheDocument();
    });

    it('renders WhatsApp toggle', () => {
        renderComponent();

        expect(screen.getByText('WhatsApp Hatırlatma')).toBeInTheDocument();
        expect(screen.getByText('Randevu saatinden 1 saat önce mesaj al.')).toBeInTheDocument();
    });

    it('renders privacy notice', () => {
        renderComponent();

        expect(screen.getByText(/Kişisel verileriniz 6698 sayılı KVKK/)).toBeInTheDocument();
    });

    it('calls onChange when input values change', () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Ad Soyad') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Test User' } });

        expect(mockOnChange).toHaveBeenCalled();
    });

    it('validates phone number on blur', async () => {
        renderComponent();

        const phoneInput = screen.getByLabelText('Telefon') as HTMLInputElement;
        fireEvent.change(phoneInput, { target: { value: '123' } });
        fireEvent.blur(phoneInput);

        await waitFor(() => {
            expect(screen.getByText(/Geçerli numara girin/)).toBeInTheDocument();
        });
    });

    it('validates name on blur', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Ad Soyad') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'A' } });
        fireEvent.blur(nameInput);

        await waitFor(() => {
            expect(screen.getByText(/Lütfen en az 2 karakter girin/)).toBeInTheDocument();
        });
    });

    it('validates email format on blur', async () => {
        renderComponent();

        const emailInput = screen.getByLabelText('E-posta') as HTMLInputElement;
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);

        await waitFor(() => {
            expect(screen.getByText(/Geçerli bir e-posta adresi girin/)).toBeInTheDocument();
        });
    });

    it('toggles WhatsApp reminder checkbox', () => {
        renderComponent();

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(true);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(false);
    });
});
