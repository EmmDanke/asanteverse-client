import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-warn',
  imports: [CommonModule],
  templateUrl: './form-warn.component.html',
  styleUrl: './form-warn.component.scss',
})
export class FormWarnComponent {
  readonly message = input<string | undefined>(undefined);
}
