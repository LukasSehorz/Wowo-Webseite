import { TrustStrip } from "@/components/layout/TrustStrip";
import { Configurator } from "@/components/vouchers/Configurator";
import { Employers } from "@/components/vouchers/Employers";
import { Faq } from "@/components/vouchers/Faq";
import { Included } from "@/components/vouchers/Included";
import { Steps } from "@/components/vouchers/Steps";
import { VouchersHero } from "@/components/vouchers/VouchersHero";
import { seo } from "@/content/global";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ ...seo.vouchers, path: "/gutscheine" });

export default function VouchersPage() {
  return (
    <>
      <VouchersHero />
      <Steps />
      <Included />
      <Employers />
      <Configurator />
      <Faq />
      <TrustStrip rounded />
    </>
  );
}
