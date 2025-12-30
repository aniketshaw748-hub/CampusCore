import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Shield, Loader2 } from 'lucide-react';
import type { AppRole } from '@/types';
import Logo from '@/assets/CampusCoreLogo.svg';

// Firebase Imports
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const roles = [
  {
    id: 'student' as AppRole,
    icon: GraduationCap,
    title: 'Student',
    description: 'Access notices, study materials, and AI-powered exam prep.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'faculty' as AppRole,
    icon: Users,
    title: 'Faculty',
    description: 'Upload and manage course materials, notices, and syllabus.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'admin' as AppRole,
    icon: Shield,
    title: 'Admin',
    description: 'Full access to manage branches, subjects, and all content.',
    color: 'from-amber-500 to-orange-600',
  },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { setDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      // 1. Trigger the Firebase Google Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      if (result.user) {
        // 2. Set the selected role in your AuthContext
        // Note: Make sure your setDemoRole handles persistence (like localStorage)
        setDemoRole(selectedRole);
        
        // 3. Navigate to the dashboard
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error("Firebase Login Error:", error.code, error.message);
      // Optional: Add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <img
              src={Logo}
              alt="CampusCore logo"
              className="w-10 h-10 rounded-lg"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Welcome to CampusCore
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role first, then sign in with Google to continue.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedRole === role.id
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-4`}>
                <role.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">{role.title}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              
              {selectedRole === role.id && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="default" // Changed to default/hero as per your UI
            size="xl"
            onClick={handleGoogleLogin}
            disabled={!selectedRole || loading}
            className="w-full max-w-sm flex gap-3 items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            {loading ? 'Signing in...' : `Sign in as ${selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'User'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}