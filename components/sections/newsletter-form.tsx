"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "error", text: json.error || "Something went wrong. Please try again." });
        return;
      }
      setStatus({ type: "success", text: json.message || "Subscribed successfully!" });
      setEmail("");
    } catch {
      setStatus({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Your email"
          suppressHydrationWarning
          className="flex-1 h-11 px-4 rounded-[12px] bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button type="submit" disabled={submitting} suppressHydrationWarning className="h-11 w-11 rounded-[12px] bg-white/15 hover:bg-white/25 transition-colors flex items-center justify-center disabled:opacity-60">
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </form>
      {status && (
        <p className={`mt-2 text-[11px] flex items-center gap-1 ${status.type === "success" ? "text-emerald-300" : "text-red-300"}`}>
          {status.type === "success" ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
          {status.text}
        </p>
      )}
    </div>
  );
}