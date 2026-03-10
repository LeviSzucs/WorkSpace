import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [errorMessage, setErrorMessage] = useState("");
  const { signIn, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const { success, error } = await signIn(email, password);

    if (success) {
      setLocation("/app");
    } else if (error) {
      setErrorMessage(error.message || "Failed to sign in");
    }
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

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-gap-3 gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-50"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-zinc-700">Password</label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all duration-200 disabled:opacity-50"
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

          <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
            <p className="text-xs text-zinc-500 text-center mb-3 font-medium">Demo Credentials</p>
            <div className="space-y-2">
              <p className="text-xs text-zinc-600"><span className="font-medium">Email:</span> demo@example.com</p>
              <p className="text-xs text-zinc-600"><span className="font-medium">Password:</span> password123</p>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-8">
          Don't have an account? <a href="#" className="text-primary font-medium hover:underline">Contact sales</a>
        </p>
      </div>
    </div>
  );
}
