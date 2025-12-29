import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, Shield, Loader2 } from 'lucide-react';
import type { AppRole } from '@/types';

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

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);
  const { setDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!selectedRole) return;
    setLoading(true);
    setDemoRole(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Welcome to CampusCore
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to get started with a personalized experience.
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
            variant="hero"
            size="xl"
            onClick={handleContinue}
            disabled={!selectedRole || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
