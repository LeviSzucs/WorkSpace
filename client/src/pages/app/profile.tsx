import { PlaceholderCard } from "@/components/PlaceholderCard";
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Coming Soon",
      description: "Profile management and preferences will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
      <PlaceholderCard
        title="Your Profile"
        description="Manage your personal information, preferences, and notification settings."
        icon={<User className="w-8 h-8" />}
        actionLabel="Edit Profile"
        onAction={handleAction}
      />
    </div>
  );
}
