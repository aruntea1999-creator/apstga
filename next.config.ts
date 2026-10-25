import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          // Prevent the page from being embedded in frames (clickjacking protection)
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // XSS protection (older browsers)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // HSTS - only enable on HTTPS in production
          // Uncomment and adjust the source if you want HSTS only on specific paths
          // {
          //   source: "/(.*)",
          //   headers: [
          //     {
          //       key: "Strict-Transport-Security",
          //       value: "max-age=31536000; includeSubDomains; preload",
          //     },
          //   ],
          // },
        ],
      },
    ];
  },
};

export default nextConfig;