"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/news/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (json.error) throw new Error(json.error);
        if (!json.item.published) throw new Error("Article not found");
        setItem(json.item);
      })
      .catch((e) => setError(e.message || "Failed to load article"))
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[800px] mx-auto px-8 lg:px-12 xl:px-16">
        <Link href="/news" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to News
        </Link>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error || !item ? (
          <div className="text-center py-16">
            <p className="text-sm text-red-600 mb-3">{error || "Article not found"}</p>
            <Link href="/news" className="text-sm font-medium text-primary hover:underline">View all articles</Link>
          </div>
        ) : (
          <article>
            <div className="flex items-center gap-2 text-[12px] text-muted mb-4">
              <CalendarDays className="w-4 h-4" />
              {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {item.category && (
                <span className="text-[11px] font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{item.category}</span>
              )}
            </div>
            <h1 className="text-[32px] md:text-[40px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-6">
              {item.title}
            </h1>
            {item.excerpt && <p className="text-lg text-muted leading-relaxed mb-8">{item.excerpt}</p>}
            <div className="prose max-w-none text-[15px] text-foreground/80 leading-relaxed whitespace-pre-wrap">{item.content}</div>
          </article>
        )}
      </div>
    </section>
  );
}