"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, TrendingUp, DollarSign, CalendarDays, Receipt, Loader2, Plus, X, Printer } from "lucide-react";
import PageShell from "@/components/admin/page-shell";
import { DashboardContext, useDashboard } from "@/lib/dashboard-context";
import type { DashboardData } from "@/lib/dashboard-context";

function RevenueSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[12px] border border-border shadow-sm p-5 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 mb-3" />
          <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function InnerContent({ onRecord, onReceipt }: { onRecord: () => void; onReceipt: (p: any) => void }) {
  const { data, loading, error, refetch } = useDashboard();
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const res = await fetch("/api/admin/payments");
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPayments(json.payments || []);
    } catch {
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  if (loading) return <RevenueSkeleton />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={refetch} className="text-xs font-medium text-[#0B4A2E] hover:underline">Retry</button>
      </div>
    );
  }

  const revenue = data?.revenue;
  const methods = revenue?.methods || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-[#0B4A2E]" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{revenue ? formatCurrency(revenue.today) : "—"}</div>
          <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">Today</div>
          <div className="text-[11px] text-muted mt-0.5">Membership collections today</div>
        </div>

        <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <CalendarDays className="w-5 h-5 text-[#0B4A2E]" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{revenue ? formatCurrency(revenue.month) : "—"}</div>
          <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">This Month</div>
          <div className="text-[11px] text-muted mt-0.5">Monthly membership revenue</div>
        </div>

        <div className="bg-white rounded-[12px] border border-border shadow-sm p-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-[#0B4A2E]" />
          </div>
          <div className="text-2xl font-extrabold text-foreground">{revenue ? formatCurrency(revenue.year) : "—"}</div>
          <div className="text-sm font-medium text-[#0B4A2E] mt-0.5">This Year</div>
          <div className="text-[11px] text-muted mt-0.5">Year-to-date total revenue</div>
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Payment Methods Breakdown</h3>
            <p className="text-[11px] text-muted mt-0.5">Revenue distribution by payment method this month</p>
          </div>
        </div>
        {!methods.length ? (
          <div className="p-8 text-xs text-center text-muted">No payment data available yet</div>
        ) : (
          <div className="p-4 space-y-3">
            {methods.map((m: any) => (
              <div key={m.name} className="flex items-center gap-4">
                <span className="w-28 text-xs font-medium text-foreground capitalize">{m.name.replace(/_/g, " ")}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#0B4A2E] transition-all" style={{ width: `${m.pct}%` }} />
                </div>
                <span className="w-24 text-xs text-right text-muted">{formatCurrency(m.value)}</span>
                <span className="w-12 text-xs text-right font-semibold text-foreground">{m.pct}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-[12px] border border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Payments</h3>
            <p className="text-[11px] text-muted mt-0.5">Latest membership fee transactions</p>
          </div>
        </div>
        {paymentsLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-[#0B4A2E]" /></div>
        ) : !payments.length ? (
          <div className="p-8 text-xs text-center text-muted">
            No payments recorded yet. Record the first payment to see it here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  {["Member", "ID", "Amount", "Method", "Collected", "Receipt"].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-muted px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-border hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{p.growerName}</td>
                    <td className="px-4 py-3 text-xs text-muted">{p.membershipId}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{p.method}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => onReceipt(p)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] border border-border text-[10px] font-semibold text-muted hover:bg-gray-50 transition-colors">
                        <Receipt className="w-3 h-3" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [growers, setGrowers] = useState<any[]>([]);
  const [form, setForm] = useState({ growerId: "", amount: "", method: "Cash" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openRecord = async () => {
    setShowModal(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/dashboard?limit=100");
      const json = await res.json();
      setGrowers(json.recentRegistrations?.rows || []);
    } catch {
      setGrowers([]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to record payment");
      setToast({ type: "success", text: "Payment recorded." });
      setShowModal(false);
      setForm({ growerId: "", amount: "", method: "Cash" });
      fetchData();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to record payment." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full h-10 px-4 rounded-[10px] bg-gray-50 border border-border text-xs text-foreground outline-none focus:border-[#0B4A2E]/30 transition-all";
  const labelClass = "text-xs font-medium text-foreground block mb-1.5";

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      <PageShell
        title="Membership Payments"
        description="Track membership fees and revenue"
        segments={[{ label: "Dashboard", href: "/admin" }, { label: "Payments" }]}
        actions={
          <button onClick={openRecord} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </button>
        }
      >
        {toast && (
          <div className={`mb-4 px-4 py-3 rounded-[12px] text-sm ${toast.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {toast.text}
          </div>
        )}
        <InnerContent onRecord={openRecord} onReceipt={setReceipt} />
      </PageShell>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Record Membership Payment</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-muted"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Grower *</label>
                <select className={inputClass} value={form.growerId} onChange={(e) => setForm({ ...form, growerId: e.target.value })}>
                  <option value="">Select grower</option>
                  {growers.map((g: any) => <option key={g.id} value={g.id}>{g.name} ({g.status})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Amount (INR) *</label>
                  <input type="number" min="1" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className={labelClass}>Method</label>
                  <select className={inputClass} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {["Cash", "UPI", "Card", "Net Banking"].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 h-9 px-5 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26] disabled:opacity-60">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setReceipt(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div id="receipt" className="text-center">
              <h3 className="text-sm font-extrabold text-foreground">APSTGA</h3>
              <p className="text-[10px] text-muted mt-0.5">Payment Receipt</p>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-dashed border-border"><span className="text-muted">Member</span><span className="font-medium">{receipt.growerName}</span></div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-border"><span className="text-muted">Membership ID</span><span className="font-medium">{receipt.membershipId}</span></div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-border"><span className="text-muted">Amount</span><span className="font-bold">{formatCurrency(receipt.amount)}</span></div>
              <div className="flex justify-between py-1.5 border-b border-dashed border-border"><span className="text-muted">Method</span><span className="font-medium">{receipt.method}</span></div>
              <div className="flex justify-between py-1.5"><span className="text-muted">Date</span><span className="font-medium">{new Date(receipt.date).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setReceipt(null)} className="h-9 px-4 rounded-[10px] border border-border text-xs font-medium text-muted hover:bg-gray-50">Close</button>
              <button onClick={() => window.print()} className="flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-[#0B4A2E] text-white text-xs font-bold hover:bg-[#0A3D26]">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardContext.Provider>
  );
}