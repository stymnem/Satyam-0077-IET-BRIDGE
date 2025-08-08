import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface RoleRouteProps {
  allowed: string[];
  children: JSX.Element;
}

export default function RoleRoute({ allowed, children }: RoleRouteProps) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  return allowed.includes(user.role) ? children : <Navigate to="/unauthorized" replace />;
}