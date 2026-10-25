"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink, Link2 } from "lucide-react";

interface WorkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  image: string;
  video: string;
  createdAt: string;
}

export default function OurWorkPage() {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/our-work")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed to load our work"))))
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setItems(json.items || []);
      })
      .catch((e) => setError(e?.message || "Failed to load our work"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[1400px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm font-medium mb-5">
            <Link2 className="w-4 h-4" />
            APSTGA in the field
          </div>
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            Our <span className="text-primary">Work</span>
          </h1>
          <p className="text-muted text-[16px] max-w-xl mx-auto">
            A look at the work we have done for small tea growers across Arunachal Pradesh.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : !items.length ? (
          <div className="text-center py-16">
            <Link2 className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No work shared yet</p>
            <p className="text-xs text-muted mt-1">Check back soon to see the work APSTGA has done.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-8 justify-items-center">
            {items.map((item) => (
              <div key={item.id} className="group flex flex-col items-stretch gap-[19px] w-full max-w-[240px]">
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                  className="w-full aspect-square rounded-[20px] border border-border bg-white shadow-[0_2px_12px_rgba(16,24,40,0.06)] overflow-hidden flex flex-col hover:shadow-[0_16px_40px_rgba(16,24,40,0.14)] hover:-translate-y-1 transition-all duration-300"
                >
                <div className="relative h-[55%] min-h-[130px] shrink-0 bg-gray-100 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-muted/30" />
                  </div>
                  {item.image && (
                    <img
                      src={`/api/our-work/image?id=${item.id}`}
                      alt={item.title || "Work preview"}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute top-2 left-2 text-[8px] font-semibold text-white bg-[#0B4A2E]/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" /> {new URL(item.url).hostname}
                  </span>
                </div>
                <div className="relative z-10 flex-1 min-h-0 p-2.5 flex flex-col gap-1 overflow-hidden">
                  <h2 className="text-[11px] font-bold text-foreground leading-snug line-clamp-2">{item.title || "Untitled link"}</h2>
                  {item.description && (
                    <p className="text-[10px] text-muted leading-relaxed line-clamp-3">{item.description}</p>
                  )}
                </div>
              </a>
              <a href={item.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 h-8 rounded-full border border-border text-[#0B4A2E] text-[10px] font-bold hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200">
                <ExternalLink className="w-3 h-3" /> Open Original Post
              </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}