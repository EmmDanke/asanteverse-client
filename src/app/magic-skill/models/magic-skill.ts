export interface MagicSkill {
  id: string;
  idFamily: string;
  tier: SkillTier;
  maxLevel: number;
  name: string;
  description?: string;
  image?: string;
}

export enum SkillTier {
  Accessible = 'accessible',
  Training1Year = 'train-1y',
  Training10Years = 'train-10y',
  Rare = 'rare',
}

export interface SkillFamily {
  id: string;
  name: string;
  description?: string;
  image?: string;
}
