"use client";

import AdminSidebar from "@/components/admin/sidebar";
import AdminTopNavbar from "@/components/admin/top-navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F7F8F6]">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <AdminTopNavbar />
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
        <footer className="h-8 shrink-0 flex items-center justify-between px-6 text-[11px] text-muted border-t border-border bg-white">
          <span>APSTGA Admin Portal</span>
          <div className="flex items-center gap-4">
            <span>Version 1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Server Online
            </span>
            <span>&copy; 2026 APSTGA. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
