import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", disabled, ...props }, ref) => {
    const inputId = id || props.name;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperId = inputId ? `${inputId}-helper` : undefined;

    const describedBy =
      [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(" ") ||
      undefined;

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="mb-1.5 block font-label-md text-label-md font-medium text-on-surface"
          >
            {label}
          </label>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full h-11 rounded-lg bg-surface-container-lowest px-3.5 text-on-surface font-body-sm text-body-sm placeholder:text-outline-variant outline outline-1 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface-container-lowest disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:opacity-60 ${
            error
              ? "outline-error ring-1 ring-error"
              : "outline-surface-container-highest focus:outline-primary"
          } ${className}`}
          {...props}
        />

        {error ? (
          <p id={errorId} className="mt-1 font-body-sm text-xs font-medium text-error" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 font-body-sm text-xs text-secondary">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
