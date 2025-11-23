import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MagicSkillService } from '../../services/magic-skill.service';
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
  tiers: SkillTier[] = [];
  familyRows: FamilyRow[] = [];
  readonly selectedSkills = signal<Set<string>>(new Set());

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
    const current = new Set(this.selectedSkills());
    const skill = this.magicSkillService.findSkill(skillId);

    if (!skill) {
      return;
    }

    if (checked) {
      // Add the selected skill
      current.add(skillId);

      // Find all skills in the same family that are in tiers to the left
      const selectedTierIndex = this.tiers.indexOf(skill.tier);
      const familySkills = this.magicSkillService.findSkillsByFamily(
        skill.idFamily
      );

      familySkills.forEach(familySkill => {
        const skillTierIndex = this.tiers.indexOf(familySkill.tier);
        // Select skills in tiers that come before (to the left of) the selected skill's tier
        if (skillTierIndex < selectedTierIndex) {
          current.add(familySkill.id);
        }
      });
    } else {
      // Remove the selected skill
      current.delete(skillId);

      // Also unselect all skills to the right (higher tiers) in the same family
      const selectedTierIndex = this.tiers.indexOf(skill.tier);
      const familySkills = this.magicSkillService.findSkillsByFamily(
        skill.idFamily
      );

      familySkills.forEach(familySkill => {
        const skillTierIndex = this.tiers.indexOf(familySkill.tier);
        // Unselect skills in tiers that come after (to the right of) the selected skill's tier
        if (skillTierIndex > selectedTierIndex) {
          current.delete(familySkill.id);
        }
      });
    }

    this.selectedSkills.set(current);
  }
}
