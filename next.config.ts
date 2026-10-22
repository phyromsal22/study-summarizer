import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // រំលងការត្រួតពិនិត្យ TypeScript ពេល Build
    ignoreBuildErrors: true,
  },
  eslint: {
    // រំលងការត្រួតពិនិត្យ ESLint ពេល Build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;