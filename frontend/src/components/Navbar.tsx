import React from "react";
import {
  LayoutDashboard,
  PieChart,
  CalendarDays,
  Users2,
  Lightbulb,
  BotMessageSquare,
  FileSpreadsheet,
  Plus,
  Home,
  Sparkles
} from "lucide-react";
import { APP_NAME } from "../types";
import type { EventType } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  eventType: EventType;
  onOpenWizard: () => void;
  onOpenLanding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  eventType,
  onOpenWizard,
  onOpenLanding
}) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "budget", label: "Budget", icon: PieChart },
    { id: "timeline", label: "Timeline", icon: CalendarDays },
    { id: "vendors", label: "Vendors", icon: Users2 },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "copilot", label: "Copilot", icon: BotMessageSquare },
    { id: "runsheet", label: "Run Sheet", icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Desktop Fixed Sidebar (264px) */}
      <aside className="hidden md:flex flex-col w-[264px] bg-[var(--surface)] border-r border-[var(--border)] p-6 shrink-0 min-h-screen sticky top-0 z-30">
        {/* Brand Logo & Title */}
        <div
          onClick={onOpenLanding}
          className="flex items-center gap-3 mb-6 cursor-pointer group"
          role="button"
          tabIndex={0}
        >
          <div className="w-10 h-10 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] group-hover:border-[var(--primary)] transition-colors">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" strokeWidth={1.75} />
          </div>
          <div>
            <span className="font-heading text-xl font-bold tracking-tight text-[var(--text)]">
              {APP_NAME}
            </span>
            <span className="block text-[11px] font-medium text-[var(--text-muted)]">
              Event Planning Studio
            </span>
          </div>
        </div>

        {/* Primary Action Button (44px height, 12px radius, yellow/amber) */}
        <button
          onClick={onOpenWizard}
          className="btn-primary w-full mb-6"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>New Celebration</span>
        </button>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1" aria-label="Main Navigation">
          <button
            onClick={onOpenLanding}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
              currentTab === "landing"
                ? "bg-[var(--surface-2)] text-[var(--text)] font-semibold nav-active-indicator"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            }`}
          >
            <Home className="w-4 h-4" strokeWidth={1.75} />
            <span>Landing Page</span>
          </button>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[var(--surface-2)] text-[var(--text)] font-semibold nav-active-indicator"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[var(--primary)]" : "text-[var(--text-muted)]"
                  }`}
                  strokeWidth={1.75}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Event Edition Indicator */}
        <div className="pt-4 mt-auto border-t border-[var(--border)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1.5">
            Event Context:
          </span>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[8px] text-xs font-semibold capitalize bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--event-accent)" }}
            />
            <span>{eventType} Edition</span>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (56px) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-14 bg-[var(--surface)] border-t border-[var(--border)] px-2 flex justify-around items-center"
        aria-label="Mobile Navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 text-[11px] font-medium transition-colors ${
                isActive
                  ? "text-[var(--primary)] font-bold"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.75} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
