import { ReactNode } from "react";
import { Plus } from "lucide-react";

interface PlaceholderCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export function PlaceholderCard({ title, description, icon, actionLabel, onAction }: PlaceholderCardProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] border border-zinc-100 flex flex-col items-center justify-center text-center min-h-[400px]">
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 mb-6 border border-zinc-100">
          {icon}
        </div>
      )}
      <h3 className="font-display text-2xl font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-full font-medium bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
