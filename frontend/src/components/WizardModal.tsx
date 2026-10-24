import React, { useState } from "react";
import { X, Sparkles } from "lucide-react";
import type { Event, EventType } from "../types";

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<Event, "id">) => Promise<void>;
}

export const WizardModal: React.FC<WizardModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [eventType, setEventType] = useState<EventType>("wedding");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-11-28");
  const [city, setCity] = useState("Jaipur");
  const [guestCount, setGuestCount] = useState(250);
  const [totalBudget, setTotalBudget] = useState(1500000);
  const [theme, setTheme] = useState("Royal Heritage Elegance");
  const [culture, setCulture] = useState("North Indian Hindu");
  const [priorities, setPriorities] = useState<string[]>(["Gourmet Catering", "Photography"]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !city) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        type: eventType,
        title,
        date,
        city,
        guest_count: Number(guestCount),
        total_budget: Number(totalBudget),
        theme,
        culture,
        priorities
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    "Gourmet Catering",
    "Photography & Cinematography",
    "Floral & Stage Decor",
    "Live Music & Entertainment",
    "Traditional Rituals",
    "Designer Attire & Styling"
  ];

  const togglePriority = (p: string) => {
    setPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl ui-card p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border)] shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-[var(--text)]">
                Create New Celebration
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                AI will draft your budget ledger, milestone timeline, and ideas in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close setup wizard"
            className="p-1.5 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Event Type selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-2">
              Event Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["wedding", "birthday", "community"] as EventType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={`h-11 rounded-[12px] text-xs font-semibold capitalize border transition-all flex items-center justify-center gap-2 ${
                    eventType === type
                      ? "bg-[var(--surface-2)] border-[var(--primary)] text-[var(--text)] font-bold shadow-sm"
                      : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        type === "wedding"
                          ? "#EAB308"
                          : type === "birthday"
                          ? "#F97316"
                          : "#10B981"
                    }}
                  />
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Event Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-2">
              Event Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav & Meera's Royal Sangeet & Vivah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="ui-input"
            />
          </div>

          {/* Date and City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Event Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="ui-input tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                City / Destination
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="ui-input"
              >
                <option value="Jaipur">Jaipur (Rajasthan)</option>
                <option value="Udaipur">Udaipur (Rajasthan)</option>
                <option value="Mumbai">Mumbai (Maharashtra)</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru (Karnataka)</option>
                <option value="Goa">Goa (Beachside)</option>
                <option value="Ahmedabad">Ahmedabad (Gujarat)</option>
                <option value="Kolkata">Kolkata (West Bengal)</option>
                <option value="Chennai">Chennai (Tamil Nadu)</option>
              </select>
            </div>
          </div>

          {/* Guests and Total Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Invited Guests Count
              </label>
              <input
                type="number"
                min={10}
                max={5000}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="ui-input tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Total Budget (INR)
              </label>
              <input
                type="number"
                min={25000}
                step={25000}
                required
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="ui-input tabular-nums"
              />
            </div>
          </div>

          {/* Theme & Cultural Background */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Aesthetic & Theme
              </label>
              <input
                type="text"
                placeholder="e.g. Royal Heritage Elegance"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="ui-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Cultural / Community Tradition
              </label>
              <input
                type="text"
                placeholder="e.g. North Indian Hindu, Marwari, Gujarati"
                value={culture}
                onChange={(e) => setCulture(e.target.value)}
                className="ui-input"
              />
            </div>
          </div>

          {/* Priority Focus Areas */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text)] mb-2">
              Top Priorities (AI will adjust budget weight)
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((opt) => {
                const isSelected = priorities.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => togglePriority(opt)}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-[var(--surface-2)] border-[var(--primary)] text-[var(--text)] font-semibold"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--text)]"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
              <span>{isSubmitting ? "Generating AI Plan..." : "Generate Celebration Plan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
