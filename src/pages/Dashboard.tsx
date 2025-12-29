import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StudentDashboard } from '@/components/dashboard/StudentDashboard';
import { FacultyDashboard } from '@/components/dashboard/FacultyDashboard';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !userRole) {
      navigate('/landing');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  return (
    <DashboardLayout>
      {userRole === 'student' ? <StudentDashboard /> : <FacultyDashboard />}
    </DashboardLayout>
  );
}
