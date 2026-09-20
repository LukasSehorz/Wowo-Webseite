import { Audiences } from "@/components/home/Audiences";
import { Facts } from "@/components/home/Facts";
import { FittingProcess } from "@/components/home/FittingProcess";
import { FoundersTeaser } from "@/components/home/FoundersTeaser";
import { Hero } from "@/components/home/Hero";
import { IntroSplit } from "@/components/home/IntroSplit";
import { PressureMap } from "@/components/home/PressureMap";
import { Studies } from "@/components/home/Studies";
import { Technology } from "@/components/home/Technology";
import { TrustStrip } from "@/components/layout/TrustStrip";
import { VoucherTeaser } from "@/components/home/VoucherTeaser";

// The order of the sections is the argument of the page (BRIEF 1, narrative thread).
export default function HomePage() {
  return (
    <>
      <Hero />
      <IntroSplit />
      <Facts />
      <Audiences />
      <PressureMap />
      <Technology />
      <FittingProcess />
      <Studies />
      <VoucherTeaser />
      <FoundersTeaser />
      <TrustStrip />
    </>
  );
}
