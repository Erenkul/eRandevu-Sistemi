import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as AuthContextModule from '../../contexts';

// useAuth kancasını (hook) sahte bir versiyonuyla (mock) değiştiriyoruz
vi.mock('../../contexts', () => ({
  useAuth: vi.fn(),
}));

// Testler için yardımcı bir render fonksiyonu: React Router ile sarılmış hali
const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/admin" element={<div>Admin Page</div>} />
        <Route path="/customer" element={<div>Customer Page</div>} />
        <Route path="/*" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute Component', () => {
  it('shows loading spinner when loading is true (Yükleniyorsa ekranda spinner göstersin)', () => {
    // 1. Senaryo: Sistem halihazırda auth durumunu tam olarak okuyamadı, beklemede (loading: true)
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      loading: true,
      user: null,
    } as any);

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);
    
    // Ekranda "Yükleniyor..." metninin çizilmesini bekliyoruz
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('redirects to /login if there is no user (Kullanıcı giriş yapmamışsa /login sayfasına atsın)', () => {
    // 2. Senaryo: Yükleme bitti ama ortada giriş yapmış bir kullanıcı yok
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      loading: false,
      user: null,
    } as any);

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);
    
    // ProtectedRoute'un bizi Login Page'e (Route: /login) fırlatmasını bekliyoruz
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects customer to /customer if trying to access admin route (Müşteri admin rotasına girmeye çalışırsa müşteri paneline geri atılsın)', () => {
    // 3. Senaryo: Giriş yapan kişinin rolü 'customer', ama onu 'admin' yetkisi isteyen bir sayfaya sokmaya çalışıyoruz.
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      loading: false,
      user: { role: 'customer' },
    } as any);

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);
    
    // Müşterinin admin paneline girmesi engellenip 'Customer Page'e fırlatılmasını bekliyoruz.
    expect(screen.getByText('Customer Page')).toBeInTheDocument();
  });

  it('renders child component (Outlet) if user has allowed role (Kullanıcı doğru yetkiye sahipse içeriği görebilsin)', () => {
    // 4. Senaryo: Giriş yapan kişi tam yetkili bir 'admin'.
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      loading: false,
      user: { role: 'admin' },
    } as any);

    // Outlet'i test edebilmek için alt sayfalı özel bir Router çizimi yapıyoruz
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/protected" element={<div>Gizli Icerik</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    
    // Yönlendirme YAPILMADAN doğrudan sayfayı çizmesini (Outlet) bekliyoruz
    expect(screen.getByText('Gizli Icerik')).toBeInTheDocument();
  });

  it('renders an error boundary screen when AuthContext throws an error (Auth sisteminde çökme yaşanırsa Hata Ekranı göstersin)', () => {
    // 5. Senaryo: Bağlantı koptu veya kritik firebase hatası yaşandı
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      loading: false,
      user: null,
      error: 'Sunucu ile bağlantı koptu. Lütfen daha sonra tekrar deneyin.',
    } as any);

    renderWithRouter(<ProtectedRoute allowedRoles={['admin']} />);
    
    // Uygulama tamamen beyaz ekranda (blank) kalmak veya çökmek yerine zarif bir hata modalı göstermeli
    expect(screen.getByText('Oturum Açma Hatası')).toBeInTheDocument();
    expect(screen.getByText('Sunucu ile bağlantı koptu. Lütfen daha sonra tekrar deneyin.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tekrar Giriş Yap' })).toBeInTheDocument();
  });
});
