import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      sessionStorage.setItem("dummy_auth", "true");
      setLocation("/app");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl font-display shadow-lg shadow-primary/30">
              H
            </div>
            <span className="font-display font-semibold text-2xl tracking-tight text-zinc-900">
              HospitalityOS
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden">
          {/* Decorative subtle gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40"></div>
          
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold font-display text-zinc-900 mb-2">Welcome back</h1>
            <p className="text-zinc-500 text-sm">Sign in to manage your team and schedules.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Work Email</label>
              <input 
                type="email" 
                defaultValue="manager@hospitality.os"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                defaultValue="password123"
                required
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 px-4 py-3.5 rounded-xl font-medium bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in to workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-8">
          Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Contact sales</a>
        </p>
      </div>
    </div>
  );
}
