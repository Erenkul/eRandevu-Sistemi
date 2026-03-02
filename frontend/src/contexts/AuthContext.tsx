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
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  businessId?: string;
  businessName?: string;
  role: 'admin' | 'staff' | 'customer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, phone?: string, role?: 'admin' | 'customer', businessName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            role: 'customer',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err.code);
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

      const userData: any = {
        email,
        displayName,
        role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (phone) userData.phoneNumber = phone;

      // If business registration (admin), we might want to create a business document too
      // For now just saving businessName in user doc or similar
      if (businessName) userData.businessName = businessName;

      await setDoc(doc(db, COLLECTIONS.USERS, newUser.uid), userData);
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

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, resetPassword, clearError }}>
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
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Hatalı şifre.',
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
    'auth/weak-password': 'Şifre en az 6 karakter olmalıdır.',
    'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
  };
  return messages[code] || 'Bir hata oluştu.';
}