import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Pending } from "@/components/ui/Pending";
import { legalNav, mainNav, orderHref, site } from "@/config/site";
import { footer, ui } from "@/content/global";
import { FooterReveal } from "./FooterReveal";

type LinkColumnProps = { id: string; title: string; items: { label: string; href: string }[] };

function LinkColumn({ id, title, items }: LinkColumnProps) {
  return (
    <div>
      <p id={id} className="eyebrow text-steel-200/70">
        {title}
      </p>
      <ul aria-labelledby={id} className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="link-quiet nav-link touch-target font-normal">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Brand-gradient panel that sits underneath the rounded end of the last sheet and is revealed
 * from beneath, followed by the navy copyright bar (spec 7.11). Five columns from 1280 px; from
 * 768 px the call to action moves into a second row; below 768 px everything stacks. The contact
 * column is wide enough for a street address and a long e-mail address (R1-05).
 */
export function Footer() {
  const { phone, email, address } = site.contact;
  const contact = [
    { label: footer.contactLabels.address, value: address },
    { label: footer.contactLabels.phone, value: phone, href: phone ? `tel:${phone.replace(/\s/g, "")}` : null },
    { label: footer.contactLabels.email, value: email, href: email ? `mailto:${email}` : null },
  ];

  return (
    <footer className="relative z-0 -mt-(--radius-sheet) overflow-clip bg-navy-900 text-white">
      <FooterReveal>
        <div
          className="rounded-b-sheet pt-[calc(var(--section-y)+var(--radius-sheet))] pb-section"
          style={{ background: "var(--brand-gradient)" }}
        >
          <Container className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[minmax(0,1.2fr)_auto_auto_minmax(220px,1fr)] md:gap-x-10 xl:grid-cols-[minmax(260px,1.2fr)_auto_auto_minmax(240px,1fr)_minmax(300px,1.1fr)] xl:gap-x-12">
            <div className="col-span-2 md:col-span-1">
              <Image
                src="/brand/logo-full-duo.png"
                alt={`${site.shortName} ${site.product}`}
                width={1854}
                height={711}
                sizes="260px"
                className="h-auto w-full max-w-[220px] lg:max-w-[260px]"
              />
              <div className="mt-8 max-w-[420px] space-y-3">
                {footer.notes.map((note) => (
                  <p key={note} className="text-xs leading-[1.55] text-steel-200/80">
                    {note}
                  </p>
                ))}
              </div>
            </div>

            <nav aria-label={ui.footerNavLabel} className="contents">
              <LinkColumn id="footer-pages" title={footer.columns.pages} items={mainNav} />
              <LinkColumn id="footer-legal" title={footer.columns.legal} items={legalNav} />
            </nav>

            <div className="col-span-2 md:col-span-1">
              <p id="footer-contact" className="eyebrow text-steel-200/70">
                {footer.columns.contact}
              </p>
              <address aria-labelledby="footer-contact" className="mt-4 not-italic">
                <p className="text-[0.9375rem] leading-snug">{site.name}</p>
                <dl className="mt-4 space-y-3.5">
                  {contact.map((entry) => (
                    <div key={entry.label}>
                      <dt className="text-[0.8125rem] leading-tight text-steel-200/70">{entry.label}</dt>
                      <dd className="mt-1 text-[0.9375rem] leading-snug [overflow-wrap:anywhere]">
                        {entry.value && entry.href ? (
                          <a href={entry.href} className="link-quiet touch-target">
                            {entry.value}
                          </a>
                        ) : (
                          <Pending value={entry.value} tone="dark" />
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </address>
            </div>

            <div className="col-span-2 border-t border-line-dark pt-8 md:col-span-4 xl:col-span-1 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-12">
              <h2 className="title-cta max-w-[360px]">{footer.cta.heading}</h2>
              <p className="mt-3 max-w-[360px] text-[0.9375rem] leading-normal text-steel-200">{footer.cta.text}</p>
              <Button href={orderHref} variant="inverse" icon="arrow-right" className="mt-7">
                {footer.cta.button}
              </Button>
            </div>
          </Container>
        </div>
      </FooterReveal>

      <Container className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between lg:py-10">
        <p className="text-sm">{footer.copyright}</p>
        <ul className="legal flex gap-5 text-steel-200">
          {legalNav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="link-quiet touch-target">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
