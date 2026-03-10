import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { AlertCircle, Home } from "lucide-react";

export default function NoAccess() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-display text-zinc-900 mb-3">
          Access Denied
        </h1>

        <p className="text-zinc-600 mb-2">
          It looks like you don't have an active membership yet.
        </p>

        <p className="text-sm text-zinc-500 mb-8">
          Please contact your organization administrator to request access to HospitalityOS.
        </p>

        <Button
          onClick={() => setLocation("/login")}
          className="gap-2"
        >
          <Home className="w-4 h-4" />
          Return to Login
        </Button>

        <div className="mt-8 p-4 rounded-lg bg-zinc-100 border border-zinc-200">
          <p className="text-xs text-zinc-600">
            <span className="font-medium">Need help?</span> Contact your venue manager or organization admin.
          </p>
        </div>
      </div>
    </div>
  );
}
