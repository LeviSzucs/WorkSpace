import { PlaceholderCard } from "@/components/PlaceholderCard";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Forecasts() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Revenue forecasts and demand predictions will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Revenue Forecasts"
        description="AI-powered revenue forecasting based on historical trends, events, and staffing levels."
        icon={<TrendingUp className="w-8 h-8" />}
        actionLabel="View Forecasts"
        onAction={handleAction}
      />
    </div>
  );
}
