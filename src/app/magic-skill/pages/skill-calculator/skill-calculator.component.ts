import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import {
  CharacterSkillFamilyComponent,
  FamilyMasteryForm,
} from '../../components/character-skill-family/character-skill-family.component';
import {
  SkillMasteryComponent,
  SkillMasteryForm,
} from '../../components/skill-mastery/skill-mastery.component';
import { MagicSkill, SkillTier } from '../../models/magic-skill';
import { MagicSkillService } from '../../services/magic-skill.service';

export interface AllFamiliesForm {
  [idFamily: string]: FormGroup<FamilyMasteryForm>;
}

@Component({
  selector: 'app-skill-calculator',
  imports: [CommonModule, CharacterSkillFamilyComponent, ReactiveFormsModule],
  templateUrl: './skill-calculator.component.html',
  styleUrl: './skill-calculator.component.scss',
})
export class SkillCalculatorComponent implements OnDestroy {
  readonly magicSkillService = inject(MagicSkillService);
  readonly toastService = inject(ToastService);

  readonly allFamilies = computed(() =>
    this.magicSkillService.getAllFamilies()
  );

  private readonly subscriptions = new Set<Subscription>();
  private readonly skillFormGroupsMap = new Map<
    string,
    {
      formGroup: FormGroup<SkillMasteryForm>;
      skill: MagicSkill;
      subscription?: Subscription;
    }
  >();

  readonly formGroup = new FormGroup<AllFamiliesForm>({});

  constructor() {
    // Initialize form groups for all families synchronously
    const families = this.magicSkillService.getAllFamilies();
    families.forEach(family => {
      const familyFormGroup = CharacterSkillFamilyComponent.createFormGroup();
      const skills = this.magicSkillService.findSkillsByFamily(family.id);
      skills.forEach(skill => {
        const skillFormGroup = SkillMasteryComponent.createFormGroup({
          idSkill: skill.id,
          level: 0,
        });
        familyFormGroup.addControl(skill.id, skillFormGroup);
      });
      this.formGroup.addControl(family.id, familyFormGroup);
    });

    // Keep form groups in sync with families (for dynamic updates)
    effect(() => {
      const families = this.allFamilies();
      const currentFamilyIds = new Set(families.map(f => f.id));

      // Remove form groups for families that no longer exist
      for (const familyId of Object.keys(this.formGroup.controls)) {
        if (!currentFamilyIds.has(familyId)) {
          // Type assertion needed because TypeScript doesn't allow removing
          // controls that aren't in the strict type definition
          (this.formGroup as unknown as FormGroup).removeControl(familyId);
        }
      }

      // Create form groups for new families and initialize all skill form groups
      families.forEach(family => {
        if (!this.formGroup.controls[family.id]) {
          const familyFormGroup =
            CharacterSkillFamilyComponent.createFormGroup();
          const skills = this.magicSkillService.findSkillsByFamily(family.id);
          skills.forEach(skill => {
            const skillFormGroup = SkillMasteryComponent.createFormGroup({
              idSkill: skill.id,
              level: 0,
            });
            familyFormGroup.addControl(skill.id, skillFormGroup);
          });
          this.formGroup.addControl(family.id, familyFormGroup);
        }
      });
    });

    // Set up subscriptions for tier enforcement
    effect(() => {
      const families = this.allFamilies();
      families.forEach(family => {
        const familyFormGroup = this.formGroup.controls[family.id];
        if (familyFormGroup) {
          const skills = this.magicSkillService.findSkillsByFamily(family.id);
          skills.forEach(skill => {
            const skillFormGroup = familyFormGroup.controls[skill.id];
            if (skillFormGroup) {
              const existing = this.skillFormGroupsMap.get(skill.id);
              if (!existing || existing.formGroup !== skillFormGroup) {
                // Clean up old subscription if exists
                if (existing?.subscription) {
                  existing.subscription.unsubscribe();
                  this.subscriptions.delete(existing.subscription);
                }

                const levelControl = skillFormGroup.controls.level;
                const subscription = levelControl.valueChanges.subscribe(
                  newLevel => {
                    if (newLevel > 0) {
                      this.ensureLowerTiersAtLeastLevel2(skill, newLevel);
                    }
                  }
                );
                this.skillFormGroupsMap.set(skill.id, {
                  formGroup: skillFormGroup,
                  skill,
                  subscription,
                });
                this.subscriptions.add(subscription);
              }
            }
          });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.clear();
  }

  private getTierOrder(): SkillTier[] {
    return this.magicSkillService.getAllTiers();
  }

  private compareTiers(tier1: SkillTier, tier2: SkillTier): number {
    const tierOrder = this.getTierOrder();
    return tierOrder.indexOf(tier1) - tierOrder.indexOf(tier2);
  }

  private getLowerTierSkills(currentSkill: MagicSkill): MagicSkill[] {
    const allSkills = this.magicSkillService.findSkillsByFamily(
      currentSkill.idFamily
    );
    const currentTier = currentSkill.tier;
    return allSkills.filter(
      skill =>
        skill.idFamily === currentSkill.idFamily &&
        skill.id !== currentSkill.id &&
        this.compareTiers(skill.tier, currentTier) < 0
    );
  }

  private ensureLowerTiersAtLeastLevel2(
    selectedSkill: MagicSkill,
    selectedLevel: number
  ): void {
    if (selectedLevel <= 0) {
      return;
    }

    const tierOrder = this.getTierOrder();
    const selectedTierIndex = tierOrder.indexOf(selectedSkill.tier);

    // Only enforce if this is a higher tier skill (not the lowest tier)
    if (selectedTierIndex === 0) {
      return; // Already at lowest tier, nothing to enforce
    }

    const familyFormGroup = this.formGroup.controls[selectedSkill.idFamily];
    if (!familyFormGroup) {
      return;
    }

    const lowerTierSkills = this.getLowerTierSkills(selectedSkill);
    lowerTierSkills.forEach(lowerSkill => {
      const lowerSkillFormGroup = familyFormGroup.controls[lowerSkill.id];
      if (lowerSkillFormGroup) {
        const currentLevel = lowerSkillFormGroup.controls.level.value;
        if (currentLevel < 2) {
          // Update the value - emitEvent: true ensures UI updates
          // The check above prevents infinite loops since we only update if < 2
          lowerSkillFormGroup.controls.level.setValue(2, {
            emitEvent: true,
          });
        }
      }
    });
  }
}
