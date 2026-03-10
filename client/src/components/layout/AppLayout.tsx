import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useLocation } from "wouter";

const ROUTE_TITLES: Record<string, string> = {
  "/app": "Overview Dashboard",
  "/app/rota": "Team Rota",
  "/app/rota-builder": "Rota Builder",
  "/app/holidays": "Holidays",
  "/app/holidays/manage": "Manage Holidays",
  "/app/admin": "Administration",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  // Simple dummy auth check
  useEffect(() => {
    const isAuth = sessionStorage.getItem("dummy_auth");
    if (!isAuth) {
      setLocation("/login");
    }
  }, [location, setLocation]);

  const title = ROUTE_TITLES[location] || "HospitalityOS";

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex w-full overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
