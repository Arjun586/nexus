import { forwardRef, type HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, interactive = false, className = "", ...props }, ref) => {
    const baseStyles =
      "bg-surface-container-lowest border border-outline-variant/60 rounded-[12px] p-5 shadow-[0_1px_3px_0_rgba(25,27,34,0.03)] transition-all duration-200 ease-out";
    const interactiveStyles = interactive
      ? "hover:border-primary-container/40 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(25,27,34,0.05)] cursor-pointer focus-within:ring-2 focus-within:ring-primary"
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
