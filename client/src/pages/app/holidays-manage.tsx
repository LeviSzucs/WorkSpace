import { PlaceholderCard } from "@/components/PlaceholderCard";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HolidaysManage() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Bulk processing",
      description: "Bulk approval functionality will be implemented.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Fake Tabs */}
      <div className="flex gap-6 border-b border-zinc-200">
        <button className="pb-4 text-sm font-medium text-primary border-b-2 border-primary">
          Pending Requests (7)
        </button>
        <button className="pb-4 text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
          Approved
        </button>
        <button className="pb-4 text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
          Team Balances
        </button>
      </div>

      <PlaceholderCard
        title="Manage Team Time Off"
        description="Approve or decline holiday requests from your team. Conflicts with the rota will be automatically highlighted to prevent understaffing."
        icon={<Settings className="w-8 h-8" />}
        actionLabel="Review Pending"
        onAction={handleAction}
      />
    </div>
  );
}
