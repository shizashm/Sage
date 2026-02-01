import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'therapist';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // For demo mode: if not authenticated but we're on a protected route,
  // allow access with a simulated user based on the route
  if (!isAuthenticated) {
    // Check if this is a therapist route for demo purposes
    const isTherapistRoute = location.pathname.startsWith('/therapist');
    
    // In demo mode, we'll allow access - the real app would redirect to login
    // For now, render children with demo data
    // Uncomment below for real auth:
    // return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based routing (for when we have real auth)
  if (requiredRole && user?.role && user.role !== requiredRole) {
    if (user.role === 'therapist') {
      return <Navigate to="/therapist" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
