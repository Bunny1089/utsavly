import React from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import {
  Sparkles,
  PieChart,
  CalendarDays,
  Users2,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookmarkCheck
} from "lucide-react";
import type { Event, BudgetOverview, Task, Vendor, Idea, HealthScore } from "../types";
import { HealthScoreCard } from "./HealthScoreCard";

interface DashboardViewProps {
  event: Event;
  budget: BudgetOverview | null;
  tasks: Task[];
  vendors: Vendor[];
  ideas: Idea[];
  health: HealthScore | null;
  onNavigateTab: (tab: string) => void;
  onOpenCopilot: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  event,
  budget,
  tasks,
  vendors,
  ideas,
  health,
  onNavigateTab,
  onOpenCopilot
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

  const daysLeft = getDaysLeft(event.date);
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const bookedVendors = vendors.filter((v) => v.status === "booked").length;
  const savedIdeas = ideas.filter((i) => i.saved).length;

  const chartColors = ["#7C3AED", "#FACC15", "#34D399", "#F87171", "#60A5FA"];

  const chartData = (budget?.items || [])
    .filter((item) => item.planned > 0)
    .slice(0, 5)
    .map((item) => ({
      name: item.category,
      value: item.planned
    }));

  return (
    <div className="space-y-8 page-transition">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-muted)] mb-2 border border-[var(--border)]">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--event-accent)" }}
            />
            <span>{event.culture || "Indian Tradition"} • {event.theme || "Celebration"}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            {event.title}
          </h1>

          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[65ch]">
            {event.city} • <span className="tabular-nums font-semibold">{event.guest_count}</span> guests • Total budget: <span className="tabular-nums font-semibold text-[var(--text)]">₹{event.total_budget.toLocaleString("en-IN")}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCopilot}
            className="btn-primary"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            <span>Copilot Assistant</span>
          </button>
        </div>
      </div>

      {/* Top 4 Quick Metric Cards (Equal Height, 24px padding, 16px radius) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Countdown
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)] tabular-nums block">
              {daysLeft}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Days remaining</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Contingency Cushion
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              ₹{(event.total_budget * 0.09).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)]">9% emergency reserve</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Milestone Tasks
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              {completedTasks} / {tasks.length}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Tasks completed</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Health Rating
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--success)] tabular-nums block">
              {health?.score || 100} / 100
            </span>
            <span className="text-xs text-[var(--text-muted)] capitalize">{health?.rating || "Optimal"} condition</span>
          </div>
        </div>
      </div>

      {/* Health Score & Smart Alerts Card */}
      <HealthScoreCard health={health} daysLeft={daysLeft} />

      {/* Main 4 Pillars Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Budget Pillar Preview */}
        <div className="ui-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <PieChart className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">
                    Budget Allocation
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">Planned category splits</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("budget")}
                className="text-xs font-semibold text-[var(--primary-text)] hover:underline inline-flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-4">
              Total planned: <strong className="text-[var(--text)] tabular-nums font-semibold">₹{budget?.planned_total.toLocaleString("en-IN")}</strong>. Actual spend: <strong className="text-[var(--accent)] tabular-nums font-semibold">₹{budget?.actual_total.toLocaleString("en-IN")}</strong>.
            </p>

            <div className="h-44 sm:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString("en-IN")}`,
                      "Planned"
                    ]}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Contingency safety cushion:</span>
            <span className="font-bold text-[var(--text)] tabular-nums">₹{(event.total_budget * 0.09).toLocaleString("en-IN")} (9%)</span>
          </div>
        </div>

        {/* Timeline Pillar Preview */}
        <div className="ui-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <CalendarDays className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--text)]">
                    Upcoming Milestones
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">Backward-scheduled task sequence</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("timeline")}
                className="text-xs font-semibold text-[var(--primary-text)] hover:underline inline-flex items-center gap-1"
              >
                <span>Kanban Board</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-4">
              Scheduled tasks backward-calculated from event date <strong className="text-[var(--text)] tabular-nums">{event.date}</strong>.
            </p>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    {t.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" strokeWidth={1.75} />
                    ) : (
                      <Clock className="w-4 h-4 text-[var(--warning)] shrink-0" strokeWidth={1.75} />
                    )}
                    <span className={`truncate font-medium ${t.status === "completed" ? "line-through text-[var(--text-muted)]" : "text-[var(--text)]"}`}>
                      {t.title}
                    </span>
                  </div>

                  <span className="tabular-nums font-mono text-[11px] text-[var(--text-muted)] shrink-0 ml-2">
                    {t.due_date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Overall task progress:</span>
            <span className="font-bold text-[var(--text)] tabular-nums">{completedTasks} of {tasks.length} completed</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Vendor Status & Ideas Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div
          onClick={() => onNavigateTab("vendors")}
          className="ui-card cursor-pointer flex items-center justify-between p-6"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
              <Users2 className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Vendor Checklist</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                <span className="tabular-nums font-semibold text-[var(--text)]">{bookedVendors}</span> of <span className="tabular-nums font-semibold">{vendors.length}</span> booked • AI audit questions available
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--text-muted)]" strokeWidth={1.75} />
        </div>

        <div
          onClick={() => onNavigateTab("ideas")}
          className="ui-card cursor-pointer flex items-center justify-between p-6"
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
              <BookmarkCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text)]">Personalized Ideas</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                <span className="tabular-nums font-semibold text-[var(--text)]">{savedIdeas}</span> saved to plan • Tailored to {event.city} & {event.culture || "Tradition"}
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--text-muted)]" strokeWidth={1.75} />
        </div>
      </div>
    </div>
  );
};
