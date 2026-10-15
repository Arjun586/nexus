import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import Spinner from "./Spinner";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-label-md font-medium transition-all duration-150 ease-in-out rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 select-none";

    const variantStyles = {
      primary:
        "bg-primary text-on-primary hover:bg-primary-container active:bg-on-primary-fixed-variant active:scale-[0.98] shadow-sm",
      secondary:
        "bg-surface-container-low text-on-surface hover:bg-surface-container border border-outline-variant/60 active:scale-[0.98]",
      outline:
        "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low active:scale-[0.98]",
      ghost:
        "bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high active:scale-[0.98]",
      danger:
        "bg-error text-on-error hover:bg-on-error-container active:scale-[0.98] shadow-sm",
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-label-sm gap-1.5 min-h-[30px]",
      md: "px-4 py-2 text-label-md gap-2 min-h-[38px]",
      lg: "px-5 py-2.5 text-label-md font-semibold gap-2.5 min-h-[44px]",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? <Spinner size={size === "lg" ? "md" : "sm"} /> : leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon ? rightIcon : null}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
