import { Injectable } from '@angular/core';
import { MagicSkill, SkillTier } from '../models/magic-skill';

@Injectable({
  providedIn: 'root',
})
export class SkillCalculatorService {
  readonly MAXIMUM_POINTS = 60;

  readonly COST_TIERS_ACCESSIBLE = 1;
  readonly COST_TIERS_TRAINING_1Y = 5;
  readonly COST_TIERS_TRAINING_10Y = 12;
  readonly COST_TIERS_RARE = 10;

  calculateCost(skills: MagicSkill[]): number {
    return skills.reduce((acc, skill) => acc + this.getCost(skill.tier), 0);
  }

  getCost(tier: SkillTier): number {
    switch (tier) {
      case SkillTier.Accessible:
        return this.COST_TIERS_ACCESSIBLE;
      case SkillTier.Training1Year:
        return this.COST_TIERS_TRAINING_1Y;
      case SkillTier.Training10Years:
        return this.COST_TIERS_TRAINING_10Y;
      case SkillTier.Rare:
        return this.COST_TIERS_RARE;
      default:
        throw new Error(`Invalid tier: ${tier}`);
    }
  }
}
