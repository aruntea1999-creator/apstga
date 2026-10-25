"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays, FileText, ArrowRight, Loader2 } from "lucide-react";

export default function NewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setItems(json.items || []);
      })
      .catch((e) => setError(e.message || "Failed to load articles"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            News & <span className="text-primary">Updates</span>
          </h1>
          <p className="text-muted text-[16px] max-w-xl mx-auto">
            Latest news, announcements, and updates from APSTGA.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : !items.length ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No articles yet</p>
            <p className="text-xs text-muted mt-1">Check back soon for updates from APSTGA.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <Link key={item.id} href={`/news/${item.slug}`}
                className="block bg-white rounded-[16px] border border-border shadow-sm p-6 hover:shadow-md transition-all hover:border-primary/30">
                <div className="flex items-center gap-2 text-[11px] text-muted mb-2">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  {item.category && (
                    <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{item.category}</span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground mb-1.5">{item.title}</h2>
                <p className="text-sm text-muted leading-relaxed">
                  {item.excerpt || item.content.slice(0, 180)}
                  {(!item.excerpt && item.content.length > 180) ? "..." : ""}
                </p>
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary mt-3 hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}