import { useEffect, useRef, type ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
  preventBackdropClose?: boolean;
}

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  preventBackdropClose = false,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = "modal-title";
  const descId = "modal-description";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventBackdropClose) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, preventBackdropClose, onClose]);

  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }
  }, [open]);

  if (!open) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm transition-opacity duration-150"
        aria-hidden="true"
        onClick={preventBackdropClose ? undefined : onClose}
      />

      {/* Dialog Box */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-[0_16px_48px_-8px_rgba(25,27,34,0.12)] transition-all duration-150 ease-out`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-headline-sm text-headline-sm font-semibold text-on-surface tracking-tight">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="mt-1 font-body-sm text-body-sm text-secondary">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={preventBackdropClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-secondary hover:bg-surface-container-high hover:text-on-surface outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        {children ? <div className="mt-4">{children}</div> : null}

        {/* Footer */}
        {footer ? <div className="mt-6 flex items-center justify-end gap-2.5">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
