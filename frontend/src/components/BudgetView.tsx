import React, { useState } from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import {
  AlertTriangle,
  Sparkles,
  Edit2,
  Check,
  X,
  RefreshCw,
  SlidersHorizontal
} from "lucide-react";
import type { BudgetOverview, BudgetItem, Event } from "../types";
import { api } from "../services/api";
import { WhatIfSimulator } from "./WhatIfSimulator";

interface BudgetViewProps {
  event: Event;
  budget: BudgetOverview | null;
  onRefresh: () => Promise<void>;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  event,
  budget,
  onRefresh
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editActual, setEditActual] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  if (!budget) return null;

  const chartColors = ["#7C3AED", "#FACC15", "#34D399", "#F87171", "#60A5FA", "#A78BFA", "#FBBF24"];

  const chartData = budget.items
    .filter((item) => item.planned > 0)
    .map((item) => ({
      name: item.category,
      value: item.planned
    }));

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditActual(item.actual);
    setEditNotes(item.notes || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (itemId: number) => {
    setSavingId(itemId);
    try {
      await api.updateBudgetItem(itemId, {
        actual: editActual,
        notes: editNotes
      });
      await onRefresh();
      setEditingId(null);
    } catch (err) {
      console.error("Failed to update budget item:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await api.generateBudget(event.id);
      await onRefresh();
    } catch (err) {
      console.error("Failed to regenerate budget:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const isOverspent = budget.actual_total > event.total_budget;
  const contingencyItem = budget.items.find((i) =>
    i.category.toLowerCase().includes("contingency")
  );

  return (
    <div className="space-y-8 page-transition">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Budget Ledger
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[65ch]">
            Planned vs. actual category splits strictly constrained to your ₹{event.total_budget.toLocaleString("en-IN")} total ceiling.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowSimulator((prev) => !prev)}
            className="btn-primary"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.75} />
            <span>{showSimulator ? "Close Simulator" : "What-If Simulator"}</span>
          </button>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="btn-secondary"
          >
            {isRegenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.75} />
            ) : (
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            )}
            <span>{isRegenerating ? "Recalculating..." : "Auto-Balance"}</span>
          </button>
        </div>
      </div>

      {/* Overspend Alert Banner */}
      {isOverspent && (
        <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
          <div>
            <span>Overspend Alert: </span>
            <span className="font-normal">
              Actual expenses have exceeded total budget by{" "}
              <strong className="tabular-nums font-semibold">₹{(budget.actual_total - event.total_budget).toLocaleString("en-IN")}</strong>. Adjust actuals or transfer funds from contingency.
            </span>
          </div>
        </div>
      )}

      {/* What-If Simulator Section */}
      {showSimulator && (
        <WhatIfSimulator
          event={event}
          budget={budget}
          onRefresh={onRefresh}
        />
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Total Budget
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              ₹{event.total_budget.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Fixed ceiling</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Planned Total
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              ₹{budget.planned_total.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)]">100% allocated</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Actual Spent
          </span>
          <div>
            <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums block ${isOverspent ? "text-[var(--danger)]" : "text-[var(--accent)]"}`}>
              ₹{budget.actual_total.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Recorded expenses</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Contingency Cushion
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              ₹{contingencyItem ? contingencyItem.planned.toLocaleString("en-IN") : "0"}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{budget.contingency_percentage}% reserved buffer</span>
          </div>
        </div>
      </div>

      {/* Main Budget Grid: Donut Chart & Category Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Recharts Donut Breakdown */}
        <div className="ui-card flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text)] mb-1">
              Category Allocation
            </h2>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Budget distribution across pillars
            </p>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
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
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                    iconType="circle"
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Category Table */}
        <div className="lg:col-span-2 ui-card overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text)]">
              Category Ledger
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-[6px] bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] tabular-nums">
              {budget.items.length} Categories
            </span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-right">Planned (INR)</th>
                <th className="py-3 px-3 font-semibold text-right">Actual Spent</th>
                <th className="py-3 px-3 font-semibold">Notes / Scope</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {budget.items.map((item) => {
                const isEditing = editingId === item.id;
                const isItemOver = item.actual > item.planned && item.actual > 0;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <td className="py-3.5 px-3 font-semibold text-[var(--text)]">
                      {item.category}
                      <span className="block text-[11px] font-normal text-[var(--text-muted)] tabular-nums">
                        {item.percentage}% of total
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-[var(--text)] tabular-nums text-right">
                      ₹{item.planned.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <input
                          type="number"
                          aria-label={`Actual spend for ${item.category}`}
                          value={editActual}
                          onChange={(e) => setEditActual(Number(e.target.value))}
                          className="w-28 px-2 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-xs font-bold text-[var(--text)] tabular-nums text-right"
                        />
                      ) : (
                        <span
                          className={`font-bold tabular-nums ${
                            isItemOver ? "text-[var(--danger)]" : "text-[var(--text)]"
                          }`}
                        >
                          ₹{item.actual.toLocaleString("en-IN")}
                          {isItemOver && (
                            <span className="block text-[10px] text-[var(--danger)] font-medium">
                              +₹{(item.actual - item.planned).toLocaleString("en-IN")} over
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-[var(--text-muted)] max-w-xs">
                      {isEditing ? (
                        <input
                          type="text"
                          aria-label={`Notes for ${item.category}`}
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Vendor details or live counter notes"
                          className="w-full px-2 py-1 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-xs text-[var(--text)]"
                        />
                      ) : (
                        <span className="line-clamp-2">{item.notes || "—"}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={savingId === item.id}
                            className="p-1.5 rounded-[8px] bg-[var(--success)] text-white hover:opacity-90"
                            title="Save changes"
                            aria-label="Save changes"
                          >
                            <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 rounded-[8px] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
                            title="Cancel"
                            aria-label="Cancel"
                          >
                            <X className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 rounded-[8px] hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]"
                          title="Edit actual spend or notes"
                          aria-label={`Edit ${item.category}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
