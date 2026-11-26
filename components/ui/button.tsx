import type { ButtonHTMLAttributes } from "react";

/*
 * Button / Standard. Figma: "Test Agent (DS)", node 369:73.
 * Hover, Pressed and Focus are CSS states (:hover, :active, :focus-visible),
 * so only Type, Size, Disabled and Loading are props.
 */

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows the spinner beside the label and blocks clicks. */
  loading?: boolean;
};

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg whitespace-nowrap " +
  "transition-colors outline-none select-none " +
  "focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-0";

// Small 28 / Medium 36 / Large 44. Padding Spacing/3, 4, 5.
const sizes: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-caption font-medium",
  md: "h-9 px-4 text-body-sm font-medium",
  lg: "h-11 px-5 text-body-md font-medium",
};

const spinnerSizes: Record<ButtonSize, string> = {
  sm: "size-3",
  md: "size-4",
  lg: "size-5",
};

// Default + Loading appearance.
const variants: Record<ButtonVariant, string> = {
  primary: "bg-action-primary text-inverse",
  secondary: "border border-default bg-action-secondary text-brand-600",
  tertiary: "text-brand-600",
  danger: "bg-action-danger text-inverse",
};

// Hover + Pressed. Left off while loading or disabled.
const interactive: Record<ButtonVariant, string> = {
  primary: "cursor-pointer hover:bg-action-primary-hover active:bg-action-primary-pressed",
  secondary: "cursor-pointer hover:bg-action-secondary-hover active:bg-action-secondary-pressed",
  tertiary: "cursor-pointer hover:bg-neutral-100 active:bg-brand-100",
  danger: "cursor-pointer hover:bg-action-danger-hover active:bg-action-danger-pressed",
};

const disabledStyles: Record<ButtonVariant, string> = {
  primary: "bg-action-primary-disabled text-disabled",
  secondary: "border border-default bg-disabled text-disabled",
  tertiary: "text-disabled",
  danger: "bg-status-error-bg text-disabled",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  const look = disabled
    ? `${disabledStyles[variant]} cursor-not-allowed`
    : loading
      ? `${variants[variant]} cursor-progress`
      : `${variants[variant]} ${interactive[variant]}`;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[base, sizes[size], look, className].filter(Boolean).join(" ")}
      {...props}
    >
      {loading && !disabled && <Spinner className={spinnerSizes[size]} />}
      {children}
    </button>
  );
}

// Icon / Loading spinner, exported from Figma. Uses the label color.
function Spinner({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 motion-safe:animate-spin ${className}`}
    >
      <path
        d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C4.134 15 1 11.866 1 8C1 6.4 1.54 4.93 2.45 3.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
