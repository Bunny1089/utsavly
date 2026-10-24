import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Plus,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  Phone,
  Sparkles,
  X,
  ShieldAlert
} from "lucide-react";
import type { Vendor, VendorStatus, VendorAiGuidance, Event } from "../types";
import { api } from "../services/api";

interface VendorsViewProps {
  event: Event;
  vendors: Vendor[];
  onRefresh: () => Promise<void>;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  event,
  vendors,
  onRefresh
}) => {
  const [activeGuidance, setActiveGuidance] = useState<VendorAiGuidance | null>(null);
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [selectedVendorForGuidance, setSelectedVendorForGuidance] = useState<Vendor | null>(null);

  // Add Vendor Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [category, setCategory] = useState("Catering & Banquet");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [quote, setQuote] = useState(150000);
  const [advancePaid, setAdvancePaid] = useState(30000);
  const [status, setStatus] = useState<VendorStatus>("researching");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Short confetti once when all vendors are booked
  useEffect(() => {
    if (vendors.length > 0 && vendors.every((v) => v.status === "booked")) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [vendors]);

  const handleOpenGuidance = async (vendor: Vendor) => {
    setSelectedVendorForGuidance(vendor);
    setGuidanceLoading(true);
    try {
      const guidance = await api.getVendorAiGuidance(vendor.id);
      setActiveGuidance(guidance);
    } catch (err) {
      console.error("Failed to fetch guidance:", err);
    } finally {
      setGuidanceLoading(false);
    }
  };

  const handleUpdateStatus = async (vendorId: number, newStatus: VendorStatus) => {
    try {
      await api.updateVendor(vendorId, { status: newStatus });
      await onRefresh();
    } catch (err) {
      console.error("Failed to update vendor:", err);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    setIsSubmitting(true);
    try {
      await api.createVendor(event.id, {
        category,
        name,
        contact,
        quote: Number(quote),
        advance_paid: Number(advancePaid),
        status,
        notes
      });
      await onRefresh();
      setIsAddModalOpen(false);
      setName("");
      setContact("");
      setNotes("");
    } catch (err) {
      console.error("Failed to create vendor:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (s: VendorStatus) => {
    switch (s) {
      case "booked":
        return "badge-success";
      case "negotiating":
        return "badge-warning";
      case "contacted":
        return "badge-primary";
      case "researching":
        return "bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)]";
      case "rejected":
        return "badge-danger";
    }
  };

  const bookedCount = vendors.filter((v) => v.status === "booked").length;
  const totalQuotes = vendors.reduce((acc, v) => acc + v.quote, 0);
  const totalAdvances = vendors.reduce((acc, v) => acc + v.advance_paid, 0);

  return (
    <div className="space-y-8 page-transition">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Vendor Directory
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[65ch]">
            Quotes, advance disbursements, balance tracking, and AI contract clause screening.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch">
        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Vendor Coverage
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              {bookedCount} / {vendors.length} Booked
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {vendors.length - bookedCount} pending agreements
            </span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Total Contract Value
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tabular-nums block">
              ₹{totalQuotes.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)]">Across all registered partners</span>
          </div>
        </div>

        <div className="ui-card flex flex-col justify-between">
          <span className="text-xs font-semibold text-[var(--text-muted)] block mb-1">
            Outstanding Balance
          </span>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent)] tabular-nums block">
              ₹{(totalQuotes - totalAdvances).toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              ₹{totalAdvances.toLocaleString("en-IN")} advance disbursed
            </span>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {vendors.map((vendor) => {
          const balance = vendor.quote - vendor.advance_paid;

          return (
            <div
              key={vendor.id}
              className="ui-card p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[var(--text-muted)]">
                    {vendor.category}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                      vendor.status
                    )}`}
                  >
                    {vendor.status}
                  </span>
                </div>

                <h3 className="font-heading text-lg font-bold text-[var(--text)] mb-1">
                  {vendor.name}
                </h3>

                {vendor.contact && (
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mb-3">
                    <Phone className="w-3.5 h-3.5 text-[var(--text-muted)]" strokeWidth={1.75} />
                    <span>{vendor.contact}</span>
                  </p>
                )}

                {/* Ledger Financials Breakdown */}
                <div className="p-3.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Quote:</span>
                    <span className="font-bold text-[var(--text)] tabular-nums">
                      ₹{vendor.quote.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Advance Paid:</span>
                    <span className="font-bold text-[var(--text)] tabular-nums">
                      ₹{vendor.advance_paid.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-[var(--border)]">
                    <span className="font-semibold text-[var(--text)]">Due Balance:</span>
                    <span className="font-extrabold text-[var(--accent)] tabular-nums">
                      ₹{balance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {vendor.notes && (
                  <p className="text-xs text-[var(--text-muted)] mt-3 italic line-clamp-2">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Card Actions Footer */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <select
                  aria-label={`Update status for ${vendor.name}`}
                  value={vendor.status}
                  onChange={(e) =>
                    handleUpdateStatus(vendor.id, e.target.value as VendorStatus)
                  }
                  className="h-9 px-2 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-xs font-semibold text-[var(--text)] cursor-pointer"
                >
                  <option value="researching">Researching</option>
                  <option value="contacted">Contacted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="booked">Booked</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={() => handleOpenGuidance(vendor)}
                  className="btn-secondary h-9 text-xs px-2.5 inline-flex items-center gap-1.5"
                  aria-label={`AI Audit for ${vendor.name}`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[var(--primary)]" strokeWidth={1.75} />
                  <span>AI Audit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Contract Guidance Modal */}
      {selectedVendorForGuidance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="ui-card w-full max-w-xl p-6 bg-[var(--surface)] border border-[var(--border)] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <ShieldAlert className="w-4 h-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[var(--text)]">
                    AI Contract Audit: {selectedVendorForGuidance.name}
                  </h3>
                  <span className="text-xs text-[var(--text-muted)]">
                    {selectedVendorForGuidance.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedVendorForGuidance(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            {guidanceLoading ? (
              <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-2">
                <Sparkles className="w-6 h-6 animate-spin mx-auto text-[var(--primary)]" strokeWidth={1.75} />
                <span>Auditing standard contract terms & pricing guidelines...</span>
              </div>
            ) : activeGuidance ? (
              <div className="space-y-4 text-xs">
                {/* Red Flags Section */}
                <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/25 space-y-2">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    <span>Red Flags to Watch For:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200">
                    {activeGuidance.red_flags.map((flag, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Questions to Ask */}
                <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text)] font-bold">
                    <HelpCircle className="w-4 h-4 text-[var(--primary)] shrink-0" strokeWidth={1.75} />
                    <span>Questions to Ask Before Signing:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-[var(--text-muted)]">
                    {activeGuidance.questions_to_ask.map((q, idx) => (
                      <li key={idx} className="leading-relaxed text-[var(--text)]">
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Payment Terms */}
                <div className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2 text-[var(--text)] font-bold">
                    <CheckCircle className="w-4 h-4 text-[var(--success)] shrink-0" strokeWidth={1.75} />
                    <span>Recommended Advance Schedule:</span>
                  </div>
                  <div className="space-y-1 text-[var(--text-muted)]">
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text)] font-medium">Booking Token Advance</span>
                      <span className="font-bold tabular-nums text-[var(--text)]">20%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[var(--border)]">
                      <span className="text-[var(--text)] font-medium">Mid-planning Setup</span>
                      <span className="font-bold tabular-nums text-[var(--text)]">50%</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[var(--text)] font-medium">Post-delivery Clearance</span>
                      <span className="font-bold tabular-nums text-[var(--text)]">30%</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-[var(--border)] flex justify-end">
              <button
                onClick={() => setSelectedVendorForGuidance(null)}
                className="btn-secondary text-xs h-10 px-4"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="ui-card w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--text)]">
                Register New Vendor
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="ui-input"
                >
                  <option value="Catering & Banquet">Catering & Banquet</option>
                  <option value="Photography & Films">Photography & Films</option>
                  <option value="Decor & Florals">Decor & Florals</option>
                  <option value="Sound, Lights & DJ">Sound, Lights & DJ</option>
                  <option value="Makeup & Mehendi">Makeup & Mehendi</option>
                  <option value="Pundit / Officiant">Pundit / Officiant</option>
                  <option value="Security & Logistics">Security & Logistics</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Marwar Caterers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Contact / Phone
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                    Total Quote (INR)
                  </label>
                  <input
                    type="number"
                    required
                    value={quote}
                    onChange={(e) => setQuote(Number(e.target.value))}
                    className="ui-input tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                    Advance Paid
                  </label>
                  <input
                    type="number"
                    required
                    value={advancePaid}
                    onChange={(e) => setAdvancePaid(Number(e.target.value))}
                    className="ui-input tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Booking Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as VendorStatus)}
                  className="ui-input"
                >
                  <option value="researching">Researching</option>
                  <option value="contacted">Contacted</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="booked">Booked</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? "Registering..." : "Save Vendor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
