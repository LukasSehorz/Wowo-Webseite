import type { NextConfig } from "next";

// Canonical URLs, sitemap and Open Graph fall back to localhost while the domain is unknown.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn(
    "[config] NEXT_PUBLIC_SITE_URL ist nicht gesetzt: Canonical-, Sitemap- und Open-Graph-URLs zeigen auf localhost. Siehe README, Launch-Checkliste.",
  );
}

const nextConfig: NextConfig = {
  // The route badge of `next dev` covers the mobile action bar in review screenshots. Errors still show up.
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Next.js 16 only serves the listed qualities. 90 is used for the hero poster and product cut-outs.
    qualities: [75, 90],
  },
};

export default nextConfig;
