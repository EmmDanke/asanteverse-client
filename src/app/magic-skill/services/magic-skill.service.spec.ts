import { TestBed } from '@angular/core/testing';
import { MagicSkillService } from './magic-skill.service';
import { SkillTier } from '../models/magic-skill';

describe('MagicSkillService', () => {
  let service: MagicSkillService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MagicSkillService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findClosestDependency', () => {
    it('should return the closest inferior tier when multiple inferior tiers exist', () => {
      // Test: consciousness-creation (Rare) should depend on consciousness-transfer (Training10Years),
      // not on material-change (Training1Year) or inanimate (Accessible)
      const consciousnessCreation = service.findSkill('consciousness-creation');
      expect(consciousnessCreation).toBeDefined();

      const dependency = service.findClosestDependency(consciousnessCreation!);
      expect(dependency).toBeDefined();
      expect(dependency?.id).toBe('consciousness-transfer');
      expect(dependency?.tier).toBe(SkillTier.Training10Years);
    });

    it('should return undefined for skills at the lowest tier (Accessible)', () => {
      // Test: resize (Accessible) has no inferior tier
      const resize = service.findSkill('resize');
      expect(resize).toBeDefined();

      const dependency = service.findClosestDependency(resize!);
      expect(dependency).toBeUndefined();
    });

    it('should return undefined for skills with no inferior tiers in the same family', () => {
      // Test: stereotype (Accessible) is the only skill in its family
      const stereotype = service.findSkill('stereotype');
      expect(stereotype).toBeDefined();

      const dependency = service.findClosestDependency(stereotype!);
      expect(dependency).toBeUndefined();
    });
  });
});
