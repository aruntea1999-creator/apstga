"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, X, Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    document.title = "Logout - APSTGA Admin";
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut({ redirect: false });
    } catch {}
    sessionStorage.clear();
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="rounded-[14px] border border-border shadow-lg p-8 max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/LOGIN%20PAGE/LOGIN%20IMAGE.png)" }} />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">Are you sure you want to logout?</h2>
        <p className="text-sm text-white/70 mb-6">You will be redirected to the login page.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 px-5 rounded-[10px] bg-white text-xs font-medium text-black hover:bg-gray-100 transition-colors"
          >
            <X className="w-3.5 h-3.5 inline mr-1.5" />
            Cancel
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-10 px-5 rounded-[10px] bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
          >
            {loggingOut ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
