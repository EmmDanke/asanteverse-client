import { CommonModule } from '@angular/common';

import { Component, computed, effect, input, signal } from '@angular/core';

import { FormControl } from '@angular/forms';

import { FormWarnComponent } from '../form-warn/form-warn.component';

@Component({
  selector: 'app-star-rate',
  imports: [CommonModule, FormWarnComponent],
  templateUrl: './star-rate.component.html',
  styleUrl: './star-rate.component.scss',
})
export class StarRateComponent {
  readonly control = input.required<FormControl<number>>();

  readonly maxRating = input.required<number>();

  private readonly controlValue = signal<number>(0);

  constructor() {
    effect(() => {
      const ctrl = this.control();
      const currentValue = ctrl.value ?? 0;
      this.controlValue.set(currentValue);

      const subscription = ctrl.valueChanges.subscribe(value => {
        this.controlValue.set(value ?? 0);
      });

      // Cleanup: unsubscribe when effect re-runs or component is destroyed
      return () => {
        subscription.unsubscribe();
      };
    });
  }

  readonly stars = computed(() => {
    const max = this.maxRating();

    const current = this.controlValue();

    return Array.from({ length: max }, (_, i) => ({
      index: i + 1,

      filled: i < current,
    }));
  });

  readonly invalidMessage = computed(() => {
    const errors = this.control().errors;

    if (!errors) {
      return undefined;
    }

    const errorKeys = Object.keys(errors);
    return errors[errorKeys[0]];
  });

  setValue(value: number): void {
    this.control().setValue(value);
  }
}
