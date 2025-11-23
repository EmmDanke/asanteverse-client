import { Injectable } from '@angular/core';
import { MagicSkill, SkillFamily, SkillTier } from '../models/magic-skill';

@Injectable({
  providedIn: 'root',
})
export class MagicSkillService {
  private readonly allSkills = {
    // Tier 1 - Accessible
    resize: MagicSkillService.ms({
      id: 'resize',
      idFamily: 'shape',
      tier: SkillTier.Accessible,
      name: 'Resize',
    }),
    suggest: MagicSkillService.ms({
      id: 'suggest',
      idFamily: 'mind-control',
      tier: SkillTier.Accessible,
      name: 'Suggest',
    }),
    inanimate: MagicSkillService.ms({
      id: 'inanimate',
      idFamily: 'animation',
      tier: SkillTier.Accessible,
      name: 'Inanimate',
    }),
    stereotype: MagicSkillService.ms({
      id: 'stereotype',
      idFamily: 'stereotype',
      tier: SkillTier.Accessible,
      name: 'Stereotype',
    }),
    reset: MagicSkillService.ms({
      id: 'reset',
      idFamily: 'origin',
      tier: SkillTier.Accessible,
      name: 'Reset',
    }),
    infuse: MagicSkillService.ms({
      id: 'infuse',
      idFamily: 'infusion',
      tier: SkillTier.Accessible,
      name: 'Infuse',
    }),
    teleport: MagicSkillService.ms({
      id: 'teleport',
      idFamily: 'teleportation',
      tier: SkillTier.Accessible,
      name: 'Teleport',
    }),
    'mana-detection': MagicSkillService.ms({
      id: 'mana-detection',
      idFamily: 'mana',
      tier: SkillTier.Accessible,
      name: 'Mana detection',
    }),
    'permanent-transformation': MagicSkillService.ms({
      id: 'permanent-transformation',
      idFamily: 'permanence',
      tier: SkillTier.Accessible,
      name: 'Permanent transformation',
    }),
    overtry: MagicSkillService.ms({
      id: 'overtry',
      idFamily: 'overtrying',
      tier: SkillTier.Accessible,
      name: 'Overtry',
    }),
    'area-of-effect': MagicSkillService.ms({
      id: 'area-of-effect',
      idFamily: 'area-of-effect',
      tier: SkillTier.Accessible,
      name: 'Area of effect',
    }),
    // Tier 2 - 1+ years of training
    reshape: MagicSkillService.ms({
      id: 'reshape',
      idFamily: 'shape',
      tier: SkillTier.Training1Year,
      name: 'Reshape',
    }),
    command: MagicSkillService.ms({
      id: 'command',
      idFamily: 'mind-control',
      tier: SkillTier.Training1Year,
      name: 'Command',
    }),
    'material-change': MagicSkillService.ms({
      id: 'material-change',
      idFamily: 'animation',
      tier: SkillTier.Training1Year,
      name: 'Material change',
    }),
    protection: MagicSkillService.ms({
      id: 'protection',
      idFamily: 'origin',
      tier: SkillTier.Training1Year,
      name: 'Protection',
    }),
    'mana-suppression': MagicSkillService.ms({
      id: 'mana-suppression',
      idFamily: 'mana',
      tier: SkillTier.Training1Year,
      name: 'Mana suppression',
    }),
    curse: MagicSkillService.ms({
      id: 'curse',
      idFamily: 'permanence',
      tier: SkillTier.Training1Year,
      name: 'Curse',
    }),
    // Tier 3 - 10+ years of training
    'mind-rewrite': MagicSkillService.ms({
      id: 'mind-rewrite',
      idFamily: 'mind-control',
      tier: SkillTier.Training10Years,
      name: 'Mind rewrite',
    }),
    'consciousness-transfer': MagicSkillService.ms({
      id: 'consciousness-transfer',
      idFamily: 'animation',
      tier: SkillTier.Training10Years,
      name: 'Consciousness transfer',
    }),
    'transformation-and-curse-transfer': MagicSkillService.ms({
      id: 'transformation-and-curse-transfer',
      idFamily: 'permanence',
      tier: SkillTier.Training10Years,
      name: 'Transformation and curse transfer',
    }),
    'mana-transfer': MagicSkillService.ms({
      id: 'mana-transfer',
      idFamily: 'mana',
      tier: SkillTier.Training10Years,
      name: 'Mana transfer',
    }),
    // Tier 4 - Rare
    'consciousness-creation': MagicSkillService.ms({
      id: 'consciousness-creation',
      idFamily: 'animation',
      tier: SkillTier.Rare,
      name: 'Consciousness creation',
    }),
    'original-alteration': MagicSkillService.ms({
      id: 'original-alteration',
      idFamily: 'origin',
      tier: SkillTier.Rare,
      name: 'Original alteration',
    }),
  };

