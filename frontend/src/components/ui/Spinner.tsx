import type { HTMLAttributes } from "react";

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md" | "lg";
}

export const Spinner = ({ size = "md", className = "", ...props }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-3.5 w-3.5 border-2",
    md: "h-4 w-4 border-2",
    lg: "h-6 w-6 border-2",
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent text-current opacity-80 ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
};

export default Spinner;
