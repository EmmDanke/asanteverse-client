import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;

  message: string;

  type: 'error' | 'success' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);

  private toastIdCounter = 0;

  readonly toasts = this._toasts.asReadonly();

  showError(message: string): void {
    this.showToast({
      id: `toast-${++this.toastIdCounter}`,

      message,

      type: 'error',
    });
  }

  showSuccess(message: string): void {
    this.showToast({
      id: `toast-${++this.toastIdCounter}`,

      message,

      type: 'success',
    });
  }

  showInfo(message: string): void {
    this.showToast({
      id: `toast-${++this.toastIdCounter}`,

      message,

      type: 'info',
    });
  }

  showWarning(message: string): void {
    this.showToast({
      id: `toast-${++this.toastIdCounter}`,

      message,

      type: 'warning',
    });
  }

  removeToast(id: string): void {
    this._toasts.update(toasts => toasts.filter(toast => toast.id !== id));
  }

  private showToast(toast: Toast): void {
    this._toasts.update(toasts => [...toasts, toast]);
  }
}
