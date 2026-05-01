export interface ModalOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger' | 'success';
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}
