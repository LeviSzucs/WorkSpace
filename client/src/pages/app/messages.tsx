import { PlaceholderCard } from "@/components/PlaceholderCard";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Direct messaging with team members will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Messages"
        description="Communicate directly with your team, managers, and colleagues all in one place."
        icon={<Mail className="w-8 h-8" />}
        actionLabel="Send Message"
        onAction={handleAction}
      />
    </div>
  );
}
