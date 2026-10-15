interface UserLike {
  id?: string;
  name?: string;
  email?: string;
}

interface AvatarStackProps {
  users?: UserLike[];
  max?: number;
  size?: "sm" | "md";
}

const colorPairs = [
  { bg: "bg-primary-container", text: "text-on-primary-container" },
  { bg: "bg-secondary-container", text: "text-on-secondary-fixed" },
  { bg: "bg-tertiary-fixed", text: "text-on-tertiary-fixed" },
  { bg: "bg-primary-fixed", text: "text-on-primary-fixed" },
  { bg: "bg-surface-container-high", text: "text-on-surface-variant" },
];

export const getInitials = (name?: string, fallback = "U"): string => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AvatarStack = ({
  users = [],
  max = 3,
  size = "sm",
}: AvatarStackProps) => {
  const visible = users.slice(0, max);
  const extraCount = users.length - max;

  const sizeClass =
    size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]";

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden select-none">
      {visible.map((user, index) => {
        const color = colorPairs[index % colorPairs.length];
        const initials = getInitials(user.name || user.email);

        return (
          <div
            key={user.id || user.email || index}
            title={user.name || user.email || "Collaborator"}
            className={`${sizeClass} rounded-full ${color.bg} ${color.text} ring-2 ring-surface-container-lowest flex items-center justify-center font-bold font-label-sm shrink-0`}
          >
            {initials}
          </div>
        );
      })}

      {extraCount > 0 ? (
        <div
          title={`${extraCount} more collaborators`}
          className={`${sizeClass} rounded-full bg-surface-container-high text-on-surface-variant ring-2 ring-surface-container-lowest flex items-center justify-center font-bold font-label-sm shrink-0`}
        >
          +{extraCount}
        </div>
      ) : null}
    </div>
  );
};

export default AvatarStack;
