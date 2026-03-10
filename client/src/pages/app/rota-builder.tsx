import { PlaceholderCard } from "@/components/PlaceholderCard";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RotaBuilder() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Creating new draft",
      description: "Opening the interactive rota builder interface...",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-zinc-100">
        <div>
          <h2 className="font-semibold text-zinc-900">Next Week's Draft</h2>
          <p className="text-sm text-zinc-500">Oct 23 - Oct 29</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-lg transition-colors border border-zinc-200">
            Copy previous
          </button>
          <button 
            onClick={handleAction}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-colors"
          >
            Start from scratch
          </button>
        </div>
      </div>

      <PlaceholderCard
        title="Build Your Schedule"
        description="The Rota Builder will feature a powerful drag-and-drop interface. You'll be able to assign shifts, view staff availability, and monitor labor costs in real-time."
        icon={<Users className="w-8 h-8" />}
        actionLabel="Start New Rota"
        onAction={handleAction}
      />
    </div>
  );
}
