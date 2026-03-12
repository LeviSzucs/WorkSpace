import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRole } from '@/hooks/use-role';

type Role = 'STAFF' | 'VENUE_MANAGER' | 'SUPERVISOR' | 'HEAD_OFFICE' | 'ORG_ADMIN';

interface RouteAccessMap {
  [path: string]: Role[];
}

// Define which roles can access which routes
const ROUTE_ACCESS_MAP: RouteAccessMap = {
  '/app': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/rota': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/rota-builder': ['VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/holidays': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/holidays/manage': ['VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/feed': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/messages': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/profile': ['STAFF', 'VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/forecasts': ['VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/budgets': ['VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/team': ['VENUE_MANAGER', 'SUPERVISOR', 'HEAD_OFFICE', 'ORG_ADMIN'],
  '/app/admin': ['HEAD_OFFICE', 'ORG_ADMIN'],
};

interface RoleAccessControlProps {
  children: React.ReactNode;
}

export function RoleAccessControl({ children }: RoleAccessControlProps) {
  const [location, setLocation] = useLocation();
  const { role, isLoading } = useRole();

  useEffect(() => {
    if (isLoading || !role) return;

    // Check if current route requires access control
    const allowedRoles = ROUTE_ACCESS_MAP[location];

    if (allowedRoles && !allowedRoles.includes(role as Role)) {
      // User doesn't have access to this route
      // Redirect to appropriate default page based on role
      if (role === 'STAFF') {
        setLocation('/app/rota');
      } else if (role === 'ORG_ADMIN' || role === 'HEAD_OFFICE') {
        setLocation('/app/rota-builder');
      } else {
        setLocation('/app/rota-builder');
      }
    }
  }, [location, role, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
