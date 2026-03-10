import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import * as FirebaseAuth from 'firebase/auth';
import * as FirebaseFirestore from 'firebase/firestore';

// 1. Firebase Authentication'ı (Kayıt/Giriş Sistemi) sahte (mock) hale getiriyoruz
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  updateProfile: vi.fn(),
}));

// 2. Firebase Firestore'u (Veri tabanı) sahte (mock) hale getiriyoruz
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

// 3. İçerisindeki firebase referanslarının hata vermemesi için kendi firebase.ts dosyamızı da mockluyoruz
vi.mock('../lib/firebase', () => ({
  auth: {},
  db: {},
  COLLECTIONS: {
    USERS: 'users',
    BUSINESSES: 'businesses'
  }
}));

// Test için AuthProvider'ı saran ve içindeki verileri (user, auth falan) ekrana yazdıran uydurma (dummy) bir bileşen
const TestComponent = () => {
  const { user, loading, error } = useAuth();

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div>
      <span data-testid="user-email">{user ? user.email : 'Giriş Yapılmadı'}</span>
      <span data-testid="user-role">{user ? user.role : 'Yok'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initially shows loading state (Başlangıçta yükleniyor durumunu göstermeli)', () => {
    // onAuthStateChanged (Kullanıcı durumunu dinle) fonksiyonunun henüz bir cevap vermediğini varsayıyoruz.
    vi.mocked(FirebaseAuth.onAuthStateChanged).mockImplementation(() => {
      return () => {}; // Dönüş (unsubscribe) fonksiyonu
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Sistem durumun ne olduğunu Firebase'den öğrenene kadar "Yükleniyor..." demelidir
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  it('updates state when a user is already logged in (Giriş yapmış bir kullanıcı bulunduğunda durumu güncellemeli)', async () => {
    // Firebase: "Evet abi, Ahmet adında birisi giriş yapmış durumda" desin
    vi.mocked(FirebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback: any) => {
      // Callback'i sahte bir Firebase kullanıcısı verisiyle tetikliyoruz
      callback({ uid: '12345', email: 'test@ornek.com', displayName: 'Ahmet' } as any);
      return () => {};
    });

    // Firestore Veritabanı: "Ahmet'in veritabanı kaydında rolü 'customer' imiş" desin
    vi.mocked(FirebaseFirestore.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayName: 'Ahmet', role: 'customer' })
    } as any);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Yükleme ekranı gidip, Ahmet'in e-postasının ve rolünün ekrana (Component'e) aktarılmasını (State) bekliyoruz
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@ornek.com');
      expect(screen.getByTestId('user-role')).toHaveTextContent('customer');
    });
  });

  it('sets user to null if no one is logged in (Kimse giriş yapmadıysa kullanıcıyı null yapmalı)', async () => {
    // Firebase: "Şu an sistemde kimse yok" desin (null döndürsün)
    vi.mocked(FirebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback: any) => {
      callback(null as any);
      return () => {};
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Ekranda (Component'te) 'Giriş Yapılmadı' yazmasını bekliyoruz
    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toHaveTextContent('Giriş Yapılmadı');
    });
  });
});
