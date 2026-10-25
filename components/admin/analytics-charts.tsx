"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LabelList,
} from "recharts";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
import type { FeatureCollection, Feature, MultiPolygon } from "geojson";
import { useDashboard } from "@/lib/dashboard-context";

function DarkTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-900 text-white rounded-[8px] px-2.5 py-1.5 text-[11px] shadow-lg">
        <p className="font-semibold mb-0.5">{label}</p>
        <p>Registrations: {payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
}

function Dropdown({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-gray-50 border border-border text-[11px] font-medium text-muted hover:text-foreground">
      {label} <ChevronDown className="w-3 h-3" />
    </button>
  );
}

function ChartSkeleton() {
  return <div className="flex-1 min-h-0 bg-gray-50 rounded-[10px] animate-pulse" />;
}

function ChartError() {
  return <div className="flex-1 min-h-0 flex items-center justify-center text-[11px] text-muted">Failed to load</div>;
}

function ChartEmpty() {
  return <div className="flex-1 min-h-0 flex items-center justify-center text-[11px] text-muted">No data available</div>;
}

function ChartCard({ title, children, dropdown }: { title: string; children: React.ReactNode; dropdown?: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {dropdown && <Dropdown label={dropdown} />}
      </div>
      {children}
    </div>
  );
}

export function GrowthChart() {
  const { data, loading, error } = useDashboard();
  const [year, setYear] = useState(2026);
  const [chartData, setChartData] = useState(data?.growthChart);

  useEffect(() => {
    if (data?.growthChart) setChartData(data.growthChart);
  }, [data]);

  return (
    <ChartCard title="Grower Registration Growth" dropdown={`${year}`}>
      {loading ? <ChartSkeleton /> : error ? <ChartError /> : !chartData?.length ? <ChartEmpty /> : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B4A2E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0B4A2E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, (dataMin: number) => Math.ceil(Math.max(dataMin * 1.2, 50))]} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="growers" stroke="#0B4A2E" strokeWidth={2} fill="url(#growthGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function DistrictChart() {
  const { data, loading, error } = useDashboard();
  const chartData = data?.districtChart;

  return (
    <ChartCard title="District-wise Registration" dropdown="This Year">
      {loading ? <ChartSkeleton /> : error ? <ChartError /> : !chartData?.length ? <ChartEmpty /> : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} width={64} />
              <Tooltip content={<DarkTooltip />} />
              <Bar dataKey="growers" fill="#0B4A2E" radius={[0, 4, 4, 0]} barSize={16}>
                <LabelList dataKey="growers" position="right" fill="#6b7280" fontSize={10} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function ProductionChart() {
  const { data, loading, error } = useDashboard();
  const chartData = data?.productionChart;

  return (
    <ChartCard title="Annual Green Leaf Production (MT)" dropdown="All Districts">
      {loading ? <ChartSkeleton /> : error ? <ChartError /> : !chartData?.length ? <ChartEmpty /> : (
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B4A2E" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#0B4A2E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip content={<DarkTooltip />} />
              <Area type="monotone" dataKey="production" stroke="#0B4A2E" strokeWidth={2} fill="url(#productionGradient)" dot={{ r: 3, fill: "#0B4A2E", stroke: "#fff", strokeWidth: 2 }}>
                <LabelList dataKey="production" position="top" fill="#6b7280" fontSize={10} formatter={(v: any) => `${(Number(v) / 1000).toFixed(0).replace(/\.0$/, "")}K`} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function GrowthMap() {
  const { data, loading } = useDashboard();
  const mapData = data?.mapData || [];
  const [features, setFeatures] = useState<Feature<MultiPolygon>[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 400, h: 200 });

  useEffect(() => {
    async function loadMap() {
      try {
        const res = await fetch("https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@2884453/topojson/states/arunachal-pradesh.json");
        const topo = await res.json();
        const allFeatures = (feature(topo, topo.objects.districts) as unknown as FeatureCollection<MultiPolygon>).features;
        setFeatures(allFeatures);
      } catch { setMapError(true); }
      finally { setMapLoading(false); }
    }
    loadMap();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const growerMap = new Map(mapData.map((d: any) => [d.district, d]));
  const getDensity = (name: string) => { const d = growerMap.get(name); return d ? (d as any).growers : 0; };
  const densityColor = (growers: number) => {
    if (growers >= 4) return "#0B4A2E";
    if (growers >= 2) return "#22c55e";
    if (growers >= 1) return "#4ade80";
    return "#bbf7d0";
  };

  const projection = features.length
    ? geoMercator().fitExtent([[8, 8], [dims.w - 8, dims.h - 8]], { type: "FeatureCollection", features } as any)
    : null;
  const pathGen = projection ? geoPath().projection(projection) : null;

  const hoverEntry = hovered ? growerMap.get(hovered) : null;
  const he = hoverEntry as any;

  return (
    <div className="bg-white rounded-[12px] border border-border shadow-sm p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-sm font-bold text-foreground">Growers Distribution Map</h3>
        <Dropdown label="All Districts" />
      </div>
      <div className="flex-1 min-h-0">
        <div ref={containerRef} className="h-full bg-[#fafdfa] rounded-[10px] border border-border/50 relative overflow-hidden flex items-center justify-center">
          {(loading || mapLoading) && (
            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-5 h-5 text-[#0B4A2E] animate-spin" /></div>
          )}
          {(!loading && !mapLoading) && mapError && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted">Could not load map</div>
          )}
          {!mapLoading && !mapError && projection && pathGen && (
            <svg width={dims.w} height={dims.h} className="flex-shrink-0" style={{ maxWidth: "100%", maxHeight: "100%" }}>
              {features.map((f) => {
                const name = f.properties?.district || "";
                const fill = densityColor(getDensity(name));
                return (
                  <path key={name || Math.random()} d={pathGen(f) || undefined} fill={fill}
                    stroke="#ffffff" strokeWidth={1} className="transition-all duration-150 cursor-pointer"
                    style={{ opacity: hovered && hovered !== name ? 0.5 : 1 }}
                    onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered(null)} />
                );
              })}
            </svg>
          )}
          {he && (
            <div className="absolute top-1 right-1 bg-gray-900 text-white rounded-[8px] px-2 py-1.5 text-[10px] shadow-lg z-10 min-w-[120px]">
              <p className="font-semibold text-[11px] mb-0.5 text-[#4ade80]">{hovered}</p>
              <p>Growers: {he.growers}</p>
              <p>Area: {he.areaHa} Ha</p>
              <p>Production: {Number(he.production).toLocaleString("en-IN")} Kg</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-2 shrink-0">
        <span className="text-[10px] text-muted">Low</span>
        <div className="flex h-1.5 rounded-full overflow-hidden w-24">
          <div className="flex-1 bg-[#bbf7d0]" /><div className="flex-1 bg-[#86efac]" /><div className="flex-1 bg-[#4ade80]" />
          <div className="flex-1 bg-[#22c55e]" /><div className="flex-1 bg-[#16a34a]" /><div className="flex-1 bg-[#15803d]" /><div className="flex-1 bg-[#0B4A2E]" />
        </div>
        <span className="text-[10px] text-muted">High</span>
      </div>
    </div>
  );
}
