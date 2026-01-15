import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Production optimizations
  reactStrictMode: true,

  // Disable React DevTools in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for images
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'cryptologos.cc',
      },
      {
        protocol: "https",
        hostname: "*"
      }
    ]
  },

  // External packages configuration
  serverExternalPackages: [
    'thread-stream',
    'pino',
    'tap',
    'fastbench',
    'desm',
    'pino-elasticsearch',
    'tape',
    'why-is-node-running',
  ],

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      '@rainbow-me/rainbowkit',
      'lucide-react',
      'recharts',
      '@tanstack/react-query'
    ],
    mcpServer: true,
  },

  // Production source maps for error tracking (disabled to reduce bundle size)
  productionBrowserSourceMaps: false,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Security Headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Cross-Origin Policies
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups'
          },
          // Note: Cross-Origin-Embedder-Policy temporarily disabled for development
          // Uncomment for production after ensuring all resources have CORP headers
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp'
          // },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'same-origin'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' http://localhost:* https://localhost:* ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:* https://new-backend-neon.vercel.app/ https://*.infura.io https://*.alchemy.com https://*.walletconnect.com https://*.walletconnect.org https://api.coingecko.com https://coin-images.coingecko.com https://li.quest https://api.web3modal.org https://eth.merkle.io https://*.coinbase.com https://cca-lite.coinbase.com wss://*.walletconnect.org wss://*.walletconnect.com wss://*.bridge.walletconnect.org https://www.google-analytics.com",
              "frame-src 'self' https://*.walletconnect.org https://*.walletconnect.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'"
            ].join('; ')
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ];
  },

  // Enable compression
  compress: true,

  // Power off X-Powered-By header
  poweredByHeader: false,

  outputFileTracingRoot: __dirname,
};

export default nextConfig;
