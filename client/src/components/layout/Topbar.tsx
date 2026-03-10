import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ onMenuClick, title }: { onMenuClick: () => void, title: string }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5 text-zinc-600" />
        </Button>
        <h1 className="font-display font-semibold text-lg text-zinc-800">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden sm:flex relative items-center">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-9 pr-4 py-2 bg-zinc-100 border-transparent focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/10 rounded-full text-sm w-64 transition-all outline-none"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative text-zinc-500 hover:bg-zinc-100 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-white"></span>
        </Button>
      </div>
    </header>
  );
}
