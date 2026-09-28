import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { site } from "@/config/site";
import { seo, ui } from "@/content/global";
import { pageMetadata } from "@/lib/metadata";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: `${site.shortName} ${site.product}`,
  formatDetection: { telephone: false },
  ...pageMetadata({ ...seo.home, path: "/" }),
};

export const viewport: Viewport = {
  themeColor: "#0f2034",
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: new URL("/brand/mark.png", site.url).toString(),
  founder: site.founders.map((name) => ({ "@type": "Person", name })),
  ...(site.contact.email ? { email: site.contact.email } : {}),
  ...(site.contact.phone ? { telephone: site.contact.phone } : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-scroll-behavior: Next.js 16 keeps route changes instant although CSS scrolls anchors smoothly
    <html lang="de" className={poppins.variable} data-scroll-behavior="smooth">
      <body>
        <noscript>
          {/* Reveal start states only apply when JavaScript can animate them in. */}
          <style>{`[data-reveal],[data-split],[data-stagger]>*{opacity:1!important}[data-image-reveal]>:first-child{transform:none!important}[data-chart] *{transform:none!important;opacity:1!important;clip-path:none!important}`}</style>
        </noscript>
        <a
          href="#inhalt"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[60] focus-visible:rounded-full focus-visible:bg-ink focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:text-white"
        >
          {ui.skipLink}
        </a>
        <MotionProvider>
          <Header />
          <main id="inhalt" className="relative z-10 overflow-clip rounded-b-sheet bg-paper">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
