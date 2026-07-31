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
    "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium tracking-tight shrink-0 select-none";

  const variantStyles = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    owner: "bg-gray-900 text-white font-semibold",
    shared: "bg-blue-50 text-blue-700 border border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    neutral: "bg-gray-200 text-gray-600",
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
