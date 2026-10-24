import type {
  Event,
  BudgetOverview,
  BudgetItem,
  Task,
  Vendor,
  VendorAiGuidance,
  Idea,
  HealthScore,
  CopilotResponse
} from "../types";

const rawBase = (import.meta.env.VITE_API_URL as string | undefined) || "http://localhost:8000";
export const API_BASE = rawBase.replace(/\/+$/, "").endsWith("/api")
  ? rawBase.replace(/\/+$/, "")
  : `${rawBase.replace(/\/+$/, "")}/api`;


export const api = {
  // Events
  async getEvents(): Promise<Event[]> {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  },

  async getEvent(id: number): Promise<Event> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error("Failed to fetch event");
    return res.json();
  },

  async createEvent(event: Omit<Event, "id">): Promise<Event> {
    const res = await fetch(`${API_BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    if (!res.ok) throw new Error("Failed to create event");
    return res.json();
  },

  // Budget
  async getBudget(eventId: number): Promise<BudgetOverview> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget`);
    if (!res.ok) throw new Error("Failed to fetch budget");
    return res.json();
  },

  async generateBudget(eventId: number): Promise<BudgetOverview> {
    const res = await fetch(`${API_BASE}/events/${eventId}/budget/generate`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to generate budget");
    return res.json();
  },

  async updateBudgetItem(itemId: number, patch: Partial<BudgetItem>): Promise<BudgetItem> {
    const res = await fetch(`${API_BASE}/budget/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error("Failed to update budget item");
    return res.json();
  },

  // Timeline / Tasks
  async getTasks(eventId: number): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");
    return res.json();
  },

  async generateTimeline(eventId: number): Promise<{ event_id: number; tasks: Task[] }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/timeline/generate`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to generate timeline");
    return res.json();
  },

  async updateTask(taskId: number, patch: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error("Failed to update task");
    return res.json();
  },

  async rescheduleTimeline(eventId: number, newDate: string): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/timeline/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_date: newDate })
    });
    if (!res.ok) throw new Error("Failed to reschedule timeline");
    return res.json();
  },

  // Vendors
  async getVendors(eventId: number): Promise<Vendor[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`);
    if (!res.ok) throw new Error("Failed to fetch vendors");
    return res.json();
  },

  async createVendor(eventId: number, vendor: Omit<Vendor, "id" | "event_id">): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/events/${eventId}/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vendor)
    });
    if (!res.ok) throw new Error("Failed to create vendor");
    return res.json();
  },

  async updateVendor(vendorId: number, patch: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error("Failed to update vendor");
    return res.json();
  },

  async getVendorAiGuidance(vendorId: number): Promise<VendorAiGuidance> {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}/ai-questions`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to fetch vendor AI guidance");
    return res.json();
  },

  // Ideas
  async getIdeas(eventId: number): Promise<Idea[]> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas`);
    if (!res.ok) throw new Error("Failed to fetch ideas");
    return res.json();
  },

  async generateIdeas(eventId: number): Promise<{ event_id: number; ideas: Idea[] }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/ideas/generate`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to generate ideas");
    return res.json();
  },

  async toggleIdeaSaved(ideaId: number, saved: boolean): Promise<Idea> {
    const res = await fetch(`${API_BASE}/ideas/${ideaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ saved })
    });
    if (!res.ok) throw new Error("Failed to update idea");
    return res.json();
  },

  // Health
  async getHealth(eventId: number): Promise<HealthScore> {
    const res = await fetch(`${API_BASE}/events/${eventId}/health`);
    if (!res.ok) throw new Error("Failed to fetch event health");
    return res.json();
  },

  // Copilot
  async sendCopilotMessage(eventId: number, message: string): Promise<CopilotResponse> {
    const res = await fetch(`${API_BASE}/events/${eventId}/copilot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error("Failed to send copilot message");
    return res.json();
  }
};
