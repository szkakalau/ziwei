/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // geo-tz reads binary timezone data via __dirname; bundling breaks path resolution in API routes.
  experimental: {
    serverComponentsExternalPackages: ["geo-tz"],
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
        ],
      },
    ];
  },
};

export default nextConfig;
