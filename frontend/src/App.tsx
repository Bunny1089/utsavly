import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Header } from "./components/Header";
import { WizardModal } from "./components/WizardModal";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { EmptyState } from "./components/EmptyState";
import { DashboardView } from "./components/DashboardView";
import { BudgetView } from "./components/BudgetView";
import { TimelineView } from "./components/TimelineView";
import { VendorsView } from "./components/VendorsView";
import { IdeasView } from "./components/IdeasView";
import { CopilotSlideOver } from "./components/CopilotSlideOver";
import { LandingPage } from "./components/LandingPage";
import type { Event, EventType, BudgetOverview, Task, Vendor, Idea, HealthScore } from "./types";
import { api } from "./services/api";
import { Sparkles } from "lucide-react";

export function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pillar data states
  const [budgetOverview, setBudgetOverview] = useState<BudgetOverview | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [health, setHealth] = useState<HealthScore | null>(null);

  // Dark mode as default (Section 5.1: Dark theme default)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("utsavly_theme");
    return saved !== null ? saved === "dark" : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("utsavly_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("utsavly_theme", "light");
    }
  }, [isDark]);

  const [isWakingServer, setIsWakingServer] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Show "Waking up the server..." state if first request takes longer than 3 seconds
  useEffect(() => {
    let timer: any = null;
    if (loading) {
      timer = setTimeout(() => {
        setIsWakingServer(true);
      }, 3000);
    } else {
      setIsWakingServer(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading]);

  // Load events on mount with automatic retry while server boots
  const loadEvents = async (retries = 3) => {
    try {
      setLoadError(null);
      const data = await api.getEvents();
      setEvents(data);
      if (data.length > 0 && !activeEvent) {
        setActiveEvent(data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.warn("Error loading events (server may be waking up):", err);
      if (retries > 0) {
        setTimeout(() => loadEvents(retries - 1), 3000);
      } else {
        setLoadError("Unable to reach the server. It may still be booting.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);


  // Fetch all 4 pillars data when active event changes
  const loadActiveEventData = async () => {
    if (!activeEvent) return;
    try {
      const [bData, tData, vData, iData, hData] = await Promise.all([
        api.getBudget(activeEvent.id),
        api.getTasks(activeEvent.id),
        api.getVendors(activeEvent.id),
        api.getIdeas(activeEvent.id),
        api.getHealth(activeEvent.id)
      ]);
      setBudgetOverview(bData);
      setTasks(tData);
      setVendors(vData);
      setIdeas(iData);
      setHealth(hData);
    } catch (e) {
      console.warn("Could not load full event details:", e);
    }
  };

  useEffect(() => {
    loadActiveEventData();
  }, [activeEvent]);

  const handleCreateEvent = async (eventData: Omit<Event, "id">) => {
    try {
      const created = await api.createEvent(eventData);
      setEvents((prev) => [created, ...prev]);
      setActiveEvent(created);
      setCurrentTab("dashboard");
    } catch (e) {
      console.error("Failed to create event:", e);
    }
  };

  const getThemeClass = (type?: EventType) => {
    switch (type) {
      case "wedding":
        return "theme-wedding";
      case "birthday":
        return "theme-birthday";
      case "community":
        return "theme-community";
      default:
        return "theme-wedding";
    }
  };

  return (
    <div className={`flex min-h-screen bg-[var(--bg)] text-[var(--text)] ${getThemeClass(activeEvent?.type)}`}>
      {/* Responsive Sidebar Navigation (264px desktop, 56px mobile) */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === "copilot") {
            setIsCopilotOpen(true);
          } else {
            setCurrentTab(tab);
          }
        }}
        eventType={activeEvent?.type || "wedding"}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenLanding={() => setCurrentTab("landing")}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-8">
        <Header
          events={events}
          activeEvent={activeEvent}
          onSelectEvent={(ev) => {
            setActiveEvent(ev);
            if (currentTab === "landing") setCurrentTab("dashboard");
          }}
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onOpenWizard={() => setIsWizardOpen(true)}
        />

        {/* Accessible Screen Reader Status Announcer */}
        <div aria-live="polite" className="sr-only">
          {activeEvent ? `Active event: ${activeEvent.title}. Showing ${currentTab} view.` : "Loading event details."}
        </div>

        {/* Main Content Area: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentTab === "landing" ? (
            <LandingPage
              events={events}
              onOpenWizard={() => setIsWizardOpen(true)}
              onSelectEvent={(ev) => {
                setActiveEvent(ev);
                setCurrentTab("dashboard");
              }}
              onEnterStudio={() => setCurrentTab("dashboard")}
            />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
              <SkeletonLoader
                label={isWakingServer ? "Waking up the server... (Free tier instance spinning up)" : "Loading Utsavly Event Studio..."}
              />
              {isWakingServer && (
                <div
                  role="status"
                  aria-live="polite"
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--border)] shadow-lg animate-pulse"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-ping" />
                  <span>Waking up the server... Free hosting instances can take a few moments to spin up.</span>
                </div>
              )}
            </div>
          ) : !activeEvent ? (
            <div className="space-y-4">
              {loadError && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm flex items-center justify-between">
                  <span>{loadError}</span>
                  <button
                    onClick={() => {
                      setLoading(true);
                      loadEvents();
                    }}
                    className="px-3 py-1 bg-amber-500 text-black font-semibold rounded-lg text-xs hover:bg-amber-400 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              )}
              <EmptyState
                icon={Sparkles}
                title="No Events Found"
                description="Welcome to Utsavly! Let's get started by creating your first celebration plan with our GenAI setup wizard."
                actionLabel="Launch Setup Wizard"
                onAction={() => setIsWizardOpen(true)}
              />
            </div>
          ) : (

            <div>
              {currentTab === "dashboard" && (
                <DashboardView
                  event={activeEvent}
                  budget={budgetOverview}
                  tasks={tasks}
                  vendors={vendors}
                  ideas={ideas}
                  health={health}
                  onNavigateTab={setCurrentTab}
                  onOpenCopilot={() => setIsCopilotOpen(true)}
                />
              )}

              {currentTab === "budget" && (
                <BudgetView
                  event={activeEvent}
                  budget={budgetOverview}
                  onRefresh={loadActiveEventData}
                />
              )}

              {currentTab === "timeline" && (
                <TimelineView
                  event={activeEvent}
                  tasks={tasks}
                  onRefresh={loadActiveEventData}
                />
              )}

              {currentTab === "vendors" && (
                <VendorsView
                  event={activeEvent}
                  vendors={vendors}
                  onRefresh={loadActiveEventData}
                />
              )}

              {currentTab === "ideas" && (
                <IdeasView
                  event={activeEvent}
                  ideas={ideas}
                  onRefresh={loadActiveEventData}
                />
              )}

              {currentTab === "copilot" && (
                <div className="ui-card text-center max-w-xl mx-auto my-12 space-y-4">
                  <div className="w-12 h-12 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Planner Copilot
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Copilot is ready to assist. It can adjust your budget, reschedule milestone tasks, and register vetted vendors.
                  </p>
                  <button
                    onClick={() => setIsCopilotOpen(true)}
                    className="btn-primary"
                  >
                    Open Copilot Slide-Over
                  </button>
                </div>
              )}

              {currentTab === "runsheet" && (
                <div className="ui-card text-center max-w-xl mx-auto my-12 space-y-4">
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Day-of Run Sheet
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Print-friendly hour-by-hour day-of coordination sheet linked to your milestone tasks.
                  </p>
                  <button
                    onClick={() => setCurrentTab("timeline")}
                    className="btn-secondary"
                  >
                    View Milestone Timeline
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Setup Wizard Modal */}
      <WizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSubmit={handleCreateEvent}
      />

      {/* Planner Copilot Slide-Over */}
      {activeEvent && (
        <CopilotSlideOver
          isOpen={isCopilotOpen}
          onClose={() => setIsCopilotOpen(false)}
          event={activeEvent}
          onRefresh={loadActiveEventData}
        />
      )}
    </div>
  );
}

export default App;
