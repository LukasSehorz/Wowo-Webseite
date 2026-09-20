import { LegalList, LegalPage } from "@/components/layout/LegalPage";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { Pending } from "@/components/ui/Pending";
import { seo } from "@/content/global";
import { imprint } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ ...seo.imprint, path: "/impressum", index: false });

export default function ImprintPage() {
  return (
    <>
      <LegalPage heading={imprint.heading}>
        <h2 className="title-sm mb-5">{imprint.basis}</h2>
        <LegalList
          items={imprint.items.map((item) => ({ label: item.label, value: <Pending value={item.value} /> }))}
        />
      </LegalPage>
      <TrustStrip />
    </>
  );
}
