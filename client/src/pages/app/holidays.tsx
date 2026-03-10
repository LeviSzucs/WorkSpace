import { PlaceholderCard } from "@/components/PlaceholderCard";
import { Plane } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Holidays() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Request opened",
      description: "The time-off request modal will appear here.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-100 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-zinc-500 mb-1">Your Allowance</div>
            <div className="text-2xl font-bold font-display text-zinc-900">14 <span className="text-base font-normal text-zinc-400">days left</span></div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary">50%</span>
          </div>
        </div>
      </div>

      <PlaceholderCard
        title="Time Off & Holidays"
        description="View your personal holiday allowance, upcoming approved time off, and submit new requests to your manager."
        icon={<Plane className="w-8 h-8" />}
        actionLabel="Request Time Off"
        onAction={handleAction}
      />
    </div>
  );
}
