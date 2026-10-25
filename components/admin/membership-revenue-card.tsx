"use client";

import { ChevronDown } from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

const paymentColors: Record<string, string> = { UPI: "#0B4A2E", Card: "#059669", "Net Banking": "#f59e0b", Cash: "#3b82f6" };

function PaymentDonut({ methods, total }: { methods: { name: string; value: number; pct: number }[]; total: number }) {
  const hasData = methods && methods.length > 0 && total > 0;
  if (!hasData) return (
    <div className="relative shrink-0 w-20 h-20 flex items-center justify-center text-[10px] text-muted">
      No data
    </div>
  );

  const totalPct = methods.reduce((s, m) => s + m.pct, 0);
  let cumulativeAngle = 0;
  const slices = methods.map((d) => {
    const pct = totalPct > 0 ? d.pct : (100 / methods.length);
    const angle = (pct / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = startAngle + angle;
    const r = 35;
    const cx = 42; const cy = 42;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x1e = cx + r * Math.cos(endRad);
    const y1e = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    const path = `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x1e},${y1e} Z`;
    return { ...d, path, pct: Math.round(pct) };
  });

  return (
    <div className="relative shrink-0">
      <svg width="80" height="80" viewBox="0 0 84 84">
        {slices.map((s) => <path key={s.name} d={s.path} fill={paymentColors[s.name] || "#999"} />)}
        <circle cx="42" cy="42" r="22" fill="white" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="text-[6px] text-muted">Total</span>
        <span className="text-[10px] font-extrabold text-foreground">₹{(total / 100000).toFixed(2)}L</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="flex gap-4 items-center flex-1 min-h-0 animate-pulse">
      <div className="space-y-3 flex-1">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
      </div>
      <div className="w-20 h-20 rounded-full bg-gray-200" />
    </div>
  );
}

export default function MembershipRevenueCard() {
  const { data, loading, error } = useDashboard();
  const revenue = data?.revenue;

  if (error) return null;

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Membership Revenue</h3>
        <button className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-gray-50 border border-border text-xs font-medium text-muted hover:text-foreground">
          This Month <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      {loading ? <Skeleton /> : !revenue ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">No revenue data</div>
      ) : (
        <div className="flex gap-4 items-center flex-1 min-h-0">
          <div className="space-y-2">
            <div>
              <div className="text-base font-extrabold text-foreground leading-tight">₹{revenue.today.toLocaleString()}</div>
              <div className="text-[10px] text-muted leading-tight">Today&apos;s Collection</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-foreground leading-tight">₹{revenue.month.toLocaleString()}</div>
              <div className="text-[10px] text-muted leading-tight">Monthly Collection</div>
            </div>
            <div>
              <div className="text-base font-extrabold text-foreground leading-tight">₹{revenue.year.toLocaleString()}</div>
              <div className="text-[10px] text-muted leading-tight">Yearly Collection</div>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <PaymentDonut methods={revenue.methods} total={revenue.month} />
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
              {revenue.methods.map((m: any) => (
                <div key={m.name} className="flex items-center gap-1 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: paymentColors[m.name] || "#999" }} />
                  <span className="text-muted">{m.name}</span>
                  <span className="font-medium text-foreground">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
