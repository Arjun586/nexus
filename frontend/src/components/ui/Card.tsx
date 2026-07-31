import { forwardRef, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, interactive = false, className = "", ...props }, ref) => {
    const baseStyles =
      "rounded-lg border border-gray-200 bg-white p-5 shadow-2xs transition-all duration-150 ease-in-out";
    const interactiveStyles = interactive
      ? "hover:border-gray-300 hover:shadow-xs hover:bg-white cursor-pointer focus-within:ring-2 focus-within:ring-gray-900"
      : "";

    return (
      <div ref={ref} className={`${baseStyles} ${interactiveStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
