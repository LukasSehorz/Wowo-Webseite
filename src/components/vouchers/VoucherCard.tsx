import Image from "next/image";
import type { CSSProperties } from "react";
import { vouchers } from "@/config/vouchers";

const runnerMask: CSSProperties = {
  maskImage: "url(/brand/mark-white.png)",
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskImage: "url(/brand/mark-white.png)",
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
};

/**
 * The voucher, built in HTML and CSS (never an image): a navy face with a soft diagonal light,
 * a 1 px edge and an inset highlight so it separates from the gradient panel behind it, the duo
 * runner mark, a fine olive hairline frame and the runner once more as an embossed watermark.
 * All sizes are container units, so the card keeps its proportions at every width (1.586:1).
 */
export function VoucherCard() {
  const { card } = vouchers;

  return (
    <div className="@container relative aspect-[1.586] overflow-hidden rounded-[inherit] border border-white/10 bg-[linear-gradient(135deg,#1b334b_0%,#0f2034_62%)] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]">
      {/* embossed watermark: light edge, dark edge, then the face colour on top */}
      <div aria-hidden="true" className="absolute top-[-8%] right-[-9%] h-[116%] w-[62%]">
        <div className="absolute inset-0 -translate-x-px -translate-y-px bg-white/12" style={runnerMask} />
        <div className="absolute inset-0 translate-x-px translate-y-px bg-ink/70" style={runnerMask} />
        <div className="absolute inset-0 bg-[#122841]" style={runnerMask} />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-[3.2cqw] rounded-[calc(var(--radius-card)-1.2cqw)] border border-olive-300/35"
      />

      <div className="relative flex h-full flex-col justify-between p-[7cqw]">
        <div className="flex items-center gap-[2.6cqw]">
          <Image src="/brand/mark-duo.png" alt="" width={64} height={64} className="h-auto w-[9cqw]" />
          <p className="text-[2.5cqw] leading-[1.35] font-semibold tracking-[0.08em] uppercase">{card.issuer}</p>
        </div>

        <div>
          {/* display voice: weight 800 while the title is smaller than 40 px */}
          <p className="display text-[11.5cqw] [--display-tracking:-0.03em] @max-[348px]:[--display-weight:800]">
            {card.title}
          </p>
          <p className="mt-[2cqw] text-[3.1cqw] leading-tight text-steel-200">{card.scope}</p>
        </div>

        <p className="flex items-baseline gap-[2cqw] text-[2.9cqw] leading-none">
          <span className="tracking-[0.12em] text-steel-200/80 uppercase">{card.codeLabel}</span>
          <span className="font-medium tracking-[0.08em] text-olive-300 tabular-nums">{card.code}</span>
        </p>
      </div>
    </div>
  );
}
