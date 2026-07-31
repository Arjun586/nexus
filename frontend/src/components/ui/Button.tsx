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
      "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 select-none";

    const variantStyles = {
      primary:
        "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98] focus-visible:ring-gray-900 shadow-xs",
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200 active:scale-[0.98] focus-visible:ring-gray-900",
      outline:
        "bg-transparent text-gray-900 border border-gray-300 hover:bg-gray-50 active:scale-[0.98] focus-visible:ring-gray-900",
      ghost:
        "bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:scale-[0.98] focus-visible:ring-gray-900",
      danger:
        "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500 shadow-xs",
    };

    const sizeStyles = {
      sm: "px-2.5 py-1.5 text-xs gap-1.5 min-h-[30px]",
      md: "px-3.5 py-2 text-sm gap-2 min-h-[36px]",
      lg: "px-4 py-2.5 text-sm font-semibold gap-2 min-h-[42px]",
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
