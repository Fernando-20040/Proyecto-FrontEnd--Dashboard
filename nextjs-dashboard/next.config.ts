import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true, 
  },
  reactStrictMode: true,
};

export default nextConfig;
