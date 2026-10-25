"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Mail, User, CalendarDays, Trash2, MailOpen, ArrowLeft } from "lucide-react";
import PageShell from "@/components/admin/page-shell";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/messages");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setMessages(json.messages || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const setRead = async (id: string, read: boolean) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    try {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read }),
      });
    } catch {
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedId === id) setSelectedId(null);
    try {
      await fetch("/api/admin/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {
      fetchMessages();
    }
  };

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selected = messages.find((m) => m.id === selectedId);

  return (
    <PageShell
      title="Contact Messages"
      description="Messages submitted through the public contact form"
      segments={[{ label: "Dashboard", href: "/admin" }, { label: "Messages" }]}
    >
      <div className="bg-white rounded-[12px] border border-border shadow-sm flex h-[600px] overflow-hidden">
        <div className="w-[380px] shrink-0 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-gray-50 border border-border text-xs outline-none focus:border-[#0B4A2E]/30"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-14 rounded-[10px] bg-gray-100" />
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-xs text-center text-muted">{error}</div>
            ) : !filtered.length ? (
              <div className="p-8 text-xs text-center text-muted">No messages found</div>
            ) : (
              filtered.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => { setSelectedId(msg.id); if (!msg.read) setRead(msg.id, true); }}
                  className={`w-full text-left px-4 py-3 border-b border-border hover:bg-gray-50/50 transition-colors flex items-start gap-3 ${
                    selectedId === msg.id ? "bg-[#0B4A2E]/5" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    {!msg.read && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs truncate ${msg.read ? "text-muted" : "font-semibold text-foreground"}`}>{msg.name}</span>
                      <span className="text-[10px] text-muted shrink-0">{new Date(msg.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${msg.read ? "text-muted" : "font-medium text-foreground/80"}`}>{msg.subject}</p>
                    <p className="text-[11px] text-muted truncate mt-0.5">{msg.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <Mail className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground">{filtered.length ? "Select a message" : "No messages"}</p>
                <p className="text-xs text-muted mt-1">
                  {filtered.length
                    ? "Click on a message from the left panel to read it."
                    : "Messages submitted from the public contact form will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="p-5 border-b border-border">
                <h3 className="text-sm font-bold text-foreground">{selected.subject}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <span className="text-xs font-medium text-foreground">{selected.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted">
                    <CalendarDays className="w-3 h-3" />
                    {new Date(selected.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="text-[11px] text-muted mt-2 space-y-0.5">
                  <div>Email: <span className="font-medium text-foreground/70">{selected.email}</span></div>
                  {selected.phone && <div>Phone: <span className="font-medium text-foreground/70">{selected.phone}</span></div>}
                </div>
              </div>
              <div className="flex-1 p-5 overflow-y-auto">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
              </div>
              <div className="p-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setSelectedId(null)}
                  className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to list
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRead(selected.id, !selected.read)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50 transition-colors"
                  >
                    <MailOpen className="w-3.5 h-3.5" /> {selected.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}