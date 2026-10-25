"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, Moon, Sun, ChevronDown, User, LogOut } from "lucide-react";

export default function AdminTopNavbar() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.messages) setUnreadCount(json.messages.filter((m: any) => !m.read).length);
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      router.push(`/admin/growers?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-border h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search growers, districts, villages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full h-10 pl-10 pr-4 rounded-[12px] bg-gray-50 border border-border text-sm text-foreground placeholder:text-muted outline-none focus:border-[#0B4A2E]/30 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/messages" className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Messages">
            <Bell className="w-[18px] h-[18px] text-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white min-w-[18px] min-h-[18px] px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/admin/logout" className="p-2.5 rounded-xl hover:bg-red-50 transition-colors">
            <LogOut className="w-[18px] h-[18px] text-red-500" />
          </Link>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {darkMode ? <Sun className="w-[18px] h-[18px] text-muted" /> : <Moon className="w-[18px] h-[18px] text-muted" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground leading-tight">Administrator</div>
                <div className="text-[10px] text-muted leading-tight">Super Admin</div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[14px] border border-border shadow-xl z-20 py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Administrator</p>
                    <p className="text-xs text-muted">Super Admin</p>
                  </div>
                  <Link href="/admin/settings" className="block w-full px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-gray-50 text-left">Profile</Link>
                  <Link href="/admin/settings" className="block w-full px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-gray-50 text-left">Settings</Link>
                  <Link href="/admin/logout" className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-border mt-2 pt-2">Logout</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
