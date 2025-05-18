
"use client";

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  type User as FirebaseUser, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';
import type { LoginFormInputs, SignupFormInputs } from '@/types';
import { Skeleton } from '@/components/ui/skeleton'; // For loading UI

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  login: (data: LoginFormInputs) => Promise<void>;
  signup: (data: SignupFormInputs) => Promise<void>;
  logout: () => Promise<void>;
  childNameContext: string | null; // Store childName from signup
  setChildNameContext: Dispatch<SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [childNameContext, setChildNameContext] = useState<string | null>(null); // For child's name
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (data: LoginFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login.');
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data: SignupFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.parentName,
        });
        // Store childName in context (in a real app, this might go to Firestore)
        setChildNameContext(data.childName); 
        setCurrentUser(auth.currentUser); // Refresh user state
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to signup.');
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setChildNameContext(null); // Clear childName on logout
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to logout.');
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Route protection logic
  useEffect(() => {
    if (!loading && !currentUser && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
    if (!loading && currentUser && (pathname === '/login' || pathname === '/signup')) {
      router.push('/dashboard');
    }
  }, [currentUser, loading, pathname, router]);


  const value = {
    currentUser,
    loading,
    error,
    setError,
    login,
    signup,
    logout,
    childNameContext,
    setChildNameContext,
  };

  // Show a loading screen for the entire app while auth state is resolving
  if (loading && (pathname !== '/login' && pathname !== '/signup')) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 p-8 rounded-lg shadow-xl bg-card w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-full mt-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
