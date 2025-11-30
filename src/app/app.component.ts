import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'asanteverse-client';
  isVisible = true;
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }
}
