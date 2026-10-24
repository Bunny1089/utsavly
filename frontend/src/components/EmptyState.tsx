import React from "react";
import { Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center ui-card border-dashed border-[var(--border)] my-6">
      <div className="w-14 h-14 rounded-[14px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
        <Icon className="w-7 h-7" strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-xl font-bold text-[var(--text)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
};
