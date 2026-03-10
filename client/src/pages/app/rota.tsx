import { PlaceholderCard } from "@/components/PlaceholderCard";
import { CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Rota() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Exporting Rota",
      description: "PDF export functionality coming soon.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation Fake */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-zinc-100 shadow-sm w-fit mx-auto sm:mx-0">
        <button className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors">&larr;</button>
        <div className="px-4 font-medium text-zinc-900">Current Week (Oct 16 - 22)</div>
        <button className="px-3 py-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors">&rarr;</button>
      </div>

      <PlaceholderCard
        title="Published Rota View"
        description="This page will display the live, published schedule. Staff can check their shifts here. Changes made here will instantly notify affected team members."
        icon={<CalendarDays className="w-8 h-8" />}
        actionLabel="Print / Export PDF"
        onAction={handleAction}
      />
    </div>
  );
}
