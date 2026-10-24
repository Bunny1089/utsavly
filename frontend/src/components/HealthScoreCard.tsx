import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Clock } from "lucide-react";
import type { HealthScore, HealthAlert } from "../types";

interface HealthScoreCardProps {
  health: HealthScore | null;
  daysLeft: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  health,
  daysLeft
}) => {
  if (!health) return null;

  const getAlertIcon = (type: HealthAlert["type"]) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-4 h-4 text-[var(--danger)] shrink-0" strokeWidth={1.75} />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0" strokeWidth={1.75} />;
      case "info":
        return <Info className="w-4 h-4 text-[var(--primary)] shrink-0" strokeWidth={1.75} />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" strokeWidth={1.75} />;
    }
  };

  const getAlertStyle = (type: HealthAlert["type"]) => {
    switch (type) {
      case "danger":
        return "alert-danger";
      case "warning":
        return "alert-warning";
      case "info":
        return "alert-info";
      case "success":
        return "alert-success";
    }
  };

  const scoreColor =
    health.score >= 85
      ? "text-[var(--success)]"
      : health.score >= 70
      ? "text-[var(--accent)]"
      : health.score >= 50
      ? "text-[var(--warning)]"
      : "text-[var(--danger)]";

  return (
    <div className="ui-card space-y-6">
      {/* Top Row: Score & Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[14px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
            <span className={`font-heading text-2xl font-extrabold tabular-nums ${scoreColor}`}>
              {health.score}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[var(--text)]">
                Event Health Score
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border border-[var(--border)] bg-[var(--surface-2)] ${scoreColor}`}>
                {health.rating}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[65ch]">
              Deterministic 0–100 index computed from budget variance, task milestones, & vendor statuses.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] self-start sm:self-auto tabular-nums">
          <Clock className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />
          <span>{daysLeft} days remaining</span>
        </div>
      </div>

      {/* Metrics Row (4 Columns) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)] block mb-0.5 font-medium">Budget Spent</span>
          <span className="font-bold text-[var(--text)] tabular-nums text-sm">
            {health.metrics.budget_spent_pct}%
          </span>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)] block mb-0.5 font-medium">Tasks Completed</span>
          <span className="font-bold text-[var(--text)] tabular-nums text-sm">
            {health.metrics.tasks_completed_pct}%
          </span>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)] block mb-0.5 font-medium">Overdue Tasks</span>
          <span className={`font-bold tabular-nums text-sm ${health.metrics.overdue_tasks_count > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
            {health.metrics.overdue_tasks_count}
          </span>
        </div>

        <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] text-[var(--text-muted)] block mb-0.5 font-medium">Vendors Booked</span>
          <span className="font-bold text-[var(--text)] tabular-nums text-sm">
            {health.metrics.booked_vendors_count} / {health.metrics.total_vendors_count}
          </span>
        </div>
      </div>

      {/* Smart Alerts List */}
      {health.alerts.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-[var(--border)]">
          <span className="text-xs font-bold text-[var(--text)] uppercase tracking-wider block mb-1">
            Active Smart Alerts:
          </span>
          {health.alerts.map((al, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-[10px] border flex items-start gap-2.5 text-xs font-medium ${getAlertStyle(
                al.type
              )}`}
            >
              {getAlertIcon(al.type)}
              <span className="leading-snug">{al.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
