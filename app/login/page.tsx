"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCsrfToken } from "next-auth/react";
import { Leaf, Eye, EyeOff, Loader2 } from "lucide-react";

type CsrfStatus = "loading" | "ready" | "error";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";
  const errorParam = searchParams.get("error");

  const [csrfToken, setCsrfToken] = useState("");
  const [csrfStatus, setCsrfStatus] = useState<CsrfStatus>("loading");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setCsrfStatus("loading");
    getCsrfToken()
      .then((token) => {
        if (cancelled) return;
        if (token) {
          setCsrfToken(token);
          setCsrfStatus("ready");
        } else {
          setCsrfStatus("error");
        }
      })
      .catch(() => {
        if (!cancelled) setCsrfStatus("error");
      });

    if (errorParam) {
      setError(
        errorParam === "Configuration"
          ? "Login is unavailable because server authentication is not configured."
          : "Invalid username or password",
      );
    } else {
      setError("");
    }

    return () => {
      cancelled = true;
    };
  }, [errorParam]);

  const csrfFailed = csrfStatus === "error";

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-4">
            <img src="/logo/logo.png" alt="APSTGA" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Login</h1>
          <p className="text-sm text-white/70 mt-1">APSTGA Admin Panel</p>
        </div>

        <form
          action="/api/auth/callback/credentials"
          method="POST"
          onSubmit={(event) => {
            if (!csrfToken) {
              event.preventDefault();
            }
          }}
          className="rounded-[20px] border border-border shadow-sm p-7 space-y-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url(/LOGIN%20PAGE/LOGIN%20IMAGE.png)" }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 space-y-5">
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />

          {csrfFailed && (
            <div className="bg-amber-500/20 border border-amber-400/40 rounded-[12px] px-4 py-3 text-sm text-white">
              Login is unavailable: server authentication is not configured. Please contact the administrator.
            </div>
          )}

          {!csrfFailed && error && (
            <div className="bg-red-500/20 border border-red-400/40 rounded-[12px] px-4 py-3 text-sm text-white">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-white block mb-1.5">Username</label>
            <input
              type="text"
              name="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full h-11 px-4 rounded-[12px] border border-border bg-white text-sm text-foreground placeholder:text-muted outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/20 transition-all"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-white block mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-11 pl-4 pr-11 rounded-[12px] border border-border bg-white text-sm text-foreground placeholder:text-muted outline-none focus:border-[#166534] focus:ring-1 focus:ring-[#166534]/20 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={csrfStatus === "loading"}
            className="w-full h-11 rounded-[12px] bg-[#166534] text-white text-sm font-bold hover:bg-[#0F5D31] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            Sign In
          </button>

          <p className="text-xs text-white/70 text-center">
            Authorized personnel only. Unauthorized access is prohibited.
          </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#166534] animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
