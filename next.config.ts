import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/trade" : "";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