  private readonly allFamilies = {
    shape: MagicSkillService.sf({
      id: 'shape',
      name: 'Shape manipulation',
    }),
    'mind-control': MagicSkillService.sf({
      id: 'mind-control',
      name: 'Mind control',
    }),
    animation: MagicSkillService.sf({
      id: 'animation',
      name: 'Animation and inanimation',
    }),
    stereotype: MagicSkillService.sf({
      id: 'stereotype',
      name: 'Stereotype',
    }),
    origin: MagicSkillService.sf({
      id: 'origin',
      name: 'Origin and preservation',
    }),
    teleportation: MagicSkillService.sf({
      id: 'teleportation',
      name: 'Teleportation',
    }),
    mana: MagicSkillService.sf({
      id: 'mana',
      name: 'Mana manipulation',
    }),
    permanence: MagicSkillService.sf({
      id: 'permanence',
      name: 'Permanence',
    }),
    overtrying: MagicSkillService.sf({
      id: 'overtrying',
      name: 'Overtrying',
    }),
    'area-of-effect': MagicSkillService.sf({
      id: 'area-of-effect',
      name: 'Area of effect',
    }),
    infusion: MagicSkillService.sf({
      id: 'infusion',
      name: 'Magical infusion',
    }),
  };

  getAllMagicSkills(): MagicSkill[] {
    return Object.values(this.allSkills);
  }

  getAllFamilies(): SkillFamily[] {
    return Object.values(this.allFamilies);
  }

  getAllTiers(): SkillTier[] {
    return Object.values(SkillTier);
  }

  findSkill(idSkill: string): MagicSkill | undefined {
    return this.allSkills[idSkill as keyof typeof this.allSkills];
  }

  findFamily(idFamily: string): SkillFamily | undefined {
    return this.allFamilies[idFamily as keyof typeof this.allFamilies];
  }

  findSkillsByFamily(idFamily: string): MagicSkill[] {
    return Object.values(this.allSkills).filter(s => s.idFamily === idFamily);
  }

  findClosestDependency(skill: MagicSkill): MagicSkill | undefined {
    const familyId = skill.idFamily;
    const currentTier = skill.tier;

    // Define tier order for comparison
    const tierOrder: SkillTier[] = this.getAllTiers();

    const currentTierIndex = tierOrder.indexOf(currentTier);
    if (currentTierIndex === -1) {
      throw new Error(
        `Tier not found for ${skill.id}. Seeked tier: ${currentTier} `
      );
    }
    if (currentTierIndex === 0) {
      // No inferior tier exists (already at lowest tier)
      return undefined;
    }

    // Find all skills in the same family and pick maximum inferior tier
    return this.findSkillsByFamily(familyId)
      .filter(s => tierOrder.indexOf(s.tier) < currentTierIndex)
      .sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier))
      .at(-1); // Return the last one (maximum tier not filtered out)
  }

  /**
   * Typing method
   */
  private static ms(magicSkill: MagicSkill): MagicSkill {
    return magicSkill;
  }

  /**
   * Typing method
   */
  private static sf(skillFamily: SkillFamily): SkillFamily {
    return skillFamily;
  }
}
