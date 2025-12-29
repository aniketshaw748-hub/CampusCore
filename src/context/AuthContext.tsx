import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, AppRole } from '@/types';

interface AuthContextType {
  profile: Profile | null;
  userRole: AppRole | null;
  loading: boolean;
  setDemoRole: (role: AppRole) => void;
  signOut: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo mode - no real authentication
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(() => {
    const saved = localStorage.getItem('demo_role');
    return saved as AppRole | null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load demo profile based on role
    if (userRole) {
      setProfile({
        id: 'demo-user',
        email: `demo-${userRole}@campus.edu`,
        full_name: userRole === 'student' ? 'Demo Student' : userRole === 'faculty' ? 'Prof. Demo' : 'Admin User',
        avatar_url: null,
        branch: 'CS',
        semester: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  }, [userRole]);

  const setDemoRole = (role: AppRole) => {
    localStorage.setItem('demo_role', role);
    setUserRole(role);
    setProfile({
      id: 'demo-user',
      email: `demo-${role}@campus.edu`,
      full_name: role === 'student' ? 'Demo Student' : role === 'faculty' ? 'Prof. Demo' : 'Admin User',
      avatar_url: null,
      branch: 'CS',
      semester: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const signOut = () => {
    localStorage.removeItem('demo_role');
    setUserRole(null);
    setProfile(null);
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
