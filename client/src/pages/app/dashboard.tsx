import { PlaceholderCard } from "@/components/PlaceholderCard";
import { LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Action triggered",
      description: "Dashboard customization will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Staff on Shift Today", value: "24", trend: "+2 from yesterday" },
          { label: "Pending Holiday Requests", value: "7", trend: "Needs attention" },
          { label: "Labor Cost (Week)", value: "$12,450", trend: "-4% vs last week" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
            <h4 className="text-sm font-medium text-zinc-500 mb-1">{stat.label}</h4>
            <div className="text-3xl font-display font-bold text-zinc-900 mb-2">{stat.value}</div>
            <div className="text-xs text-zinc-400">{stat.trend}</div>
          </div>
        ))}
      </div>

      <PlaceholderCard
        title="Welcome to your new Dashboard"
        description="This is a clean, minimal workspace. Soon you will see aggregated metrics, today's schedule at a glance, and urgent notifications here."
        icon={<LayoutDashboard className="w-8 h-8" />}
        actionLabel="Customize Dashboard"
        onAction={handleAction}
      />
    </div>
  );
}
