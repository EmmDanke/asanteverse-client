import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagicSkillService } from '../../services/magic-skill.service';
import { SkillCalculatorService } from '../../services/skill-calculator.service';
import { MagicSkill, SkillTier, SkillFamily } from '../../models/magic-skill';
import { CheckboxComponent } from '../../../shared/ui/checkbox/checkbox.component';

interface FamilyRow {
  family: SkillFamily;
  skillsByTier: Map<SkillTier, MagicSkill[]>;
}

@Component({
  selector: 'app-skill-calculator',
  imports: [CommonModule, CheckboxComponent],
  templateUrl: './skill-calculator.component.html',
  styleUrl: './skill-calculator.component.scss',
})
export class SkillCalculatorComponent {
  private magicSkillService = inject(MagicSkillService);
  readonly skillCalculatorService = inject(SkillCalculatorService);
  tiers: SkillTier[] = [];
  familyRows: FamilyRow[] = [];
  readonly selectedSkills = signal<Set<string>>(new Set());
  readonly blinkingSkillCounters = signal<Map<string, number>>(new Map());
  readonly warningMessage = signal<string | null>(null);

  readonly selectedSkillsArray = computed(() => {
    const selectedIds = this.selectedSkills();
    return Array.from(selectedIds)
      .map(id => this.magicSkillService.findSkill(id))
      .filter((skill): skill is MagicSkill => skill !== undefined);
  });

  readonly currentCost = computed(() => {
    return this.skillCalculatorService.calculateCost(
      this.selectedSkillsArray()
    );
  });

  readonly remainingPoints = computed(() => {
    return this.skillCalculatorService.MAXIMUM_POINTS - this.currentCost();
  });

  readonly isLimitExceeded = computed(() => {
    return this.currentCost() > this.skillCalculatorService.MAXIMUM_POINTS;
  });

  readonly isLimitReached = computed(() => {
    return this.currentCost() >= this.skillCalculatorService.MAXIMUM_POINTS;
  });

  constructor() {
    this.tiers = this.magicSkillService.getAllTiers();
    const allFamilies = this.magicSkillService.getAllFamilies();

    // Group skills by family, then by tier within each family
    this.familyRows = allFamilies.map(family => {
      const familySkills = this.magicSkillService.findSkillsByFamily(family.id);
      const skillsByTier = new Map<SkillTier, MagicSkill[]>();

      this.tiers.forEach(tier => {
        skillsByTier.set(
          tier,
          familySkills.filter(skill => skill.tier === tier)
        );
      });

      return { family, skillsByTier };
    });
  }

  getSkillsForFamilyAndTier(
    familyRow: FamilyRow,
    tier: SkillTier
  ): MagicSkill[] {
    return familyRow.skillsByTier.get(tier) || [];
  }

  getTierLabel(tier: SkillTier): string {
    switch (tier) {
      case SkillTier.Accessible:
        return 'Accessible';
      case SkillTier.Training1Year:
        return '1+ years of training';
      case SkillTier.Training10Years:
        return '10+ years of training';
      case SkillTier.Rare:
        return 'Rare';
      default:
        return tier;
    }
  }

  getTierClass(tier: SkillTier): string {
    switch (tier) {
      case SkillTier.Accessible:
        return 'tier-accessible';
      case SkillTier.Training1Year:
        return 'tier-training-1y';
      case SkillTier.Training10Years:
        return 'tier-training-10y';
      case SkillTier.Rare:
        return 'tier-rare';
      default:
        return '';
    }
  }

  isSkillSelected(skillId: string): boolean {
    return this.selectedSkills().has(skillId);
  }

  onSkillToggle(skillId: string, checked: boolean): void {
    const skill = this.magicSkillService.findSkill(skillId);
    if (!skill) {
      return;
    }

    const current = new Set(this.selectedSkills());

    if (checked) {
      this.handleSkillSelection(skill, current);
    } else {
      this.handleSkillDeselection(skill, current);
    }

    this.selectedSkills.set(current);
  }

