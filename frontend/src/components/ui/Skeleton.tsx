import type { HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) => {
  const variantClasses = {
    text: "h-3.5 w-full rounded-xs",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      role="status"
      aria-label="Loading..."
      className={`animate-pulse bg-gray-200 opacity-70 ${variantClasses[variant]} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;
