"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Star, Award, Sparkles, Loader2, Package } from "lucide-react";

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

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/marketplace")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setProducts(json.products || []);
      })
      .catch((e) => setError(e.message || "Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-white py-20">
      <div className="w-full max-w-[1000px] mx-auto px-8 lg:px-12 xl:px-16">
        <div className="text-center mb-12">
          <h1 className="text-[40px] md:text-[48px] font-extrabold text-foreground leading-[1.1] tracking-[-0.02em] mb-3">
            Arun Tea <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-muted text-[16px] max-w-xl mx-auto">
            Discover authentic tea brands and packages from small growers across Arunachal Pradesh.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : error ? (
          <p className="text-center text-sm text-red-600">{error}</p>
        ) : !products.length ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No products available yet</p>
            <p className="text-xs text-muted mt-1">Check back soon for new Arun Tea products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[16px] border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="relative aspect-square bg-[#F0F0ED] flex items-center justify-center overflow-hidden">
                  <img src={product.image || "/logo/logo.png"} alt={product.name} className="w-full h-full object-cover" />
                  {product.badge && (
                    <div className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${product.badgeColor}`}>
                      {badgeIcons[product.badge]}
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-lg font-bold text-foreground leading-snug mb-1.5">{product.name}</h2>
                  <p className="text-sm text-muted mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{product.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}