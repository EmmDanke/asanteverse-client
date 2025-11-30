import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tag',
  imports: [],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
})
export class TagComponent {
  readonly text = input.required<string>();
  readonly color = input<string>('#6b7280'); // Default gray color
}
