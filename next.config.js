/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable unnecessary features during development
  optimizeFonts: false,
  // Use SWC instead of Babel
  swcMinify: true,
  // Skip type checking during development
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during development
    ignoreDuringBuilds: true,
  },
  // Disable image optimization during development
  images: { 
    unoptimized: true,
  },
  // Improve hot reloading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;