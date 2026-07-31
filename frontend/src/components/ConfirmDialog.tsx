import Button from "./ui/Button";
import Modal from "./ui/Modal";
import Toast from "./ui/Toast";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  isLoading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      preventBackdropClose={isLoading}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error ? <Toast variant="error" message={error} className="mt-2" /> : null}
    </Modal>
  );
};

export default ConfirmDialog;
