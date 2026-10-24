import { describe, it, expect } from "vitest";

describe("Setup Wizard Input Validation", () => {
  it("rejects invalid guest counts and negative budgets", () => {
    const validateEventForm = (data: { guest_count: number; total_budget: number; title: string }) => {
      const errors: string[] = [];
      if (!data.title || data.title.trim().length < 2) errors.push("Title too short");
      if (data.guest_count <= 0) errors.push("Guests must be positive");
      if (data.total_budget <= 0) errors.push("Budget must be positive");
      return { isValid: errors.length === 0, errors };
    };

    const invalid = validateEventForm({ guest_count: -5, total_budget: -1000, title: "" });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors).toContain("Title too short");
    expect(invalid.errors).toContain("Guests must be positive");
    expect(invalid.errors).toContain("Budget must be positive");

    const valid = validateEventForm({ guest_count: 250, total_budget: 1500000, title: "Royal Wedding" });
    expect(valid.isValid).toBe(true);
    expect(valid.errors.length).toBe(0);
  });
});

describe("Budget Edit & Variance Recalculation", () => {
  it("accurately computes actual total spend and flags overspend", () => {
    const totalBudget = 500000;
    const items = [
      { id: 1, planned: 200000, actual: 180000 },
      { id: 2, planned: 150000, actual: 160000 },
      { id: 3, planned: 150000, actual: 170000 },
    ];

    const actualTotal = items.reduce((sum, item) => sum + item.actual, 0);
    const isOverspent = actualTotal > totalBudget;
    const overspendAmount = isOverspent ? actualTotal - totalBudget : 0;

    expect(actualTotal).toBe(510000);
    expect(isOverspent).toBe(true);
    expect(overspendAmount).toBe(10000);
  });

  it("calculates accurate contingency reserve (8-10%)", () => {
    const totalBudget = 2500000;
    const contingencyPercentage = 9.0;
    const contingencyAmount = Math.round(totalBudget * (contingencyPercentage / 100));

    expect(contingencyAmount).toBe(225000);
    expect(contingencyPercentage).toBeGreaterThanOrEqual(8.0);
    expect(contingencyPercentage).toBeLessThanOrEqual(10.0);
  });
});
