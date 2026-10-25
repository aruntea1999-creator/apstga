"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Leaf, Star, Award, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  badge: string | null;
  badgeColor: string;
  image: string;
}

const badgeIcons: Record<string, React.ReactNode> = {
  Bestseller: <Star className="w-3 h-3" />,
  Organic: <Leaf className="w-3 h-3" />,
  Premium: <Award className="w-3 h-3" />,
  New: <Sparkles className="w-3 h-3" />,
  Limited: <Award className="w-3 h-3" />,
};

export default function MarketplaceSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => r.json())
      .then((json) => setProducts(json.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[24px] border border-white/60 bg-white/70 shadow-[0_20px_50px_-28px_rgba(11,74,46,0.5)] backdrop-blur-xl backdrop-saturate-150"
    >
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        aria-hidden="true"
      />
      <div className="relative p-8 md:p-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="gloss inline-flex rounded-full">
            <Image src="/logo/logo.png" alt="APSTGA" width={28} height={28} className="w-7 h-7 rounded-full object-cover" />
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Arun Tea</h2>
        </div>
        <p className="text-sm text-muted mb-10 max-w-2xl">
          Discover authentic tea brands and packages from small growers across Arunachal Pradesh.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : !products.length ? (
          <div className="text-center py-20 text-sm text-muted">No products available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group overflow-hidden rounded-[12px] border border-white/70 bg-white/80 shadow-[0_8px_24px_-14px_rgba(11,74,46,0.35)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_16px_36px_-18px_rgba(11,74,46,0.5)]"
              >
                <div className="gloss relative aspect-square bg-[#F0F0ED] flex items-center justify-center overflow-hidden">
                  <img src={product.image || "/logo/logo.png"} alt={product.name} className="w-full h-full object-cover" />
                  {product.badge && (
                    <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${product.badgeColor}`}>
                      {badgeIcons[product.badge]}
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-base font-bold text-foreground leading-snug mb-1.5">{product.name}</h3>
                  <p className="text-sm text-muted mb-3 line-clamp-1">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-primary">{product.price}</span>
                    <Link href="/marketplace" className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 transition-colors">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
            View All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}