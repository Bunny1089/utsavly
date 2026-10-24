import React from "react";
import { Sun, Moon, Sparkles, MapPin, Calendar, Clock, ChevronDown } from "lucide-react";
import type { Event } from "../types";

interface HeaderProps {
  events: Event[];
  activeEvent: Event | null;
  onSelectEvent: (event: Event) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenWizard: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  isDark,
  onToggleTheme,
  onOpenWizard
}) => {
  const getDaysLeft = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      const diff = Math.ceil((target.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const daysLeft = activeEvent ? getDaysLeft(activeEvent.date) : 0;

  return (
    <header className="h-16 bg-[var(--surface)] border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Event Details and Switcher */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        {events.length > 0 && (
          <div className="relative shrink-0">
            <select
              aria-label="Switch Active Celebration"
              value={activeEvent?.id || ""}
              onChange={(e) => {
                const selected = events.find((ev) => ev.id === Number(e.target.value));
                if (selected) onSelectEvent(selected);
              }}
              className="appearance-none h-10 bg-[var(--surface-2)] border border-[var(--border)] rounded-[10px] pl-3.5 pr-8 text-xs sm:text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)] focus:outline-none cursor-pointer tabular-nums"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-[var(--surface)] text-[var(--text)]">
                  {ev.title} ({ev.type})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.75} />
          </div>
        )}

        {activeEvent && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" strokeWidth={1.75} />
              <span>{activeEvent.city}</span>
            </span>

            <span className="text-[var(--border)]">•</span>

            <span className="inline-flex items-center gap-1 tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" strokeWidth={1.75} />
              <span>{activeEvent.date}</span>
            </span>

            <span className="text-[var(--border)]">•</span>

            <span className="inline-flex items-center gap-1 font-semibold text-[var(--text)] tabular-nums px-2 py-0.5 rounded-[6px] bg-[var(--surface-2)] border border-[var(--border)]">
              <Clock className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />
              <span>{daysLeft} days to go</span>
            </span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--success)] text-xs font-semibold border border-[var(--border)]">
          <Sparkles className="w-3.5 h-3.5 text-[var(--success)]" strokeWidth={1.75} />
          <span>GenAI Engine Active</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to Light theme" : "Switch to Dark theme"}
          className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)] flex items-center justify-center transition-colors"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[var(--accent)]" strokeWidth={1.75} />
          ) : (
            <Moon className="w-4 h-4 text-[var(--primary)]" strokeWidth={1.75} />
          )}
        </button>

        {/* Mobile New Celebration Trigger */}
        <button
          onClick={onOpenWizard}
          className="md:hidden btn-primary text-xs h-9 px-3"
          aria-label="New Celebration"
        >
          + New
        </button>
      </div>
    </header>
  );
};
