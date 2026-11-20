import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', '172.20.10.6'],
  outputFileTracingIncludes: { "/*": ["./config/certs/*.crt"] },
};

export default nextConfig;
