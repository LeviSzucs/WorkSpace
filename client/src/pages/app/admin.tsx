import { PlaceholderCard } from "@/components/PlaceholderCard";
import { ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Settings saved",
      description: "Company settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['Company Details', 'Users & Roles', 'Locations', 'Integrations'].map((setting) => (
          <div key={setting} className="bg-white p-4 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all">
            <h4 className="font-medium text-zinc-800">{setting}</h4>
            <p className="text-xs text-zinc-400 mt-1">Configure {setting.toLowerCase()}</p>
          </div>
        ))}
      </div>

      <PlaceholderCard
        title="Administration & Settings"
        description="Manage global settings, user permissions, multi-location setups, and billing information for your HospitalityOS workspace."
        icon={<ShieldAlert className="w-8 h-8" />}
        actionLabel="Save Global Settings"
        onAction={handleAction}
      />
    </div>
  );
}
