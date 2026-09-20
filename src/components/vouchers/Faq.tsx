import { SplitHeading } from "@/components/motion/SplitHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Pending } from "@/components/ui/Pending";
import { site } from "@/config/site";
import { faq, faqHeading } from "@/content/faq";
import { contact } from "@/content/vouchers";

/**
 * The dark band of the page (the reference's FAQ section on the product page): bordered
 * accordion card left, the personal contact block right, which stays in view on wide screens.
 */
export function Faq() {
  const { phone, email } = site.contact;

  return (
    <Section id="fragen" tone="navy" rounded labelledBy="faq-heading">
      <Container>
        <SplitHeading id="faq-heading" lines={[faqHeading]} className="h2-std" />

        <div className="mt-8 grid items-start gap-x-16 gap-y-12 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="rounded-panel border border-line-dark px-5 py-2 md:px-12 md:py-6">
            <Accordion
              tone="dark"
              flush
              items={faq.map((item, index) => ({
                id: `faq-${index + 1}`,
                question: item.question,
                answer: item.answer,
              }))}
            />
          </div>

          <div className="lg:sticky lg:top-[105px]">
            <h2 className="h3-std">{contact.heading}</h2>
            <p className="mt-4 text-base leading-[1.6] text-steel-200">{contact.text}</p>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="eyebrow text-steel-200/70">{contact.phoneLabel}</dt>
                <dd className="mt-1.5 text-[1.375rem] leading-tight font-medium md:text-2xl">
                  {phone ? (
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="link-quiet touch-target">
                      {phone}
                    </a>
                  ) : (
                    <Pending tone="dark" />
                  )}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-steel-200/70">{contact.emailLabel}</dt>
                <dd className="mt-1.5 text-[1.375rem] leading-tight font-medium break-words md:text-2xl">
                  {email ? (
                    <a href={`mailto:${email}`} className="link-quiet touch-target">
                      {email}
                    </a>
                  ) : (
                    <Pending tone="dark" />
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>
    </Section>
  );
}
