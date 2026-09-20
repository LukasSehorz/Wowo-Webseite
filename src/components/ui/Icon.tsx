import type { ReactNode } from "react";

// Thin line icons on a 24 px grid. Strokes use currentColor.

export type IconName =
  | "arrow-right"
  | "arrow-up-right"
  | "chevron-left"
  | "chevron-right"
  | "plus"
  | "minus"
  | "close"
  | "menu"
  | "pause"
  | "play"
  | "standing"
  | "calendar"
  | "bone"
  | "clipboard"
  | "flask"
  | "refresh"
  | "experience"
  | "start"
  | "teaching"
  | "pitch"
  | "insole"
  | "heat"
  | "sliders"
  | "shield"
  | "check"
  | "alert";

const paths: Record<IconName, ReactNode> = {
  "arrow-right": <path d="M4 12h16M14 6l6 6-6 6" />,
  "arrow-up-right": <path d="M7 17 17 7M8.5 7H17v8.5" />,
  "chevron-left": <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />,
  "chevron-right": <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  plus: <path d="M12 4.5v15M4.5 12h15" />,
  minus: <path d="M4.5 12h15" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M3 7h18M3 12h12M3 17h18" />,
  pause: (
    <>
      <rect x="7.25" y="6" width="3" height="12" rx="0.6" fill="currentColor" stroke="none" />
      <rect x="13.75" y="6" width="3" height="12" rx="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  play: (
    <path
      d="M9 6.2v11.6a.6.6 0 0 0 .92.5l9-5.8a.6.6 0 0 0 0-1l-9-5.8a.6.6 0 0 0-.92.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  standing: (
    <>
      <circle cx="12" cy="4.6" r="1.9" />
      <path d="M7 9.2c1.6-.8 3.3-1.2 5-1.2s3.4.4 5 1.2M12 8v7M12 15l-3 6.2M12 15l3 6.2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9.8 13.2l4.4 4.4M14.2 13.2l-4.4 4.4" />
    </>
  ),
  bone: (
    <path
      transform="rotate(-45 12 12)"
      d="M8.2 10.5h7.6a2.3 2.3 0 1 1 3.4 2 2.3 2.3 0 1 1-3.4 1H8.2a2.3 2.3 0 1 1-3.4-1 2.3 2.3 0 1 1 3.4-2Z"
    />
  ),
  clipboard: (
    <>
      <path d="M9 4.5H7.5A2.5 2.5 0 0 0 5 7v11.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V7a2.5 2.5 0 0 0-2.5-2.5H15" />
      <rect x="9" y="2.75" width="6" height="3.5" rx="1.2" />
      <path d="m9 13.6 2.2 2.2 4-4.6" />
    </>
  ),
  flask: (
    <path d="M9 3h6M10.2 3v5.8L5.5 17.3A2.45 2.45 0 0 0 7.65 21h8.7a2.45 2.45 0 0 0 2.15-3.7L13.8 8.8V3M7.6 15h8.8" />
  ),
  refresh: <path d="M20 11.2A8 8 0 0 0 5.9 6.8L4 9M4 4.2V9h4.8M4 12.8a8 8 0 0 0 14.1 4.4L20 15M20 19.8V15h-4.8" />,
  experience: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  start: <path d="M6 21V4M6 4.5h11.5l-2.4 4 2.4 4H6" />,
  teaching: (
    <path d="M12 6.6C10.2 5.3 7.8 4.6 4.5 4.6v13c3.3 0 5.7.7 7.5 2 1.8-1.3 4.2-2 7.5-2v-13c-3.3 0-5.7.7-7.5 2ZM12 6.6v13" />
  ),
  pitch: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M12 5v14" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  insole: (
    <path d="M12.2 2.8c2.9 0 4.9 2.3 4.9 5.5 0 2-.7 3.3-1 5.1-.3 1.7.3 2.8.3 4.3 0 2.1-1.6 3.5-3.9 3.5s-4-1.5-4-3.7c0-1.7.8-3.1.6-5C8.9 10.6 7.4 9.7 7.4 7.7c0-3 2-4.9 4.8-4.9Z" />
  ),
  heat: (
    <path d="M7 4c-1.6 2 1.6 3.5 0 5.5S5.4 13 7 15M12 4c-1.6 2 1.6 3.5 0 5.5s-1.6 3.5 0 5.5M17 4c-1.6 2 1.6 3.5 0 5.5s-1.6 3.5 0 5.5M4.5 19.5h15" />
  ),
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.3 2.8 8.1 7 9.8 4.2-1.7 7-5.5 7-9.8V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2 4-4.4" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.8v5M12 16.2v.2" />
    </>
  ),
};

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({ name, size = 24, strokeWidth = 1.5, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
