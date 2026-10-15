import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "owner" | "shared" | "danger" | "success" | "neutral";
}

export const Badge = ({
  children,
  variant = "default",
  className = "",
  ...props
}: BadgeProps) => {
  const baseStyles =
    "inline-flex items-center rounded-full px-2 py-0.5 font-code-sm text-[11px] font-medium tracking-tight shrink-0 select-none";

  const variantStyles = {
    default: "bg-surface-container-high text-on-surface-variant border border-outline-variant/50",
    owner: "bg-primary text-on-primary font-semibold shadow-xs",
    shared: "bg-primary-fixed/50 text-primary border border-primary/20 font-medium",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    danger: "bg-error-container text-on-error-container border border-error/20",
    neutral: "bg-surface-container text-secondary",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
