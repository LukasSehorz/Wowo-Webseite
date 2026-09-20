import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { placeholderNotice } from "@/content/legal";

type LegalPageProps = {
  heading: string;
  children: ReactNode;
};

/** Narrow typographic page (760 px) for the legal stubs, with a clearly marked placeholder notice. */
export function LegalPage({ heading, children }: LegalPageProps) {
  return (
    <Section padded={false} className="pt-11 pb-section md:pt-16">
      <Container>
        <div className="mx-auto max-w-[760px]">
          <h1 className="h2-std hyphens-manual">{heading}</h1>
          <aside className="mt-8 rounded-stat bg-mist px-6 py-5 md:mt-10 md:px-7 md:py-6">
            <p className="eyebrow text-olive-600">{placeholderNotice.label}</p>
            <p className="mt-2 text-[0.9375rem] leading-normal">{placeholderNotice.text}</p>
          </aside>
          <div className="mt-10 md:mt-12">{children}</div>
        </div>
      </Container>
    </Section>
  );
}

type LegalListProps = { items: { label: string; value: ReactNode }[] };

/** Label and value rows separated by hairlines. */
export function LegalList({ items }: LegalListProps) {
  return (
    <dl className="border-t border-line">
      {items.map((item) => (
        <div
          key={item.label}
          className="grid gap-x-8 gap-y-1 border-b border-line py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <dt className="text-[0.9375rem] leading-normal text-slate-500">{item.label}</dt>
          <dd className="text-base leading-normal">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
