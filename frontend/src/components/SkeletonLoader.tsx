import React from "react";
import { Sparkles } from "lucide-react";

interface SkeletonLoaderProps {
  label?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  label = "Generating your plan with AI..."
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center ui-card border-[var(--border)] my-6 animate-pulse">
      <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4 animate-spin">
        <Sparkles className="w-6 h-6" strokeWidth={1.75} />
      </div>
      <p className="font-heading text-base font-bold text-[var(--text)] mb-3">
        {label}
      </p>
      <div className="w-48 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden relative border border-[var(--border)]">
        <div className="w-1/2 h-full bg-[var(--primary)] animate-pulse" />
      </div>
    </div>
  );
};
