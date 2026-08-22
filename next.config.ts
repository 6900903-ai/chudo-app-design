import type { NextConfig } from "next";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const onGitHubPages =
  process.env.GITHUB_ACTIONS === "true" && repoName.length > 0;

const basePath = onGitHubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,

  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),

  images: {
    unoptimized: true,
  },

  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
