import type { MetadataRoute } from "next";
import { mainNav, site } from "@/config/site";

// Only the content pages: the legal pages are set to noindex and therefore not submitted.
export default function sitemap(): MetadataRoute.Sitemap {
  return mainNav.map((page) => ({
    url: new URL(page.href, site.url).toString(),
    changeFrequency: "monthly",
    priority: page.href === "/" ? 1 : 0.8,
  }));
}
