import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Plane, 
  Settings, 
  ShieldAlert,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/rota", label: "Rota", icon: CalendarDays },
  { href: "/app/rota-builder", label: "Rota Builder", icon: Users },
  { href: "/app/holidays", label: "Holidays", icon: Plane },
  { href: "/app/holidays/manage", label: "Manage Holidays", icon: Settings },
  { href: "/app/admin", label: "Admin", icon: ShieldAlert },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const [location] = useLocation();

  const NavContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl font-display shadow-sm shadow-primary/20">
            H
          </div>
          <span className="font-display font-semibold text-xl tracking-tight text-zinc-900">
            HospitalityOS
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                transition-all duration-200 ease-in-out group
                ${isActive 
                  ? 'bg-primary/5 text-primary font-medium' 
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }
              `}>
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
            <span className="text-sm font-medium text-zinc-600 font-display">JD</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900">John Doe</span>
            <span className="text-xs text-zinc-500">Manager</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        <NavContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavContent />
      </div>
    </>
  );
}
