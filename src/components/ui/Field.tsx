import clsx from "clsx";
import { Icon } from "./Icon";

type FieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel";
  multiline?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  defaultValue?: string;
  /** message shown below the field; also marks the field as invalid */
  error?: string;
  onEdit?: () => void;
};

/**
 * Filled field with a floating label (spec 7.6): 62 px, 6 px radius, mist fill. The label sits
 * after the control in the DOM because the floating state is driven by a sibling selector.
 */
export function Field({
  name,
  label,
  type = "text",
  multiline = false,
  required = false,
  autoComplete,
  maxLength,
  defaultValue,
  error,
  onEdit,
}: FieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name,
    required,
    maxLength,
    autoComplete,
    defaultValue,
    placeholder: " ",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onInput: onEdit,
  };

  return (
    <div>
      <div className="relative">
        {multiline ? (
          <textarea {...shared} rows={4} className="field-input field-area" />
        ) : (
          <input {...shared} type={type} className="field-input" />
        )}
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      </div>
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

type FieldErrorProps = { id: string; className?: string; children: string };

/** Inline validation message: icon plus text, so the state never depends on colour alone. */
export function FieldError({ id, className, children }: FieldErrorProps) {
  return (
    <p id={id} className={clsx("mt-2 flex items-start gap-1.5 text-sm leading-snug text-error-700", className)}>
      <Icon name="alert" size={16} strokeWidth={1.6} className="mt-px shrink-0" />
      {children}
    </p>
  );
}
