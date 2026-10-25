"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, ClipboardCheck, PieChart, BarChart3,
  FileText, CreditCard, Newspaper, Calendar, MessageSquare, Settings,
  Shield, FileBarChart, Database, Store, Link2, UsersRound,
} from "lucide-react";

const staticNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Growers", href: "/admin/growers" },
  { icon: ClipboardCheck, label: "Registration Requests", href: "/admin/registrations" },
  { icon: MessageSquare, label: "Contact Messages", href: "/admin/messages" },
  { icon: Store, label: "Marketplace", href: "/admin/marketplace" },
  { icon: PieChart, label: "Statistics", href: "/admin/statistics" },
  { icon: BarChart3, label: "District Analytics", href: "/admin/districts" },
  { icon: FileText, label: "Documents", href: "/admin/documents" },
  { icon: CreditCard, label: "Membership Payments", href: "/admin/payments" },
  { icon: Newspaper, label: "News & Events", href: "/admin/news" },
  { icon: Calendar, label: "Events", href: "/admin/events" },
  { icon: Link2, label: "Our Work", href: "/admin/our-work" },
  { icon: UsersRound, label: "Executive Members", href: "/admin/members" },
  { icon: Settings, label: "Website Settings", href: "/admin/settings" },
  { icon: Shield, label: "Administrators", href: "/admin/administrators" },
  { icon: FileBarChart, label: "Reports", href: "/admin/reports" },
  { icon: Database, label: "Database Backup", href: "/admin/backup" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.kpi?.pendingRegistrations?.value != null) setPendingCount(json.kpi.pendingRegistrations.value);
      })
      .catch(() => {});
    fetch("/api/admin/messages")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.messages) setUnreadCount(json.messages.filter((m: { read?: boolean }) => !m.read).length);
      })
      .catch(() => {});
  }, [pathname]);

  const navItems = staticNavItems.map((item) => ({
    ...item,
    badge: item.href === "/admin/registrations" ? (pendingCount != null && pendingCount > 0 ? String(pendingCount) : undefined) : item.href === "/admin/messages" ? (unreadCount != null && unreadCount > 0 ? String(unreadCount) : undefined) : undefined,
  }));

  return (
    <aside className="w-60 bg-white border-r border-border flex flex-col shrink-0">
      <div className="flex items-center h-10 px-5 border-b border-border">
        <div>
          <span className="text-sm font-bold text-foreground">APSTGA</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`flex items-center gap-3 px-3 py-2 rounded-[10px] text-sm font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-[#0B4A2E]"
                  : "text-muted hover:text-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-[#0B4A2E]" : "text-muted"}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="relative p-6 overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/admin-footer/panel%20footer.png)" }} />
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center">
            <img src="/logo/logo.png" alt="APSTGA" className="w-12 h-12 object-cover mx-auto mb-3 rounded-full" />
            <p className="text-sm font-semibold text-white">Empowering Small Tea Growers.</p>
            <p className="text-xs text-white/60 mt-1">Building A Stronger Arunachal.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
