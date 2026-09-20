import { Marquee } from "@/components/motion/Marquee";
import { announcements } from "@/content/global";

/** 48 px brand-gradient marquee above the header of the inner pages (spec 4 and 7.8). */
export function AnnouncementBar() {
  return (
    <div
      className="flex h-12 items-center text-[0.8125rem] leading-tight font-medium text-white"
      style={{ background: "var(--brand-gradient)" }}
    >
      <Marquee items={announcements} />
    </div>
  );
}
