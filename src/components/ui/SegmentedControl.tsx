"use client";

import clsx from "clsx";

type SegmentedControlProps = {
  /** radio group name, unique on the page */
  name: string;
  legend: string;
  options: [string, string];
  value: 0 | 1;
  onChange: (value: 0 | 1) => void;
  className?: string;
};

/**
 * Two-way switch in the pattern of the pressure map's control, for light surfaces: a pill track
 * with an ink thumb that slides in 500 ms. Native radios keep arrow-key use and the checked state.
 */
export function SegmentedControl({ name, legend, options, value, onChange, className }: SegmentedControlProps) {
  return (
    <fieldset className={clsx("relative grid grid-cols-2 rounded-full bg-white p-1", className)}>
      <legend className="sr-only">{legend}</legend>
      <span
        aria-hidden="true"
        className={clsx(
          "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-ink transition-transform duration-500 ease-ui",
          value === 1 && "translate-x-full",
        )}
      />
      {options.map((label, index) => (
        <label
          key={label}
          className={clsx(
            "relative flex min-h-11 cursor-pointer items-center justify-center rounded-full px-2 text-center text-[0.8125rem] leading-tight font-medium transition-colors duration-500 ease-ui has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel-400 sm:px-3 sm:text-sm",
            value === index ? "text-white" : "text-ink",
          )}
        >
          <input
            type="radio"
            name={name}
            value={index}
            checked={value === index}
            onChange={() => onChange(index as 0 | 1)}
            className="sr-only"
          />
          {label}
        </label>
      ))}
    </fieldset>
  );
}
