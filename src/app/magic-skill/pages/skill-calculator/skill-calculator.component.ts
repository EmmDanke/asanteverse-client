import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CharacterSkillFamilyComponent } from '../../components/character-skill-family/character-skill-family.component';
import { MagicSkillService } from '../../services/magic-skill.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-skill-calculator',
  imports: [CommonModule, CharacterSkillFamilyComponent],
  templateUrl: './skill-calculator.component.html',
  styleUrl: './skill-calculator.component.scss',
})
export class SkillCalculatorComponent {
  readonly magicSkillService = inject(MagicSkillService);
  readonly toastService = inject(ToastService);

  // Using 'shape' family as an example (contains 'resize' and 'reshape' skills)
  readonly familyId = 'shape';
}
