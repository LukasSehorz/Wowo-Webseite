import { LegalList, LegalPage } from "@/components/layout/LegalPage";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { Pending } from "@/components/ui/Pending";
import { seo } from "@/content/global";
import { privacy } from "@/content/legal";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ ...seo.privacy, path: "/datenschutz", index: false });

// Muss vor dem Livegang juristisch geprüft werden (copy deck, section 4).
export default function PrivacyPage() {
  return (
    <>
      <LegalPage heading={privacy.heading}>
        <p className="body-lg">{privacy.intro}</p>
        <div className="mt-10 space-y-10">
          {privacy.sections.map((section, index) => (
            <section key={section.heading}>
              <h2 className="title-sm">
                {index + 1}. {section.heading}
              </h2>
              {section.items ? (
                <div className="mt-4">
                  <LegalList
                    items={section.items.map((item) => ({ label: item.label, value: <Pending value={item.value} /> }))}
                  />
                </div>
              ) : (
                <p className="mt-3 text-base leading-[1.6]">
                  <Pending value={section.text} />
                </p>
              )}
            </section>
          ))}
        </div>
      </LegalPage>
      <TrustStrip />
    </>
  );
}
