import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: isProduction ? "export" : undefined,
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true,
  },
  // Headers are not supported in static export
  // They will be configured via GitHub Pages settings or .htaccess if needed
  ...(isProduction ? {} : {
    headers() {
      // Required by FHEVM (only in dev mode)
      return Promise.resolve([
        {
          source: '/',
          headers: [
            {
              key: 'Cross-Origin-Opener-Policy',
              value: 'same-origin',
            },
            {
              key: 'Cross-Origin-Embedder-Policy',
              value: 'require-corp',
            },
          ],
        },
      ]);
    }
  }),
};

export default nextConfig;

