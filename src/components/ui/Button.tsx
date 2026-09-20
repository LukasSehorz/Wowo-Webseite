"use client";

import clsx from "clsx";
import { useRef, type MouseEventHandler, type ReactNode } from "react";
import { AnchorLink } from "./AnchorLink";
import { ui } from "@/content/global";
import { FINE_POINTER, MOTION_OK, gsap } from "@/lib/gsap";
import { Icon, type IconName } from "./Icon";

export type ButtonVariant = "solid" | "glass" | "outline" | "inverse" | "olive";

type CommonProps = {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  /** icon after the label, 20 px with a 1.6 px stroke as in the reference */
  icon?: IconName;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  type?: never;
  disabled?: never;
};
type NativeProps = CommonProps & {
  href?: undefined;
  external?: never;
  type?: "button" | "submit";
  /** id of the form a submit button belongs to when it sits outside of it */
  form?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  solid: "btn-solid",
  glass: "btn-glass",
  outline: "btn-outline",
  inverse: "btn-inverse",
  olive: "btn-olive",
};

const canAnimate = () =>
  typeof window !== "undefined" && window.matchMedia(FINE_POINTER).matches && window.matchMedia(MOTION_OK).matches;

/**
 * Pill button with the liquid fill of the reference: an ellipse rises from below on
 * enter and leaves through the top (600 ms). Pointer-fine devices only.
 */
export function Button(props: LinkProps | NativeProps) {
  const { variant = "solid", size = "md", icon, fullWidth, className, children } = props;
  const fill = useRef<HTMLSpanElement>(null);
  const leaving = useRef(false);

  const onEnter = () => {
    if (!fill.current || !canAnimate()) return;
    // `y: 0` cancels the pixel offset GSAP reads from the CSS start transform.
    // A quick re-entry reverses the leaving fill instead of restarting it from below.
    if (leaving.current) {
      gsap.to(fill.current, { yPercent: 0, y: 0, duration: 0.6, ease: "fill", overwrite: true });
    } else {
      gsap.fromTo(
        fill.current,
        { yPercent: 76, y: 0 },
        { yPercent: 0, y: 0, duration: 0.6, ease: "fill", overwrite: true },
      );
    }
    leaving.current = false;
  };

  const onLeave = () => {
    if (!fill.current || !canAnimate()) return;
    leaving.current = true;
    gsap.to(fill.current, {
      yPercent: -76,
      y: 0,
      duration: 0.6,
      ease: "fill",
      overwrite: true,
      onComplete: () => {
        leaving.current = false;
      },
    });
  };

  const classes = clsx("btn", variantClass[variant], size === "sm" && "btn-sm", fullWidth && "w-full", className);

  const content = (
    <>
      <span ref={fill} className="btn-fill" aria-hidden="true" />
      <span>
        {children}
        {props.href !== undefined && props.external ? <span className="sr-only"> ({ui.externalHint})</span> : null}
      </span>
      {icon ? <Icon name={icon} size={20} strokeWidth={1.6} className="shrink-0" /> : null}
    </>
  );

  if (props.href !== undefined) {
    if (props.external) {
      return (
        <a
          href={props.href}
          target="_blank"
          rel="noopener"
          className={classes}
          onClick={props.onClick}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
        >
          {content}
        </a>
      );
    }
    return (
      <AnchorLink
        href={props.href}
        className={classes}
        onClick={props.onClick}
        onPointerEnter={onEnter}
        onPointerLeave={onLeave}
      >
        {content}
      </AnchorLink>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      form={props.form}
      onClick={props.onClick}
      disabled={props.disabled}
      className={classes}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {content}
    </button>
  );
}
