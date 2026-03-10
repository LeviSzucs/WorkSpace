import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useRole } from '@/hooks/use-role';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

export function RoleBasedRedirect({ children }: RoleBasedRedirectProps) {
  const [location, setLocation] = useLocation();
  const { isLoading, getDefaultRoute, hasValidMembership } = useRole();

  useEffect(() => {
    if (isLoading) return;

    // Only redirect on dashboard page, not on other pages
    if (location === '/app') {
      const defaultRoute = getDefaultRoute();
      if (defaultRoute !== '/app') {
        setLocation(defaultRoute);
      }
    }
  }, [location, isLoading, getDefaultRoute, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Loading your access level...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
