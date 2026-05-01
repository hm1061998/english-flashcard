import React from "react";
import { createRoot, type Root } from "react-dom/client";
import ToastItem, { type ToastType } from "../components/ToastItem";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

class ToastService {
  private container: HTMLDivElement | null = null;
  private root: Root | null = null;
  private toasts: Toast[] = [];
  private nextId = 1;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-service-container";
      document.body.appendChild(this.container);

      // Basic container styles
      Object.assign(this.container.style, {
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: "9999",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      });

      this.root = createRoot(this.container);
    }
  }

  private render() {
    if (!this.root) return;

    this.root.render(
      <React.StrictMode>
        {this.toasts.map((t) => (
          <ToastItem
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => this.remove(t.id)}
          />
        ))}
      </React.StrictMode>,
    );
  }

  private remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.render();
  }

  show(message: string, type: ToastType = "info") {
    this.ensureContainer();
    const id = this.nextId++;
    this.toasts.push({ id, message, type });
    this.render();
  }

  success(message: string) {
    this.show(message, "success");
  }
  error(message: string) {
    this.show(message, "error");
  }
  info(message: string) {
    this.show(message, "info");
  }
  warning(message: string) {
    this.show(message, "warning");
  }
}

export const toastService = new ToastService();
