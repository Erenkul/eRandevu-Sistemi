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
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../lib/firebase';

// User type defined locally to avoid import issues
// User type defined locally to avoid import issues
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  businessId?: string;
  businessName?: string;
  role: 'admin' | 'staff' | 'customer';
}

export interface RegisterUserData {
  email: string;
  displayName: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: any; // FieldValue from firestore
  updatedAt: any;
  phoneNumber?: string;
  businessId?: string;
  businessName?: string;
}

export interface BusinessData {
  name: string;
  email: string;
  phone?: string;
  slug: string; // URL friendly name
  ownerId: string;
  isActive: boolean;
  onboardingCompleted: boolean;
  createdAt: any;
  updatedAt: any;
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
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || userData.displayName,
              photoURL: firebaseUser.photoURL || userData.photoURL,
              phoneNumber: userData.phoneNumber,
              businessId: userData.businessId,
              businessName: userData.businessName,
              role: userData.role || 'customer',
            });
          } else {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || undefined,
              photoURL: firebaseUser.photoURL || undefined,
              role: 'customer',
            });
          }
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          
          // Eğer Firestore tarafında bir permission/network hatası aldıysak 
          // (Örn: Adblocker veya izin hatası) hemen çıkış yaptırmıyoruz veya default müşteri yapmıyoruz.
          // En azından Firebase üzerindeki bilgileri temel alarak seansı canlı tutuyoruz.
          const isNetworkError = err.code === 'failed-precondition' || err.message?.includes('network') || err.message?.includes('offline');
          
          if (isNetworkError) {
             console.warn("Veritabanına erişilemiyor. Lütfen Reklam Engelleyici kapalı olduğundan ve internete bağlı olduğunuzdan emin olun.");
             setError("Veritabanı bağlantı hatası. Tarayıcı eklentilerinizi (AdBlock vb.) kontrol edin.");
          }

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            role: 'customer', // Yalnızca en kötü senaryoda fallback
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
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
    } catch (err: any) {
      // For custom thrown errors, they appear as err.message, for Firebase errors, err.code
      const errorMessage = getErrorMessage(err.message === 'role-mismatch-business' || err.message === 'role-mismatch-customer' ? err.message : err.code);
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

      let assignedBusinessId: string | undefined = undefined;

      // If business registration (admin), create a business document first
      if (role === 'admin' && businessName) {
        const newBusinessRef = doc(db, COLLECTIONS.BUSINESSES, newUser.uid); // Using uid as business id for simplicity initially, or auto-generate
        const businessData: BusinessData = {
          name: businessName,
          email: email,
          phone: phone || '',
          slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          ownerId: newUser.uid,
          isActive: true, // Auto-active for now
          onboardingCompleted: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            slotDuration: 30, // Default 30 mins
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

      // Update local state early for better UX before re-auth triggers fully
      setUser(prev => prev ? {
        ...prev,
        ...userData,
        uid: newUser.uid,
        role: role as 'admin' | 'staff' | 'customer'
      } : null);

    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
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
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Remove any fields that shouldn't be updated directly via this method, like uid or role
      delete (updateData as any).uid;
      delete (updateData as any).role;

      await setDoc(userRef, updateData, { merge: true });

      // Update local state
      setUser((prev) => prev ? { ...prev, ...data } : null);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errorMessage = err.code ? getErrorMessage(err.code) : 'Profil güncellenirken bir hata oluştu.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, resetPassword, updateUserProfile, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
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