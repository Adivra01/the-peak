import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
  requireOrganizer?: boolean;
  requireSupervisor?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false, requireManager = false, requireOrganizer = false, requireSupervisor = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isManager, isOrganizer, isSupervisor, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    if (requireOrganizer) return <Navigate to="/organizer-auth" replace />;
    if (requireManager) return <Navigate to="/manager-auth" replace />;
    if (requireSupervisor) return <Navigate to="/supervisor-auth" replace />;
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/manager-auth" replace />;
  }

  if (requireOrganizer && !isOrganizer) {
    return <Navigate to="/organizer-auth" replace />;
  }

  if (requireSupervisor && !isSupervisor) {
    return <Navigate to="/supervisor-auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
