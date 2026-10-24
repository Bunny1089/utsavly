import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, Bot, User, CheckCircle2, Zap } from "lucide-react";
import type { Event, CopilotAction } from "../types";
import { api } from "../services/api";

interface CopilotSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onRefresh: () => Promise<void>;
}

interface ChatMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  actions?: CopilotAction[];
}

export const CopilotSlideOver: React.FC<CopilotSlideOverProps> = ({
  isOpen,
  onClose,
  event,
  onRefresh
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: `Hello! I am your Utsavly Planner Copilot for "${event.title}". I have access to 3 safe execution tools: update_budget_item, add_task, and add_vendor. Ask me to make adjustments below!`
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape key handler for accessible close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = async (msgText?: string) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const response = await api.sendCopilotMessage(event.id, textToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "copilot",
        text: response.reply,
        actions: response.actions_taken
      };
      setMessages((prev) => [...prev, botMsg]);
      if (response.actions_taken && response.actions_taken.length > 0) {
        await onRefresh();
      }
    } catch (err) {
      console.error("Copilot error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "copilot",
          text: "I had trouble executing that command. Please verify your connection."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    "Increase catering budget by 50000",
    "Add milestone task: Finalize floral mandap by Nov 10",
    "Add vendor: Royal Caterers with 150000 quote"
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div
        className="w-full sm:w-[420px] bg-[var(--surface)] border-l border-[var(--border)] h-full flex flex-col shadow-2xl transition-transform duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Planner Copilot"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
              <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-[var(--text)]">
                Planner Copilot
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">
                Restricted to 3 Allowlisted Tools
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* 3 Tool Pill Badges */}
        <div className="px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)] flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-[var(--text-muted)]">
          <Zap className="w-3 h-3 text-[var(--accent)] shrink-0" strokeWidth={1.75} />
          <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
            update_budget_item
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
            add_task
          </span>
          <span className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--text)]">
            add_vendor
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "copilot" && (
                <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
                  <Bot className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-[12px] leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[var(--primary)] text-[var(--on-accent)] font-medium"
                    : "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]"
                }`}
              >
                <p>{m.text}</p>

                {/* Executed Tools Feedback */}
                {m.actions && m.actions.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[var(--border)] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[var(--success)] block tracking-wider">
                      Actions executed on plan:
                    </span>
                    {m.actions.map((act, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--success)]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        <span>
                          {act.tool}: {JSON.stringify(act.details)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === "user" && (
                <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                  <User className="w-3.5 h-3.5" strokeWidth={1.75} />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-2.5 justify-start text-xs text-[var(--text-muted)]">
              <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] shrink-0">
                <Bot className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <div className="p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--border)] inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" strokeWidth={1.75} />
                <span>Executing plan updates...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Action Chips */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface)] space-y-1.5">
          <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase tracking-wider">
            Quick Actions:
          </span>
          <div className="flex flex-col gap-1.5">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isSending}
                className="text-left text-[11px] p-2 rounded-[8px] bg-[var(--surface-2)] hover:border-[var(--primary)] border border-[var(--border)] text-[var(--text)] transition-all truncate"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            aria-label="Message Copilot"
            placeholder="e.g. increase catering budget by 50000"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="ui-input flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="btn-primary h-11 px-4"
            aria-label="Send message to Copilot"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};
