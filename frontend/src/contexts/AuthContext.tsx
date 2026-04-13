// ===========================================
// eRandevu - Authentication Context
// ===========================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, getDoc, setDoc, serverTimestamp, type FieldValue } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';
import type { User } from '../types';

export interface RegisterUserData {
  email: string;
  displayName: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: FieldValue;
  updatedAt: FieldValue;
  phoneNumber?: string;
  businessId?: string;
  businessName?: string;
}

export interface BusinessData {
  name: string;
  email: string;
  phone?: string;
  slug: string;
  ownerId: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: FieldValue;
  updatedAt: FieldValue;
  settings: {
    slotDuration: number;
    currency: string;
    timezone: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, expectedPortal?: 'business' | 'customer') => Promise<void>;
  register: (email: string, password: string, displayName: string, phone?: string, role?: 'admin' | 'customer', businessName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setMinimalUser = (firebaseUser: FirebaseUser, userError?: string) => {
    if (userError) setError(userError);
    setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
      role: 'customer',
      phoneNumber: undefined,
      businessId: undefined,
      businessName: undefined,
    });
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || 'customer';
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              phoneNumber: userData.phoneNumber,
              businessId: userData.businessId,
              businessName: userData.businessName,
              role,
              favoriteBusinessIds: userData.favoriteBusinessIds || [],
            });
            setLoading(false);
          } else {
            console.warn('User document not found, using minimal data');
            setMinimalUser(firebaseUser);
            return;
          }
        } catch (err: unknown) {
          console.error('Error fetching user data:', err);
          
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('Missing or insufficient permissions');
          const isNetworkError = errorMessage.includes('network') || errorMessage.includes('offline');
          const isBlockedError = errorMessage.includes('BLOCKED');
          
          if (isBlockedError) {
            setMinimalUser(firebaseUser, "Firebase bağlantısı engellendi. Lütfen Reklam Engelleyici (AdBlock) eklentisini devre dışı bırakın veya bu site için beyaz listeye alın.");
            return;
          }
          
          if (isNetworkError) {
            setMinimalUser(firebaseUser, "Veritabanı bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.");
            return;
          }
          
          if (isPermissionError) {
            setMinimalUser(firebaseUser, "Veritabanı erişim izni yok. Lütfen daha sonra tekrar deneyin veya iletişim formunu kullanın.");
            return;
          }

          setMinimalUser(firebaseUser, "Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.");
          return;
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, expectedPortal?: 'business' | 'customer') => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (expectedPortal) {
        // Fetch user data early to verify role matches the portal they're logging into
        const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));

        // Ensure user document exists, defaulting to customer role if not fully onboarded in firestore
        const userData = userDoc.exists() ? userDoc.data() : null;
        const actualRole = userData?.role || 'customer';

        if (expectedPortal === 'business' && actualRole === 'customer') {
          await signOut(auth); // Sign out unauthorized user
          throw new Error('role-mismatch-business');
        }

        if (expectedPortal === 'customer' && (actualRole === 'admin' || actualRole === 'staff')) {
          await signOut(auth); // Sign out unauthorized user
          throw new Error('role-mismatch-customer');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof FirebaseError
        ? getErrorMessage(err.code)
        : err instanceof Error
          ? getErrorMessage(err.message)
          : 'Bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    phone?: string,
    role: 'admin' | 'customer' = 'customer',
    businessName?: string
  ) => {
    try {
      setError(null);
      const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(newUser, { displayName });

      try {
        let assignedBusinessId: string | undefined = undefined;

        if (role === 'admin' && businessName) {
          const newBusinessRef = doc(db, COLLECTIONS.BUSINESSES, newUser.uid);
          const businessData: BusinessData = {
            name: businessName,
            email: email,
            phone: phone || '',
            slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ownerId: newUser.uid,
            isActive: true,
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            settings: {
              slotDuration: 30,
              currency: 'TRY',
              timezone: 'Europe/Istanbul',
            }
          };
          await setDoc(newBusinessRef, businessData);
          assignedBusinessId = newBusinessRef.id;
        }

        const userData: RegisterUserData = {
          email,
          displayName,
          role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        if (phone) userData.phoneNumber = phone;
        if (businessName) userData.businessName = businessName;
        if (assignedBusinessId) userData.businessId = assignedBusinessId;

        await setDoc(doc(db, COLLECTIONS.USERS, newUser.uid), userData);

        setUser(prev => prev ? {
          ...prev,
          ...userData,
          uid: newUser.uid,
          role: role as 'admin' | 'staff' | 'customer'
        } : null);
      } catch (dbError) {
        // If Firestore writes fail, try to clean up the Auth user to prevent orphaned unlinked accounts
        try {
          await newUser.delete();
        } catch (deleteErr) {
          console.error("Failed to clean up Firebase Auth user:", deleteErr);
        }
        throw dbError;
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof FirebaseError
        ? getErrorMessage(err.code)
        : err instanceof Error
          ? getErrorMessage(err.message)
          : 'Bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: unknown) {
      const errorMessage = err instanceof FirebaseError
        ? getErrorMessage(err.code)
        : err instanceof Error
          ? getErrorMessage(err.message)
          : 'Bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: unknown) {
      const errorMessage = err instanceof FirebaseError
        ? getErrorMessage(err.code)
        : err instanceof Error
          ? getErrorMessage(err.message)
          : 'Bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error('Oturum açmış kullanıcı bulunamadı.');

    try {
      setError(null);

      // Update Auth Profile if displayName or photoURL changed
      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser!, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }

      // Update Firestore user document
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      const updateData: Partial<User> & { updatedAt: FieldValue } = {
        ...data,
        updatedAt: serverTimestamp()
      };

      delete (updateData as Record<string, unknown>).uid;
      delete (updateData as Record<string, unknown>).role;

      await setDoc(userRef, updateData, { merge: true });

      // Update local state
      setUser((prev) => prev ? { ...prev, ...data } : null);

    } catch (err: unknown) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof FirebaseError
        ? getErrorMessage(err.code)
        : 'Profil güncellenirken bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  const toggleFavorite = async (businessId: string) => {
    if (!user) throw new Error('Oturum açmış kullanıcı bulunamadı.');

    const currentFavorites = user.favoriteBusinessIds || [];
    const isFavorite = currentFavorites.includes(businessId);
    const newFavorites = isFavorite
      ? currentFavorites.filter(id => id !== businessId)
      : [...currentFavorites, businessId];

    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await setDoc(userRef, { favoriteBusinessIds: newFavorites }, { merge: true });
    setUser(prev => prev ? { ...prev, favoriteBusinessIds: newFavorites } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, resetPassword, updateUserProfile, toggleFavorite, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/invalid-credential': 'Bu e-posta veya şifre hatalı.',
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Hatalı şifre.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
    'role-mismatch-business': 'Bu e-posta adresi bir müşteri hesabına aittir. İşletme girişi yapamazsınız.',
    'role-mismatch-customer': 'Bu e-posta adresi bir işletme hesabına aittir. Müşteri girişi yapamazsınız.'
  };
  return messages[code] || 'Bir hata oluştu.';
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}