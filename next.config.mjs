/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // geo-tz reads binary timezone data via __dirname; bundling breaks path resolution in API routes.
  // Next.js 15 moved this from experimental.serverComponentsExternalPackages to serverExternalPackages.
  serverExternalPackages: ["geo-tz"],
  experimental: {
    serverActions: {},
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-XSS-Protection", value: "0" },
          // Content-Security-Policy: defense-in-depth against XSS. Allows the
          // third-party scripts the app loads (OneSignal, GA4, Stripe) and the
          // endpoints they call. 'unsafe-inline' for script-src is needed for
          // next/script inline + OneSignal init; tighten to nonces later.
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.onesignal.com https://js.stripe.com; connect-src 'self' https://onesignal.com https://api.stripe.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src https://js.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:;" },
        ],
      },
    ];
  },
};

export default nextConfig;
