import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit } from '@angular/core';
import {
  FormInteractor,
  FormInteractorOptions,
} from '../../utils/forms/form-interactor';
import { FormWarnComponent } from '../form-warn/form-warn.component';

@Component({
  selector: 'app-star-rate',
  imports: [CommonModule, FormWarnComponent],
  templateUrl: './star-rate.component.html',
  styleUrl: './star-rate.component.scss',
})
export class StarRateComponent implements OnInit {
  readonly maxRating = input<number>(5);
  readonly interact = input.required<FormInteractorOptions<number>>();

  formInteractor!: FormInteractor<number>;

  readonly stars = computed(() => {
    const max = this.maxRating();
    const current = this.formInteractor.value();
    return Array.from({ length: max }, (_, i) => ({
      index: i + 1,
      filled: i < current,
    }));
  });

  ngOnInit(): void {
    this.formInteractor = new FormInteractor<number>(this.interact());
  }
}
