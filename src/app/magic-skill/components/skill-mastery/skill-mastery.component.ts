import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StarRateComponent } from '../../../shared/ui/star-rate/star-rate.component';
import { TagComponent } from '../../../shared/ui/tag/tag.component';
import { MagicSkill, SkillTier } from '../../models/magic-skill';
import { SkillMastery } from '../../models/skill-mastery';

export interface SkillMasteryForm {
  idSkill: FormControl<string>;
  level: FormControl<number>;
}

@Component({
  selector: 'app-skill-mastery',
  imports: [CommonModule, StarRateComponent, TagComponent, ReactiveFormsModule],
  templateUrl: './skill-mastery.component.html',
  styleUrl: './skill-mastery.component.scss',
})
export class SkillMasteryComponent {
  static createFormGroup(
    initialValue?: Partial<SkillMastery>
  ): FormGroup<SkillMasteryForm> {
    return new FormGroup({
      idSkill: new FormControl<string>(initialValue?.idSkill ?? '', {
        nonNullable: true,
      }),
      level: new FormControl<number>(initialValue?.level ?? 0, {
        nonNullable: true,
      }),
    });
  }

  readonly skill = input.required<MagicSkill>();
  readonly control = input.required<FormControl<number>>();

  readonly tierText = computed(() => {
    const tier = this.skill().tier;
    switch (tier) {
      case SkillTier.Accessible:
        return 'Accessible';
      case SkillTier.Training1Year:
        return '1 Year';
      case SkillTier.Training10Years:
        return '10 Years';
      case SkillTier.Rare:
        return 'Rare';
      default:
        return tier;
    }
  });

  readonly tierColor = computed(() => {
    const tier = this.skill().tier;
    switch (tier) {
      case SkillTier.Accessible:
        return '#10b981'; // Green
      case SkillTier.Training1Year:
        return '#f59e0b'; // Amber
      case SkillTier.Training10Years:
        return '#ef4444'; // Red
      case SkillTier.Rare:
        return '#8b5cf6'; // Purple
      default:
        return '#6b7280'; // Gray
    }
  });
}
