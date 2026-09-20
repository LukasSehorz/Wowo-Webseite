import type { Metadata } from "next";
import { site } from "@/config/site";

type PageMetadataInput = {
  title: string;
  description?: string;
  /** route path, e.g. "/ueber-uns" */
  path: string;
  /** legal pages stay out of the index */
  index?: boolean;
};

const siteName = `${site.shortName} ${site.product}`;

/** Title, description, canonical URL and matching Open Graph data for one page. */
export function pageMetadata({ title, description, path, index = true }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: site.locale, siteName, title, description, url: path },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
