import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // special cofig to render pdf
  webpack: (
    config, 
    { buildId, dev, isServer, defaultLoaders, webpack }
  ) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
