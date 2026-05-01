import React from "react";
import { createRoot } from "react-dom/client";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import type { ModalOptions } from "../types";

class ModalService {
  /**
   * Shows a confirmation modal imperatively.
   * @param options Modal configuration
   * @returns a Promise that resolves to true if confirmed, false if cancelled.
   */
  show(options: ModalOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      // 1. Create a container element
      const container = document.createElement("div");
      container.id = "confirm-modal-root";
      document.body.appendChild(container);

      // 2. Create a React Root
      const root = createRoot(container);

      let isProcessing = false;

      // 3. Define cleanup function
      const cleanup = () => {
        root.unmount();
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      };

      // 4. Render function to handle updates (like isProcessing)
      const renderUI = () => {
        root.render(
          <React.StrictMode>
            <ConfirmModal
              isOpen={true}
              options={options}
              isProcessing={isProcessing}
              onConfirm={async () => {
                if (options.onConfirm) {
                  isProcessing = true;
                  renderUI(); // Re-render with isProcessing = true
                  try {
                    await options.onConfirm();
                    cleanup();
                    resolve(true);
                  } catch (error) {
                    isProcessing = false;
                    renderUI(); // Re-render with isProcessing = false
                    console.error("Modal action failed:", error);
                  }
                } else {
                  cleanup();
                  resolve(true);
                }
              }}
              onCancel={() => {
                if (isProcessing) return;
                if (options.onCancel) {
                  options.onCancel();
                }
                cleanup();
                resolve(false);
              }}
            />
          </React.StrictMode>
        );
      };

      // 5. Initial render
      renderUI();
    });
  }

  // Convenience methods
  danger(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Xác nhận",
      type: "danger",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }

  warning(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Cảnh báo",
      type: "warning",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }

  confirm(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Xác nhận",
      type: "info",
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  }

  info(message: string, title?: string): Promise<boolean> {
    return this.show({
      message,
      title: title || "Thông báo",
      type: "info",
      confirmText: "Đóng",
      cancelText: "",
    });
  }
}

export const modalService = new ModalService();
