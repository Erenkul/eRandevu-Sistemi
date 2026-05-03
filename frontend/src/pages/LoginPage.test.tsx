import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

// AuthContext'i sarmalamak için kullandığımız mock değerler
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../contexts', () => ({
    useAuth: () => ({
        login: mockLogin,
        register: mockRegister,
        error: null,
        clearError: vi.fn(),
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// React Router için gerekli mock
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => vi.fn(),
    };
});

describe('LoginPage Validation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = () => {
        return render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );
    };

    it('shows role selection initially', () => {
        renderWithRouter();
        expect(screen.getByText('Devam etmek için hesap türünüzü seçin')).toBeInTheDocument();
        expect(screen.getByText('İşletme')).toBeInTheDocument();
        expect(screen.getByText('Müşteri')).toBeInTheDocument();
    });

    it('validates empty login form submission', async () => {
        renderWithRouter();
        
        // Önce müşteri rolünü seçelim ki login ekranı gelsin
        fireEvent.click(screen.getByText('Müşteri'));
        
        // Ekrandaki 'Giriş Yap' butonuna (submit olan) basalım
        const submitButton = screen.getAllByRole('button', { name: 'Giriş Yap' }).find(b => b.getAttribute('type') === 'submit');
        fireEvent.click(submitButton!);

        // Validation hatalarının çıkmasını bekliyoruz
        await waitFor(() => {
            expect(screen.getByText('E-posta gerekli')).toBeInTheDocument();
            expect(screen.getByText('Şifre gerekli')).toBeInTheDocument();
        });
        
        // Hata olduğu için login fonksiyonu kesinlikle tetiklenmemeli
        expect(mockLogin).not.toHaveBeenCalled();
    });

    it('validates incorrect email format on blur', async () => {
        renderWithRouter();
        fireEvent.click(screen.getByText('Müşteri'));
        
        const emailInput = screen.getByPlaceholderText('ornek@email.com');
        
        // Hatalı e-posta yaz
        fireEvent.change(emailInput, { target: { value: 'hatali-eposta' } });
        // Input'tan çıkış yap (blur - onBlur tetiklenecek)
        fireEvent.blur(emailInput);
        
        await waitFor(() => {
            expect(screen.getByText('Geçerli bir e-posta adresi girin')).toBeInTheDocument();
        });
    });

    it('submits correctly with valid data', async () => {
        renderWithRouter();
        fireEvent.click(screen.getByText('Müşteri'));
        
        const emailInput = screen.getByPlaceholderText('ornek@email.com');
        const passwordInput = screen.getByPlaceholderText('Şifrenizi girin');
        
        fireEvent.change(emailInput, { target: { value: 'test@ornek.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Sifre123!' } });
        
        const submitButton = screen.getAllByRole('button', { name: 'Giriş Yap' }).find(b => b.getAttribute('type') === 'submit');
        fireEvent.click(submitButton!);
        
        // Validasyonlar başarılı olduğu için login mock'u çağırılmış olmalı
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@ornek.com', 'Sifre123!', 'customer');
        });
    });
});
