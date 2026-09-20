import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { AnchorLink } from "@/components/ui/AnchorLink";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { intro } from "@/content/home";

/** First sheet: 50/50 split with the fitting photo and the centred product stack (home #2 of the reference). */
export function IntroSplit() {
  return (
    <Section rounded labelledBy="intro-heading">
      <Container className="grid items-center gap-x-5 gap-y-10 lg:grid-cols-2 lg:items-stretch">
        {/* the photo is at least 4:3 (spacer) and grows to the height of the text stack beside it */}
        <ImageReveal className="rounded-photo lg:h-full">
          <Image
            src={intro.image.src}
            alt={intro.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div aria-hidden="true" className="aspect-4/3 w-full" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-navy-900/70 to-transparent"
          />
          <p className="absolute bottom-6 left-6 text-white md:bottom-9 md:left-10">
            <span className="block text-[1.375rem] leading-[1.1] font-semibold tracking-[-0.03em] md:text-[2rem]">
              {intro.caption[0]}
            </span>
            <span className="mt-1.5 block text-sm leading-snug md:text-[0.9375rem]">{intro.caption[1]}</span>
          </p>
        </ImageReveal>

        <div className="flex flex-col items-center justify-center text-center">
          <SplitHeading id="intro-heading" lines={intro.headline} className="display display-h2-column max-w-[640px]" />
          <Reveal className="mt-5 w-full">
            {/* The PNG has generous transparent margins: the frame crops them to the insole. */}
            <AnchorLink
              href={intro.link.href}
              tabIndex={-1}
              className="relative mx-auto block aspect-[1859/470] w-full max-w-[662px]"
            >
              <Image
                src={intro.product.src}
                alt={intro.product.alt}
                fill
                quality={90}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className="object-cover object-[50%_56%] transition-transform duration-500 ease-ui hover:scale-[1.02]"
              />
            </AnchorLink>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="lead mt-4 max-w-[600px] text-left md:text-center">{intro.text}</p>
          </Reveal>
          <ArrowLink href={intro.link.href} className="mt-6 md:mt-7">
            {intro.link.label}
          </ArrowLink>
        </div>
      </Container>
    </Section>
  );
}
