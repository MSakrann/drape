import type { NextConfig } from "next";

function supabaseImageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const fallback = {
    protocol: "https" as const,
    hostname: "**",
    pathname: "/storage/v1/object/public/**",
  };

  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) {
    return [fallback];
  }

  try {
    const parsed = new URL(raw);
    return [
      {
        protocol: parsed.protocol === "http:" ? "http" : "https",
        hostname: parsed.hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [fallback];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageRemotePatterns(),
  },
  async redirects() {
    return [{ source: "/lumora", destination: "/", permanent: false }];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/lumora.html" }],
    };
  },
};

export default nextConfig;
