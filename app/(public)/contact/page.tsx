"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useSettings } from "@/lib/use-settings";

export default function ContactPage() {
  const { settings } = useSettings();
  const { contact } = settings;

  const [data, setData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus({ type: "error", text: json.error || "We couldn't send your message. Please try again." });
        return;
      }
      setStatus({ type: "success", text: json.message || "Message sent successfully." });
      setData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus({ type: "error", text: "Network error. Please check your connection and try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full h-11 px-3.5 rounded-[10px] bg-gray-50 border border-border text-sm text-foreground outline-none focus:border-[#0B4A2E]/40 transition-all";

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-14">
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            Contact <span className="text-primary">Us</span>
          </h1>
          <p className="text-muted text-[16px] max-w-xl mx-auto">
            Get in touch with APSTGA. We&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            {[
              { icon: MapPin, title: "Address", value: contact.address },
              { icon: Phone, title: "Phone", value: contact.phone },
              { icon: Mail, title: "Email", value: contact.email },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 rounded-[14px] border border-border bg-white">
                <div className="w-11 h-11 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-[16px] border border-border shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Send us a message</h2>
            {status && (
              <div className={`px-4 py-3 rounded-[10px] text-sm flex items-center gap-2 ${
                status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {status.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {status.text}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">Name <span className="text-red-500">*</span></label>
                <input value={data.name} onChange={update("name")} className={inputCls} />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" value={data.email} onChange={update("email")} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">Phone</label>
              <input type="tel" value={data.phone} onChange={update("phone")} className={inputCls} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">Subject <span className="text-red-500">*</span></label>
              <input value={data.subject} onChange={update("subject")} className={inputCls} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-foreground mb-1">Message <span className="text-red-500">*</span></label>
              <textarea value={data.message} onChange={update("message")} rows={5}
                className="w-full px-3.5 py-3 rounded-[10px] bg-gray-50 border border-border text-sm text-foreground outline-none focus:border-[#0B6C2E]/60 transition-all" />
            </div>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] bg-[#0B4A2E] text-white text-sm font-bold hover:bg-[#0A3D26] transition-all disabled:opacity-60">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}