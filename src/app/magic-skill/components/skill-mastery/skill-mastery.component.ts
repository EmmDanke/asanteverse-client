import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { StarRateComponent } from '../../../shared/ui/star-rate/star-rate.component';
import {
  FormInteractor,
  FormInteractorOptions,
} from '../../../shared/utils/forms/form-interactor';
import { MagicSkill, SkillTier } from '../../models/magic-skill';
import { SkillMastery } from '../../models/skill-mastery';
import { SkillCalculatorService } from '../../services/skill-calculator.service';
import { TagComponent } from '../../../shared/ui/tag/tag.component';

@Component({
  selector: 'app-skill-mastery',
  imports: [CommonModule, StarRateComponent, TagComponent],
  templateUrl: './skill-mastery.component.html',
  styleUrl: './skill-mastery.component.scss',
})
export class SkillMasteryComponent implements OnInit {
  readonly skill = input.required<MagicSkill>();
  readonly interact = input.required<FormInteractorOptions<SkillMastery>>();
  readonly remainingSkillPoints = input.required<number>();

  formInteractor!: FormInteractor<SkillMastery>;

  private readonly skillCalculatorService = inject(SkillCalculatorService);

  readonly maxSelectableLevel = computed(() => {
    const max = this.skill().maxLevel;
    let selectable = 0;

    for (let level = 1; level <= max; level++) {
      const levelCost = this.skillCalculatorService.getCost(
        this.skill().tier,
        level
      );
      if (levelCost <= this.remainingSkillPoints()) {
        selectable = level;
      } else {
        break;
      }
    }

    return selectable;
  });

  readonly starRateInteract: Signal<FormInteractorOptions<number>> = computed(
    () => ({
      initialValue: this.formInteractor.value().level,
      toastService: this.formInteractor.toastService,
      listener: (level: number) => {
        const currentMastery = this.formInteractor.value();
        const updatedMastery: SkillMastery = {
          ...currentMastery,
          level,
        };
        this.formInteractor.setValueByUser(updatedMastery);
      },
      validator: (level: number) => {
        const cost = this.skillCalculatorService.getCost(
          this.skill().tier,
          level
        );
        if (cost > this.remainingSkillPoints()) {
          return {
            type: 'block',
            message: 'You cannot afford this level',
          };
        }

        const currentMastery = this.formInteractor.value();
        const masteryToValidate: SkillMastery = {
          ...currentMastery,
          level,
        };
        return this.formInteractor.validatorFn?.(masteryToValidate) ?? 'ok';
      },
    })
  );

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

  ngOnInit(): void {
    this.formInteractor = new FormInteractor<SkillMastery>(this.interact());
  }
}
