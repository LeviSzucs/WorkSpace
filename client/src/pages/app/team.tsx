import { PlaceholderCard } from "@/components/PlaceholderCard";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Team() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Team directory and management tools will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Team Directory"
        description="View your team members, their availability, skills, and contact information."
        icon={<Users className="w-8 h-8" />}
        actionLabel="View Team"
        onAction={handleAction}
      />
    </div>
  );
}
