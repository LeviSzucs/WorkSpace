import { PlaceholderCard } from "@/components/PlaceholderCard";
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Budgets() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Budget planning and labor cost management will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Budget Management"
        description="Track labor costs, optimize staffing spend, and manage departmental budgets."
        icon={<DollarSign className="w-8 h-8" />}
        actionLabel="View Budget"
        onAction={handleAction}
      />
    </div>
  );
}
