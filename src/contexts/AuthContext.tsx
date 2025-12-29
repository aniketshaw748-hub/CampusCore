import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, AppRole } from '@/types';
import { auth } from '@/lib/firebase'; // Ensure your firebase config is exported here
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

interface AuthContextType {
  profile: Profile | null;
  userRole: AppRole | null;
  loading: boolean;
  setDemoRole: (role: AppRole) => void;
  signOut: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(() => {
    return localStorage.getItem('user_role') as AppRole | null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This is the core Firebase listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Map Firebase user details to your Profile type
        setProfile({
          id: user.uid,
          email: user.email || '',
          full_name: user.displayName || 'Anonymous User',
          avatar_url: user.photoURL,
          branch: userRole == "student" ? 'CS' : null, // Defaulting these as they come from your DB later
          semester: userRole == "student" ? 4 : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } else {
        setProfile(null);
        setUserRole(null);
        localStorage.removeItem('user_role');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Updates the role and persists it in LocalStorage
  const setDemoRole = (role: AppRole) => {
    localStorage.setItem('user_role', role);
    setUserRole(role);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('user_role');
      setUserRole(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{
      profile,
      userRole,
      loading,
      setDemoRole,
      signOut,
      updateProfile,
    }}>
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