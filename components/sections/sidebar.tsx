"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Sprout, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from "recharts";

type StatsData = {
  annualProduction: number;
  monthlyProduction: { month: string; prod: number }[];
};

export default function Sidebar() {
  const [data, setData] = useState<StatsData>({ annualProduction: 0, monthlyProduction: [] });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => { if (!json.error) setData(json); })
      .catch(() => {});
  }, []);

  const barColors = (data.monthlyProduction || []).map((d) =>
    d.prod >= 5000 ? "#0B4A2E" : d.prod >= 4000 ? "#1F7A6C" : "#D98B34"
  );
  const total = data.annualProduction || 0;

  return (
    <aside className="relative h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex-1">
        <Card className="p-4 rounded-[12px] border-border shadow-sm h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-primary" />
              Annual Green Leaf
            </h3>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-600">{total.toLocaleString("en-IN")} Kg</span>
            </div>
          </div>
          <div className="text-[11px] text-muted mb-3">Monthly production cycle from recorded data</div>
          <div className="flex-1 relative min-h-0">
            <div className="absolute inset-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart key="sidebar-prod" data={data.monthlyProduction} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip formatter={(value) => [`${Number(value).toLocaleString("en-IN")} MT`, "Production"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }} />
                  <Bar dataKey="prod" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {(data.monthlyProduction || []).map((entry, i) => (
                      <Cell key={`cell-${i}`} fill={barColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </motion.div>
    </aside>
  );
}