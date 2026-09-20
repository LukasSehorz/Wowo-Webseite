import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { trust } from "@/content/global";

type TrustStripProps = {
  /** rounded top corners: set when the strip follows a dark band or full-bleed media */
  rounded?: boolean;
};

/** Reassurance row that closes the paper sheet on every page (spec 7.10). */
export function TrustStrip({ rounded = false }: TrustStripProps) {
  return (
    <section className={clsx("sheet sheet-paper pb-10", rounded ? "sheet-rounded pt-10 md:pt-12" : "pt-5")}>
      <Container>
        <ul className="grid lg:grid-cols-3">
          {trust.map((item, index) => (
            <li
              key={item.title}
              className={clsx(
                "flex flex-col items-center gap-3 py-7 text-center lg:flex-row lg:items-start lg:gap-4 lg:py-2 lg:pr-10 lg:text-left",
                index > 0 && "border-t border-line lg:border-t-0 lg:border-l lg:pl-10",
              )}
            >
              <Icon name={item.icon} size={24} strokeWidth={1.4} className="shrink-0 lg:mt-0.5" />
              <div>
                <h3 className="text-lg leading-tight font-medium">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-[300px] text-[0.8125rem] leading-normal text-wrap lg:mx-0 lg:max-w-none">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
