import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Landing from './Landing';

export default function Index() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole) {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  return <Landing />;
}
