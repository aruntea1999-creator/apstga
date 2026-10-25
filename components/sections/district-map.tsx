"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

type DistrictGrowers = { name: string; value: number };
type DistrictArea = { name: string; area: number };

const MAP_URL = "/data/arunachal-pradesh.json";

let featuresCache: Feature<MultiPolygon>[] | null = null;
let featuresPromise: Promise<Feature<MultiPolygon>[]> | null = null;

function loadFeatures(): Promise<Feature<MultiPolygon>[]> {
  if (featuresCache) return Promise.resolve(featuresCache);
  if (!featuresPromise) {
    featuresPromise = fetch(MAP_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load map");
        return res.json();
      })
      .then((topo) => {
        const collection = feature(topo, topo.objects.districts) as unknown as FeatureCollection<MultiPolygon>;
        featuresCache = collection.features;
        return featuresCache;
      })
      .catch((error) => {
        featuresPromise = null;
        throw error;
      });
  }
  return featuresPromise;
}

export default function DistrictMap({
  growers,
  area,
}: {
  growers: DistrictGrowers[];
  area: DistrictArea[];
}) {
  const [features, setFeatures] = useState<Feature<MultiPolygon>[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 220, h: 130 });

  useEffect(() => {
    let active = true;
    loadFeatures()
      .then((loaded) => {
        if (active) setFeatures(loaded);
      })
      .catch(() => {
        if (active) setMapError(true);
      })
      .finally(() => {
        if (active) setMapLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDims({ w: width, h: height });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const growerMap = new Map(growers.map((d) => [d.name, d.value]));
  const areaMap = new Map(area.map((d) => [d.name, d.area]));
  const maxGrowers = Math.max(1, ...growers.map((d) => d.value));

  const fillFor = (value: number) => {
    if (value <= 0) return "#e7f4ea";
    const ratio = value / maxGrowers;
    if (ratio >= 0.8) return "#0b4a2e";
    if (ratio >= 0.5) return "#15803d";
    if (ratio >= 0.25) return "#4ade80";
    return "#86efac";
  };

  const collection = features.length
    ? { type: "FeatureCollection" as const, features }
    : null;
  const projection = collection
    ? geoMercator().fitExtent([[6, 6], [dims.w - 6, dims.h - 6]], collection)
    : null;
  const pathGen = projection ? geoPath().projection(projection) : null;

  const hoveredGrowers = hovered ? growerMap.get(hovered) ?? 0 : 0;
  const hoveredArea = hovered ? areaMap.get(hovered) ?? 0 : 0;

  return (
    <div className="flex h-[152px] w-full flex-col">
      <div
        ref={mapRef}
        className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-[#0b4a2e]/10 bg-[#fafdfa]"
      >
        {(mapLoading) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-[#0b4a2e]" />
          </div>
        )}

        {!mapLoading && mapError && (
          <div className="absolute inset-0 flex items-center justify-center px-2 text-center text-[9px] text-muted">
            Could not load the map
          </div>
        )}

        {!mapLoading && !mapError && projection && pathGen && (
          <svg
            width={dims.w}
            height={dims.h}
            role="img"
            aria-label="District-wise grower distribution map of Arunachal Pradesh"
            className="block"
          >
            {features.map((f) => {
              const name = (f.properties as { district?: string } | null)?.district ?? "";
              const value = growerMap.get(name) ?? 0;
              return (
                <path
                  key={name}
                  d={pathGen(f) ?? undefined}
                  fill={fillFor(value)}
                  stroke="#ffffff"
                  strokeWidth={0.8}
                  className="cursor-pointer transition-opacity duration-150"
                  style={{ opacity: hovered && hovered !== name ? 0.45 : 1 }}
                  onMouseEnter={() => setHovered(name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <title>{`${name}: ${value} grower${value === 1 ? "" : "s"}`}</title>
                </path>
              );
            })}
          </svg>
        )}

        {hovered && (
          <div className="pointer-events-none absolute right-1 top-1 z-10 min-w-[104px] rounded-lg bg-[#042c1a]/95 px-2 py-1.5 text-[9px] leading-snug text-white shadow-lg">
            <p className="mb-0.5 text-[10px] font-semibold text-[#86efac]">{hovered}</p>
            <p>Growers: {hoveredGrowers.toLocaleString("en-IN")}</p>
            <p>Area: {hoveredArea.toLocaleString("en-IN")} Ha</p>
          </div>
        )}
      </div>

      <div className="mt-1.5 flex shrink-0 items-center justify-center gap-1.5">
        <span className="text-[9px] text-muted">Low</span>
        <div className="flex h-1.5 w-20 overflow-hidden rounded-full">
          <div className="flex-1 bg-[#e7f4ea]" />
          <div className="flex-1 bg-[#86efac]" />
          <div className="flex-1 bg-[#4ade80]" />
          <div className="flex-1 bg-[#15803d]" />
          <div className="flex-1 bg-[#0b4a2e]" />
        </div>
        <span className="text-[9px] text-muted">High</span>
      </div>
    </div>
  );
}
