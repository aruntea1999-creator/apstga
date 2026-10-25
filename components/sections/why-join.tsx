"use client";

import { motion } from "framer-motion";
import { GraduationCap, Handshake, Cog, Volume2, Sprout } from "lucide-react";

const features = [
  { icon: GraduationCap, title: "Training & Support", desc: "Regular training programs on modern tea cultivation techniques." },
  { icon: Handshake, title: "Market Linkages", desc: "Direct market access and fair price negotiations with buyers." },
  { icon: Cog, title: "Resources & Schemes", desc: "Access to government schemes, subsidies, and shared resources." },
  { icon: Volume2, title: "Stronger Voice", desc: "Collective representation for policy advocacy and grower rights." },
  { icon: Sprout, title: "Sustainable Growth", desc: "Promoting sustainable and organic tea cultivation practices." },
];

export default function WhyJoinSection() {
  return (
    <aside className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-lg font-bold text-foreground">Why Join APSTGA?</h2>
        <p className="text-xs text-muted mt-1 leading-relaxed">Benefits of being part of the largest tea growers association in Arunachal.</p>
      </motion.div>

      <div className="space-y-2">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 p-3 rounded-[12px] bg-white border border-border shadow-sm hover:shadow-sm transition-shadow"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <feature.icon className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="text-[11px] text-muted leading-snug mt-0.5 line-clamp-1">{feature.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </aside>
  );
}
