interface NexusMarkProps {
  className?: string;
  size?: number;
  variant?: "triad" | "sidebar";
}

export const NexusMark = ({
  className = "",
  size = 36,
  variant = "triad",
}: NexusMarkProps) => {
  if (variant === "sidebar") {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle className="fill-primary/20" cx="6" cy="6" r="2.5" />
        <circle className="fill-primary/20" cx="18" cy="6" r="2.5" />
        <circle className="fill-primary" cx="12" cy="18" r="2.5" />
        <path d="M8 7.5L10.5 16M16 7.5L13.5 16M8.5 6h7" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Triad connectivity hairlines */}
      <line
        x1="22"
        y1="8"
        x2="9"
        y2="31"
        stroke="var(--color-primary-container, #315fe9)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="22"
        y1="8"
        x2="35"
        y2="31"
        stroke="var(--color-primary-container, #315fe9)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="9"
        y1="31"
        x2="35"
        y2="31"
        stroke="var(--color-primary-container, #315fe9)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Centroid intersection lines */}
      <line
        x1="22"
        y1="8"
        x2="22"
        y2="23.3"
        stroke="var(--color-outline-variant, #c4c5d7)"
        strokeWidth="1"
      />
      <line
        x1="9"
        y1="31"
        x2="22"
        y2="23.3"
        stroke="var(--color-outline-variant, #c4c5d7)"
        strokeWidth="1"
      />
      <line
        x1="35"
        y1="31"
        x2="22"
        y2="23.3"
        stroke="var(--color-outline-variant, #c4c5d7)"
        strokeWidth="1"
      />

      {/* Node vertices */}
      <circle cx="22" cy="8" r="4.25" fill="var(--color-primary-container, #315fe9)" />
      <circle cx="22" cy="8" r="1.75" fill="var(--color-surface, #faf8ff)" />
      <circle
        cx="9"
        cy="31"
        r="3.75"
        fill="var(--color-surface, #faf8ff)"
        stroke="var(--color-primary-container, #315fe9)"
        strokeWidth="1.5"
      />
      <circle
        cx="35"
        cy="31"
        r="3.75"
        fill="var(--color-surface, #faf8ff)"
        stroke="var(--color-primary-container, #315fe9)"
        strokeWidth="1.5"
      />
      <circle cx="22" cy="23.3" r="2.25" fill="var(--color-primary-container, #315fe9)" />
    </svg>
  );
};

export default NexusMark;
