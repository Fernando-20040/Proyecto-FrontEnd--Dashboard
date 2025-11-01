/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cacheComponents: true, // reemplaza al antiguo "ppr"
  },
  reactStrictMode: true,
};

export default nextConfig;
