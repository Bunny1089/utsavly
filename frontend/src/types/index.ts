export const APP_NAME = "Utsavly";

export type EventType = "wedding" | "birthday" | "community";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type VendorStatus = "researching" | "contacted" | "negotiating" | "booked" | "rejected";
export type IdeaKind = "decor" | "menu" | "entertainment" | "invites" | "gifts";
export type IdeaEffort = "low" | "medium" | "high";

export interface Event {
  id: number;
  type: EventType;
  title: string;
  date: string;
  city: string;
  guest_count: number;
  total_budget: number;
  theme?: string;
  culture?: string;
  priorities: string[];
  created_at?: string;
}

export interface BudgetItem {
  id: number;
  event_id: number;
  category: string;
  planned: number;
  actual: number;
  notes?: string;
  percentage?: number;
}

export interface BudgetOverview {
  event_id: number;
  total_budget: number;
  planned_total: number;
  actual_total: number;
  contingency_amount: number;
  contingency_percentage: number;
  is_overspend: boolean;
  items: BudgetItem[];
}

export interface Task {
  id: number;
  event_id: number;
  title: string;
  due_date: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export interface Vendor {
  id: number;
  event_id: number;
  category: string;
  name: string;
  contact?: string;
  quote: number;
  advance_paid: number;
  status: VendorStatus;
  notes?: string;
}

export interface VendorAiGuidance {
  vendor_id: number;
  category: string;
  questions_to_ask: string[];
  red_flags: string[];
}

export interface Idea {
  id: number;
  event_id: number;
  kind: IdeaKind;
  title: string;
  description: string;
  est_cost: number;
  effort: IdeaEffort;
  saved: boolean;
}

export interface HealthAlert {
  type: "info" | "warning" | "danger" | "success";
  message: string;
}

export interface HealthScore {
  score: number;
  rating: string;
  days_left: number;
  alerts: HealthAlert[];
  metrics: {
    budget_spent_pct: number;
    tasks_completed_pct: number;
    overdue_tasks_count: number;
    booked_vendors_count: number;
    total_vendors_count: number;
  };
}

export interface CopilotAction {
  tool: string;
  details: Record<string, unknown>;
}

export interface CopilotResponse {
  reply: string;
  actions_taken: CopilotAction[];
}
