import React, { useState, useEffect } from "react";
import { SlidersHorizontal, RotateCcw, Check, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import type { BudgetOverview, Event } from "../types";
import { api } from "../services/api";

interface WhatIfSimulatorProps {
  event: Event;
  budget: BudgetOverview | null;
  onRefresh: () => Promise<void>;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  event,
  budget,
  onRefresh
}) => {
  const [simulatedAmounts, setSimulatedAmounts] = useState<Record<number, number>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Initialize simulated amounts from baseline budget
  useEffect(() => {
    if (budget) {
      const initial: Record<number, number> = {};
      budget.items.forEach((item) => {
        initial[item.id] = item.planned;
      });
      setSimulatedAmounts(initial);
    }
  }, [budget]);

  if (!budget) return null;

  const handleSliderChange = (itemId: number, newVal: number) => {
    setSimulatedAmounts((prev) => ({
      ...prev,
      [itemId]: newVal
    }));
    setAppliedSuccess(false);
  };

  const handleReset = () => {
    const initial: Record<number, number> = {};
    budget.items.forEach((item) => {
      initial[item.id] = item.planned;
    });
    setSimulatedAmounts(initial);
    setAppliedSuccess(false);
  };

  const simulatedTotal = Object.values(simulatedAmounts).reduce((a, b) => a + b, 0);
  const variance = simulatedTotal - event.total_budget;
  const isOver = variance > 0;
  const isUnder = variance < 0;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const promises = Object.entries(simulatedAmounts).map(([idStr, val]) =>
        api.updateBudgetItem(Number(idStr), { planned: val })
      );
      await Promise.all(promises);
      await onRefresh();
      setAppliedSuccess(true);
    } catch (err) {
      console.error("Failed to apply simulation to budget:", err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="ui-card space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[var(--surface-2)] text-[var(--primary)] text-xs font-semibold mb-2 border border-[var(--border)]">
            <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Deterministic Simulator (Zero AI Calls)</span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">
            What-If Allocation Simulator
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-[65ch]">
            Tweak category allocations locally to model trade-offs before committing changes to your official ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="btn-secondary text-xs h-10 px-3"
            aria-label="Reset Sliders to Baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Reset Baseline</span>
          </button>

          <button
            onClick={handleApply}
            disabled={isApplying || isOver}
            className="btn-primary text-xs h-10 px-4"
            aria-label="Apply Simulated Budget to Plan"
          >
            {isApplying ? (
              <span>Applying...</span>
            ) : appliedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--success)]" strokeWidth={2} />
                <span>Plan Updated!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
                <span>Apply to Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Simulation Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
            Target Event Budget
          </span>
          <span className="text-xl font-extrabold text-[var(--text)] tabular-nums block">
            ₹{event.total_budget.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
            Simulated Total
          </span>
          <span className={`text-xl font-extrabold tabular-nums block ${isOver ? "text-[var(--danger)]" : "text-[var(--text)]"}`}>
            ₹{simulatedTotal.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
            Variance to Ceiling
          </span>
          <div className="flex items-center gap-1.5 text-xl font-extrabold tabular-nums">
            {isOver ? (
              <>
                <TrendingUp className="w-5 h-5 text-[var(--danger)] shrink-0" strokeWidth={1.75} />
                <span className="text-[var(--danger)]">
                  +₹{variance.toLocaleString("en-IN")} over
                </span>
              </>
            ) : isUnder ? (
              <>
                <TrendingDown className="w-5 h-5 text-[var(--success)] shrink-0" strokeWidth={1.75} />
                <span className="text-[var(--success)]">
                  ₹{Math.abs(variance).toLocaleString("en-IN")} unallocated
                </span>
              </>
            ) : (
              <span className="text-[var(--success)]">₹0 (Perfect Match)</span>
            )}
          </div>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budget.items.map((item) => {
          const currentVal = simulatedAmounts[item.id] ?? item.planned;
          const maxVal = Math.round(event.total_budget * 0.7);

          return (
            <div
              key={item.id}
              className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--text)] block">
                    {item.category}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums">
                    Baseline: ₹{item.planned.toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="font-heading text-sm font-extrabold text-[var(--text)] tabular-nums">
                  ₹{currentVal.toLocaleString("en-IN")}
                </span>
              </div>

              <input
                type="range"
                aria-label={`Simulate ${item.category} budget`}
                min={0}
                max={maxVal}
                step={5000}
                value={currentVal}
                onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--border)] rounded-lg appearance-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
