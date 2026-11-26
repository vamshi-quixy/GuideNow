import { useId, type InputHTMLAttributes } from "react";

/*
 * Input Field / Text. Figma: "Test Agent (DS)", component set 414:647.
 * Hover, Focused and Filled are CSS states (:hover, :focus, having a value),
 * so only Error, Success, Disabled and Read-only are driven by props.
 */

export type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label: string;
  /** Hint under the field. Replaced by `error` or `success` when those are set. */
  helperText?: string;
  /** Error message. Shows the error style and marks the input invalid. */
  error?: string;
  /** Success message. Shows the success style. Ignored when `error` is set. */
  success?: string;
  /** Classes for the outer wrapper (label + input + message). */
  className?: string;
};

const inputBase =
  "h-10 w-full min-w-0 rounded-lg border px-3 text-body-sm transition-colors " +
  "placeholder:text-tertiary " +
  // Focused: 2px border drawn inside, so the text doesn't move.
  "focus:outline-solid focus:outline-2 focus:-outline-offset-2";

const inputStates = {
  default:
    "bg-surface border-default text-primary hover:border-hover focus:border-focus focus:outline-focus-ring",
  error: "bg-surface border-error text-primary focus:outline-error-500",
  success: "bg-surface border-success text-primary focus:outline-focus-ring",
  disabled:
    "bg-disabled border-disabled text-disabled placeholder:text-disabled cursor-not-allowed",
  readOnly: "bg-surface-secondary border-disabled text-secondary focus:outline-focus-ring",
};

export function InputField({
  label,
  helperText,
  error,
  success,
  required,
  disabled,
  readOnly,
  id,
  className,
  "aria-describedby": describedBy,
  ...props
}: InputFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  const state = disabled
    ? "disabled"
    : readOnly
      ? "readOnly"
      : error
        ? "error"
        : success
          ? "success"
          : "default";

  const message = error || success || helperText;
  const messageColor = error
    ? "text-error"
    : success
      ? "text-success"
      : disabled
        ? "text-disabled"
        : "text-tertiary";

  return (
    <div className={["flex w-full flex-col gap-1.5", className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId} className="flex gap-0.5 text-caption text-primary">
        {label}
        {required && (
          <span aria-hidden="true" className="text-error">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={error ? true : undefined}
        aria-describedby={[message && messageId, describedBy].filter(Boolean).join(" ") || undefined}
        className={`${inputBase} ${inputStates[state]}`}
        {...props}
      />
      {message && (
        <p id={messageId} className={`text-caption ${messageColor}`}>
          {message}
        </p>
      )}
    </div>
  );
}
