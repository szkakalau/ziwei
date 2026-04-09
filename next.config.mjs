/** @type {import('next').NextConfig} */
const nextConfig = {
  // geo-tz reads binary timezone data via __dirname; bundling breaks path resolution in API routes.
  experimental: {
    serverComponentsExternalPackages: ["geo-tz"],
  },
};

export default nextConfig;
