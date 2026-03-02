import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  ...(isGitHubPages && {
    output: "export",
    basePath: "/portfolio",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
