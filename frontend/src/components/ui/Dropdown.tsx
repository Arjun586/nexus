import { useEffect, useRef, useState, type ReactNode } from "react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export const Dropdown = ({ trigger, items, align = "right" }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setOpen((prev) => !prev)} className="inline-flex cursor-pointer">
        {trigger}
      </div>

      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`absolute z-50 mt-1 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg transition-all duration-150 ease-out ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item) => (
            <button
              key={item.id}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
            >
              {item.icon ? <span className="h-4 w-4 shrink-0">{item.icon}</span> : null}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Dropdown;