  private handleSkillSelection(
    skill: MagicSkill,
    currentSelection: Set<string>
  ): void {
    const skillsToAdd = this.getSkillsToAdd(skill, currentSelection);

    if (this.wouldExceedLimit(skillsToAdd)) {
      this.showBlockedSelectionWarning(skill, skillsToAdd);
      return;
    }

    this.addSkillAndPrerequisites(skill, currentSelection);
    this.clearWarning();
  }

  private handleSkillDeselection(
    skill: MagicSkill,
    currentSelection: Set<string>
  ): void {
    currentSelection.delete(skill.id);
    this.removeDependentSkills(skill, currentSelection);
  }

  private getSkillsToAdd(
    skill: MagicSkill,
    currentSelection: Set<string>
  ): MagicSkill[] {
    const skillsToAdd = [skill];
    const prerequisiteSkills = this.getPrerequisiteSkills(skill);

    prerequisiteSkills.forEach(prerequisite => {
      if (!currentSelection.has(prerequisite.id)) {
        skillsToAdd.push(prerequisite);
      }
    });

    return skillsToAdd;
  }

  private getPrerequisiteSkills(skill: MagicSkill): MagicSkill[] {
    const selectedTierIndex = this.tiers.indexOf(skill.tier);
    const familySkills = this.magicSkillService.findSkillsByFamily(
      skill.idFamily
    );

    return familySkills.filter(familySkill => {
      const skillTierIndex = this.tiers.indexOf(familySkill.tier);
      return skillTierIndex < selectedTierIndex;
    });
  }

  private wouldExceedLimit(skillsToAdd: MagicSkill[]): boolean {
    const currentSkills = this.selectedSkillsArray();
    const potentialCost = this.skillCalculatorService.calculateCost([
      ...currentSkills,
      ...skillsToAdd,
    ]);

    return potentialCost > this.skillCalculatorService.MAXIMUM_POINTS;
  }

  private addSkillAndPrerequisites(
    skill: MagicSkill,
    currentSelection: Set<string>
  ): void {
    currentSelection.add(skill.id);
    const prerequisiteSkills = this.getPrerequisiteSkills(skill);

    prerequisiteSkills.forEach(prerequisite => {
      currentSelection.add(prerequisite.id);
    });
  }

  private removeDependentSkills(
    skill: MagicSkill,
    currentSelection: Set<string>
  ): void {
    const selectedTierIndex = this.tiers.indexOf(skill.tier);
    const familySkills = this.magicSkillService.findSkillsByFamily(
      skill.idFamily
    );

    familySkills.forEach(familySkill => {
      const skillTierIndex = this.tiers.indexOf(familySkill.tier);
      if (skillTierIndex > selectedTierIndex) {
        currentSelection.delete(familySkill.id);
      }
    });
  }

  private showBlockedSelectionWarning(
    skill: MagicSkill,
    skillsToAdd: MagicSkill[]
  ): void {
    const currentSkills = this.selectedSkillsArray();
    const potentialCost = this.skillCalculatorService.calculateCost([
      ...currentSkills,
      ...skillsToAdd,
    ]);
    const costDifference =
      potentialCost - this.skillCalculatorService.MAXIMUM_POINTS;
    const skillCost = this.skillCalculatorService.calculateCost(skillsToAdd);

    this.warningMessage.set(
      `Cannot afford "${skill.name}"! It costs ${skillCost} points, but you only have ${this.remainingPoints()} points remaining. (Would exceed limit by ${costDifference} points)`
    );

    // Trigger blink animation by incrementing counter
    const counters = new Map(this.blinkingSkillCounters());
    const currentCount = counters.get(skill.id) || 0;
    counters.set(skill.id, currentCount + 1);
    this.blinkingSkillCounters.set(counters);
  }

  private clearWarning(): void {
    this.warningMessage.set(null);
  }

  getBlinkCounter(skillId: string): number {
    return this.blinkingSkillCounters().get(skillId) || 0;
  }
}
