import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../shared/services/toast.service';
import { SkillMastery } from '../../models/skill-mastery';
import { MagicSkillService } from '../../services/magic-skill.service';
import {
  SkillMasteryComponent,
  SkillMasteryForm,
} from '../skill-mastery/skill-mastery.component';

export interface FamilyMastery {
  idFamily: string;
  skills: { [idSkill: string]: SkillMastery };
}

export interface FamilyMasteryForm {
  [idSkill: string]: FormGroup<{
    idSkill: FormControl<string>;
    level: FormControl<number>;
  }>;
}

@Component({
  selector: 'app-character-skill-family',
  imports: [CommonModule, SkillMasteryComponent, ReactiveFormsModule],
  templateUrl: './character-skill-family.component.html',
  styleUrl: './character-skill-family.component.scss',
})
export class CharacterSkillFamilyComponent {
  static createFormGroup(
    initialValue?: Partial<FamilyMastery>
  ): FormGroup<FamilyMasteryForm> {
    const controls: {
      [idSkill: string]: FormGroup<SkillMasteryForm>;
    } = {};

    Object.entries(initialValue?.skills ?? {}).forEach(([idSkill, mastery]) => {
      controls[idSkill] = SkillMasteryComponent.createFormGroup(mastery);
    });

    return new FormGroup(controls);
  }

  readonly idFamily = input.required<string>();
  readonly familyFormGroup = input.required<FormGroup<FamilyMasteryForm>>();
  readonly totalSkillPoints = input<number>();
  readonly toastService = input.required<ToastService>();

  private readonly magicSkillService = inject(MagicSkillService);

  readonly family = computed(() =>
    this.magicSkillService.findFamily(this.idFamily())
  );

  readonly skills = computed(() =>
    this.magicSkillService.findSkillsByFamily(this.idFamily())
  );

  readonly skillsWithFormGroups = computed(() => {
    const skills = this.skills();
    const familyFormGroup = this.familyFormGroup();

    return skills.map(skill => {
      let formGroup = familyFormGroup.controls[skill.id];

      // Create form group if it doesn't exist
      if (!formGroup) {
        formGroup = SkillMasteryComponent.createFormGroup({
          idSkill: skill.id,
          level: 0,
        });
        familyFormGroup.addControl(skill.id, formGroup);
      }

      return { formGroup, skill };
    });
  });
}
