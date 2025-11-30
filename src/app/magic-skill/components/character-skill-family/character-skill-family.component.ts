import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { SkillMasteryComponent } from '../skill-mastery/skill-mastery.component';
import { MagicSkill } from '../../models/magic-skill';
import { SkillMastery } from '../../models/skill-mastery';
import { MagicSkillService } from '../../services/magic-skill.service';
import { SkillCalculatorService } from '../../services/skill-calculator.service';
import { ToastService } from '../../../shared/services/toast.service';
import {
  FormInteractor,
  FormInteractorOptions,
} from '../../../shared/utils/forms/form-interactor';

@Component({
  selector: 'app-character-skill-family',
  imports: [CommonModule, SkillMasteryComponent],
  templateUrl: './character-skill-family.component.html',
  styleUrl: './character-skill-family.component.scss',
})
export class CharacterSkillFamilyComponent implements OnInit {
  readonly idFamily = input.required<string>();
  readonly totalSkillPoints = input<number>();
  readonly toastService = input.required<ToastService>();

  private readonly magicSkillService = inject(MagicSkillService);
  private readonly skillCalculatorService = inject(SkillCalculatorService);

  readonly family = computed(() =>
    this.magicSkillService.findFamily(this.idFamily())
  );

  readonly skills = computed(() =>
    this.magicSkillService.findSkillsByFamily(this.idFamily())
  );

  readonly skillsWithInteractOptions = computed(() => {
    return this.skills()
      .map(skill => ({
        skill,
        interactOptions: this.interactOptionsCache.get(skill.id)!,
      }))
      .filter(
        (
          item
        ): item is {
          skill: MagicSkill;
          interactOptions: FormInteractorOptions<SkillMastery>;
        } => item.interactOptions !== undefined
      );
  });

  readonly availableSkillPoints = computed(
    () => this.totalSkillPoints() ?? this.skillCalculatorService.MAXIMUM_POINTS
  );

  private readonly skillInteractors = signal<
    Map<string, FormInteractor<SkillMastery>>
  >(new Map());

  private readonly interactOptionsCache = new Map<
    string,
    FormInteractorOptions<SkillMastery>
  >();

  ngOnInit(): void {
    // Initialize interactors once when component initializes
    this.initializeInteractors();
  }

  private initializeInteractors(): void {
    const skills = this.skills();
    const newInteractors = new Map<string, FormInteractor<SkillMastery>>();

    skills.forEach(skill => {
      const initialMastery: SkillMastery = {
        idSkill: skill.id,
        level: 0,
      };
      const interactor = new FormInteractor<SkillMastery>({
        initialValue: initialMastery,
        toastService: this.toastService(),
      });
      newInteractors.set(skill.id, interactor);

      // Create and cache the interact options for this skill
      // Use a stable reference that won't change
      this.interactOptionsCache.set(skill.id, {
        initialValue: initialMastery,
        toastService: this.toastService(),
        listener: value => interactor.setValueByUser(value),
      });
    });

    this.skillInteractors.set(newInteractors);
  }

  readonly totalCost = computed(() => {
    const interactors = this.skillInteractors();
    const skills = this.skills();
    let cost = 0;

    skills.forEach(skill => {
      const interactor = interactors.get(skill.id);
      if (interactor) {
        const mastery = interactor.value();
        if (mastery.level > 0) {
          cost += this.skillCalculatorService.getCost(
            skill.tier,
            mastery.level
          );
        }
      }
    });

    return cost;
  });

  readonly remainingSkillPoints = computed(
    () => this.availableSkillPoints() - this.totalCost()
  );

  readonly canAfford = computed(
    () => this.totalCost() <= this.availableSkillPoints()
  );
}
