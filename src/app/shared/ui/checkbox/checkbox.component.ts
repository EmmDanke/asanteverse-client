import { Component, input, output, effect, signal } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
})
export class CheckboxComponent {
  readonly label = input<string>('');
  readonly checked = input<boolean>(false);
  readonly checkedChange = output<boolean>();
  readonly triggerBlink = input<number>(0);

  readonly isBlinking = signal<boolean>(false);

  constructor() {
    effect(() => {
      // Trigger animation whenever the counter changes
      const counter = this.triggerBlink();
      if (counter > 0) {
        this.triggerBlinkAnimation();
      }
    });
  }

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }

  private triggerBlinkAnimation(): void {
    this.isBlinking.set(true);
    setTimeout(() => {
      this.isBlinking.set(false);
    }, 600); // Animation duration
  }
}
