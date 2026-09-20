import { AboutHero } from "@/components/about/AboutHero";
import { AboutStats } from "@/components/about/AboutStats";
import { ClosingBand } from "@/components/about/ClosingBand";
import { Principles } from "@/components/about/Principles";
import { Profiles } from "@/components/about/Profiles";
import { Story } from "@/components/about/Story";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { seo } from "@/content/global";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ ...seo.about, path: "/ueber-uns" });

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStats />
      <Story />
      <Profiles />
      <Principles />
      <ClosingBand />
      <TrustStrip rounded />
    </>
  );
}
