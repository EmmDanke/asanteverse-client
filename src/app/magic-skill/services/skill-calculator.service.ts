import { Injectable } from '@angular/core';
import { MagicSkill, SkillTier } from '../models/magic-skill';
import { SkillMastery } from '../models/skill-mastery';

@Injectable({
  providedIn: 'root',
})
export class SkillCalculatorService {
  readonly MAXIMUM_POINTS = 60;

  readonly COST_PER_TIER_AND_LEVEL: Record<SkillTier, Record<number, number>> =
    {
      [SkillTier.Accessible]: {
        1: 1,
        2: 1,
        3: 2,
        4: 2,
        5: 3,
      },
      [SkillTier.Training1Year]: {
        1: 5,
        2: 6,
        3: 9,
        4: 12,
        5: 17,
      },
      [SkillTier.Training10Years]: {
        1: 12,
        2: 17,
        3: 24,
        4: 33,
        5: 44,
      },
      [SkillTier.Rare]: {
        1: 10,
      },
    };

  calculateCost(skills: [MagicSkill, SkillMastery][]): number {
    return skills.reduce(
      (acc, [skill, mastery]) => acc + this.getCost(skill.tier, mastery.level),
      0
    );
  }

  getCost(tier: SkillTier, level: number): number {
    const cost = this.COST_PER_TIER_AND_LEVEL[tier][level];
    if (!cost) {
      throw new Error(`Cost not found for tier '${tier}' and level '${level}'`);
    }
    return cost;
  }
}
