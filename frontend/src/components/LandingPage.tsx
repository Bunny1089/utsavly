import React from "react";
import {
  Sparkles,
  ArrowRight,
  PieChart,
  CalendarDays,
  CheckSquare,
  Lightbulb,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import type { Event } from "../types";

interface LandingPageProps {
  events: Event[];
  onOpenWizard: () => void;
  onSelectEvent: (event: Event) => void;
  onEnterStudio: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  events,
  onOpenWizard,
  onSelectEvent,
  onEnterStudio
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] page-transition">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--border)]">
        {/* Max one soft glow behind hero */}
        <div
          className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full opacity-35 blur-[120px]"
          style={{ background: "var(--glow)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left-aligned hero */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text-muted)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />
                <span>Engineered for Indian Celebrations & Muhurat Timelines</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text)] leading-[1.15]">
                Plan Indian events with precision, not chaos.
              </h1>

              <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-[65ch] leading-relaxed">
                Utsavly generates backward-scheduled milestone timelines, strict INR budget ledgers with 9% contingency buffers, and AI-audited vendor checklists for weddings, birthdays, and community festivals.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onOpenWizard}
                  className="btn-primary group"
                  aria-label="Launch Setup Wizard"
                >
                  <span>Create New Celebration</span>
                  <ArrowRight className="w-4 h-4 btn-icon-slide" strokeWidth={1.75} />
                </button>

                <button
                  onClick={onEnterStudio}
                  className="btn-secondary"
                  aria-label="Open Studio Dashboard"
                >
                  <span>Open Event Studio</span>
                </button>
              </div>

              {/* Sample Events Fast Switcher */}
              {events.length > 0 && (
                <div className="pt-4">
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
                    Or jump into a pre-configured demo celebration:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {events.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => onSelectEvent(ev)}
                        className="px-3 py-1.5 rounded-[10px] text-xs font-medium bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--surface-2)] transition-all flex items-center gap-1.5 text-[var(--text)]"
                      >
                        <span className="capitalize">{ev.type}</span>
                        <span className="text-[var(--text-muted)]">• {ev.title}</span>
                        <ChevronRight className="w-3 h-3 text-[var(--text-muted)]" strokeWidth={1.75} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right-aligned real product mock */}
            <div className="lg:col-span-5">
              <div className="ui-card p-6 border border-[var(--border)] shadow-xl bg-[var(--surface)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
                    <div className="w-3 h-3 rounded-full bg-[var(--warning)]" />
                    <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--text-muted)] font-mono">utsavly.studio/demo</span>
                </div>

                {/* Mini card snapshot */}
                <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text)]">Aarav & Meera's Royal Sangeet</span>
                    <span className="text-xs font-bold text-[var(--success)] tabular-nums">92/100 Health</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>Budget: ₹25,00,000</span>
                    <span className="tabular-nums font-semibold text-[var(--text)]">9% Contingency</span>
                  </div>
                  <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[var(--primary)] w-[68%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Milestones</span>
                    <span className="font-bold text-[var(--text)] tabular-nums">7 / 10 Done</span>
                  </div>
                  <div className="p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)]">
                    <span className="text-[11px] text-[var(--text-muted)] block">Vendors Booked</span>
                    <span className="font-bold text-[var(--text)] tabular-nums">3 / 4 Finalized</span>
                  </div>
                </div>

                <div className="p-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[var(--success)]" strokeWidth={1.75} />
                    <span className="font-medium text-[var(--text)]">Contract Red Flags Screened</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)]">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: The 4 Core Pillars */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
              Four Core Pillars. Built for Indian scale.
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-[65ch]">
              Everything in Utsavly serves one of four operational pillars to remove uncertainty before day-one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {/* Pillar 1: Budgets */}
            <div className="ui-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                  <PieChart className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  1. AI Budget Split
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Enforces strict budget ceiling with 8–10% reserved contingency cushion and live overspend warnings.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] text-xs font-semibold text-[var(--primary)] tabular-nums">
                ₹ INR Default • Planned vs Actual
              </div>
            </div>

            {/* Pillar 2: Timelines */}
            <div className="ui-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                  <CalendarDays className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  2. Milestone Timelines
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Backward-planned from the event date. Shifting the date automatically reschedules all milestone tasks.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] text-xs font-semibold text-[var(--primary)]">
                List & Kanban • Auto-reschedule
              </div>
            </div>

            {/* Pillar 3: Vendors */}
            <div className="ui-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                  <CheckSquare className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  3. Vendor Checklist
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Track quotes, advances, and balances. AI contract audit surfaces hidden clauses and negotiation questions.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] text-xs font-semibold text-[var(--primary)]">
                Contract Audit • Advance Tracking
              </div>
            </div>

            {/* Pillar 4: Ideas */}
            <div className="ui-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] mb-4">
                  <Lightbulb className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                  4. Personalized Ideas
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Curated decor, food, and entertainment inspiration tailored to your city and culture with one-click sync.
                </p>
              </div>
              <div className="pt-3 border-t border-[var(--border)] text-xs font-semibold text-[var(--primary)]">
                Effort Ratings • Add to Plan Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Row */}
      <section className="py-20 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-3">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-[65ch]">
              From blank page to complete event blueprint in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <div className="p-6 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--primary)] font-mono">
                Step 01
              </span>
              <h3 className="text-base font-bold text-[var(--text)]">Specify your event context</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Enter your celebration type, city, expected guests, target INR budget, and regional cultural vibe.
              </p>
            </div>

            <div className="p-6 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--primary)] font-mono">
                Step 02
              </span>
              <h3 className="text-base font-bold text-[var(--text)]">AI drafts the 4 pillars</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Utsavly generates a fully budgeted ledger, backward-calculated task schedule, and tailored vendor requirements.
              </p>
            </div>

            <div className="p-6 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] space-y-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[var(--surface-2)] text-[var(--primary)] font-mono">
                Step 03
              </span>
              <h3 className="text-base font-bold text-[var(--text)]">Simulate & coordinate</h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Use What-If sliders to adjust guest counts, monitor Health Scores, and invoke the Planner Copilot.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--surface)] text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-[var(--text)]">Utsavly</span>
            <span>• GenAI Event Planning Assistant for India</span>
          </div>
          <div>
            <span>INR Default • WCAG 2.1 AA Compliant • Built for Production</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
