import React, { useState } from "react";
import {
  Sparkles,
  Palette,
  UtensilsCrossed,
  Music,
  Mail,
  Gift,
  Bookmark,
  BookmarkCheck,
  RefreshCw
} from "lucide-react";
import type { Idea, IdeaKind, Event } from "../types";
import { api } from "../services/api";

interface IdeasViewProps {
  event: Event;
  ideas: Idea[];
  onRefresh: () => Promise<void>;
}

export const IdeasView: React.FC<IdeasViewProps> = ({
  event,
  ideas,
  onRefresh
}) => {
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggleSaved = async (idea: Idea) => {
    setTogglingId(idea.id);
    try {
      await api.toggleIdeaSaved(idea.id, !idea.saved);
      await onRefresh();
    } catch (err) {
      console.error("Failed to toggle idea:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      await api.generateIdeas(event.id);
      await onRefresh();
    } catch (err) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getKindIcon = (k: IdeaKind) => {
    switch (k) {
      case "decor":
        return <Palette className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />;
      case "menu":
        return <UtensilsCrossed className="w-3.5 h-3.5 text-[var(--warning)]" strokeWidth={1.75} />;
      case "entertainment":
        return <Music className="w-3.5 h-3.5 text-[var(--accent)]" strokeWidth={1.75} />;
      case "invites":
        return <Mail className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />;
      case "gifts":
        return <Gift className="w-3.5 h-3.5 text-[var(--success)]" strokeWidth={1.75} />;
    }
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case "low":
        return "badge-success";
      case "medium":
        return "badge-warning";
      case "high":
        return "badge-primary";
      default:
        return "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]";
    }
  };

  const filteredIdeas =
    selectedKind === "all"
      ? ideas
      : ideas.filter((idea) => idea.kind === selectedKind);

  const savedCount = ideas.filter((i) => i.saved).length;

  const filters = [
    { id: "all", label: "All Ideas" },
    { id: "decor", label: "Decor" },
    { id: "menu", label: "Menu & Food" },
    { id: "entertainment", label: "Entertainment" },
    { id: "invites", label: "Invites" },
    { id: "gifts", label: "Favors & Gifts" }
  ];

  return (
    <div className="space-y-8 page-transition">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Personalized Ideas
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[65ch]">
            Curated cultural concepts and vendor suggestions tailored to {event.city} and your {event.culture || "Indian"} celebration.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-[8px] bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] tabular-nums inline-flex items-center gap-1.5">
            <BookmarkCheck className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />
            <span>{savedCount} Added to Plan</span>
          </span>

          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="btn-primary"
            aria-label="Generate More Ideas"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            )}
            <span>{isGenerating ? "Generating..." : "Generate More Ideas"}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Filter Ideas by Category">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedKind(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedKind === f.id
                ? "bg-[var(--accent)] text-[var(--on-accent)] font-bold shadow-sm"
                : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--text)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className={`ui-card flex flex-col justify-between transition-all ${
              idea.saved
                ? "border-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]"
                : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)]">
                  {getKindIcon(idea.kind)}
                  <span className="capitalize">{idea.kind}</span>
                </span>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] capitalize ${getEffortBadge(
                    idea.effort
                  )}`}
                >
                  {idea.effort} Effort
                </span>
              </div>

              <h3 className="font-heading text-base font-bold text-[var(--text)] mb-2 leading-snug">
                {idea.title}
              </h3>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-4">
                {idea.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] block font-medium">
                  Estimated Cost
                </span>
                <span className="font-heading text-sm font-bold text-[var(--text)] tabular-nums">
                  ₹{idea.est_cost.toLocaleString("en-IN")}
                </span>
              </div>

              <button
                onClick={() => handleToggleSaved(idea)}
                disabled={togglingId === idea.id}
                className={`btn-secondary h-9 text-xs px-3 inline-flex items-center gap-1.5 ${
                  idea.saved
                    ? "bg-[var(--surface-2)] text-[var(--primary)] border-[var(--primary)]"
                    : ""
                }`}
                aria-label={idea.saved ? "Remove from Plan" : "Add to Plan"}
              >
                {idea.saved ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5 text-[var(--success)]" strokeWidth={2} />
                    <span>In Plan</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" strokeWidth={1.75} />
                    <span>Add to Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
