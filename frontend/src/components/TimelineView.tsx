import React, { useState } from "react";
import {
  ListFilter,
  Kanban,
  Plus,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  ArrowRight,
  ArrowLeft,
  X
} from "lucide-react";
import type { Task, TaskStatus, TaskPriority, Event } from "../types";
import { api, API_BASE } from "../services/api";


interface TimelineViewProps {
  event: Event;
  tasks: Task[];
  onRefresh: () => Promise<void>;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  event,
  tasks,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [newDate, setNewDate] = useState(event.date);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(event.date);
  const [taskCategory, setTaskCategory] = useState("Coordination");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [isAdding, setIsAdding] = useState(false);

  const handleUpdateStatus = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      await onRefresh();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleReschedule = async () => {
    if (!newDate || newDate === event.date) return;
    setIsRescheduling(true);
    try {
      await api.rescheduleTimeline(event.id, newDate);
      await onRefresh();
    } catch (err) {
      console.error("Failed to reschedule timeline:", err);
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await api.generateTimeline(event.id);
      await onRefresh();
    } catch (err) {
      console.error("Failed to regenerate timeline:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    setIsAdding(true);
    try {
      await fetch(`${API_BASE}/events/${event.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          due_date: taskDue,
          category: taskCategory,
          status: "pending",
          priority: taskPriority
        })
      });
      await onRefresh();
      setIsAddModalOpen(false);
      setTaskTitle("");
    } catch (err) {
      console.error("Failed to add task:", err);
    } finally {
      setIsAdding(false);
    }
  };

  const columns: { id: TaskStatus; label: string }[] = [
    { id: "pending", label: "To Do" },
    { id: "in_progress", label: "In Progress" },
    { id: "completed", label: "Completed" }
  ];

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case "critical":
        return "badge-danger font-bold";
      case "high":
        return "badge-warning font-bold";
      case "medium":
        return "badge-primary font-bold";
      case "low":
        return "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] font-semibold";
    }
  };

  return (
    <div className="space-y-8 page-transition">
      {/* Standard Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)]">
            Milestone Timeline
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-[65ch]">
            Backward-planned task milestones anchored to {event.date}. Date shifts automatically recalculate all task schedules.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[var(--surface-2)] p-1 rounded-[10px] border border-[var(--border)]">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                viewMode === "kanban"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                viewMode === "list"
                  ? "bg-[var(--surface)] text-[var(--text)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>List</span>
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Add Milestone</span>
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
            <span>AI Plan</span>
          </button>
        </div>
      </div>

      {/* Date Shift Simulator Bar */}
      <div className="ui-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-[var(--primary)] shrink-0" strokeWidth={1.75} />
          <span className="font-semibold text-[var(--text)]">
            Date Shift Simulator:
          </span>
          <span className="text-[var(--text-muted)] tabular-nums">
            Anchored to {event.date}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            aria-label="New target date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="h-10 px-3 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] text-xs font-medium text-[var(--text)] tabular-nums"
          />
          <button
            onClick={handleReschedule}
            disabled={isRescheduling || newDate === event.date}
            className="btn-secondary h-10 text-xs px-3.5 disabled:opacity-40"
          >
            {isRescheduling ? "Rescheduling..." : "Auto-Reschedule All Tasks"}
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="ui-card p-4 flex flex-col min-h-[480px] bg-[var(--surface)]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
                  <span className="font-heading font-bold text-sm text-[var(--text)]">
                    {col.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-[6px] text-xs font-bold bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-muted)] font-medium italic">
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-4 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] hover:border-[var(--primary)] transition-all space-y-3 shadow-sm hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-heading font-bold text-xs text-[var(--text)] leading-snug">
                            {t.title}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider shrink-0 ${getPriorityBadge(
                              t.priority
                            )}`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                          <span className="font-medium">{t.category}</span>
                          <span className="tabular-nums font-mono">
                            {t.due_date}
                          </span>
                        </div>

                        {/* Status Shift Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[11px]">
                          {t.status !== "pending" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  t.id,
                                  t.status === "completed" ? "in_progress" : "pending"
                                )
                              }
                              className="text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1 font-semibold"
                            >
                              <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
                              <span>Back</span>
                            </button>
                          )}
                          <div className="flex-1" />
                          {t.status !== "completed" && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(
                                  t.id,
                                  t.status === "pending" ? "in_progress" : "completed"
                                )
                              }
                              className="text-[var(--primary-text)] hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              <span>Advance</span>
                              <ArrowRight className="w-3 h-3" strokeWidth={1.75} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="ui-card p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)]">
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">Task Title</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold">Priority</th>
                <th className="py-3 px-3 font-semibold text-right">Target Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {tasks.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[var(--surface-2)] transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          t.id,
                          t.status === "completed" ? "pending" : "completed"
                        )
                      }
                      className="inline-flex items-center gap-1.5 font-semibold text-xs"
                    >
                      {t.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)]" strokeWidth={1.75} />
                      ) : (
                        <Clock className="w-4 h-4 text-[var(--warning)]" strokeWidth={1.75} />
                      )}
                      <span className="capitalize text-[var(--text)]">{t.status.replace("_", " ")}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[var(--text)]">
                    <span className={t.status === "completed" ? "line-through text-[var(--text-muted)]" : ""}>
                      {t.title}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[var(--text-muted)]">
                    {t.category}
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider ${getPriorityBadge(
                        t.priority
                      )}`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right tabular-nums font-mono text-[var(--text)] font-semibold">
                    {t.due_date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="ui-card w-full max-w-md p-6 bg-[var(--surface)] border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--text)]">
                Add Milestone Task
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Finalize mandap florals"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="ui-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDue}
                    onChange={(e) => setTaskDue(e.target.value)}
                    className="ui-input tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="ui-input"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-muted)] block mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  placeholder="Coordination, Decor, Catering, etc."
                  className="ui-input"
                />
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
                  disabled={isAdding}
                  className="btn-primary"
                >
                  {isAdding ? "Adding..." : "Save Milestone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
