import { PlaceholderCard } from "@/components/PlaceholderCard";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Feed() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Feed and updates will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Feed & Updates"
        description="Stay updated with team announcements, shift changes, and important messages from management."
        icon={<MessageSquare className="w-8 h-8" />}
        actionLabel="View Updates"
        onAction={handleAction}
      />
    </div>
  );
}
