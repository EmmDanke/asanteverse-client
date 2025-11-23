import { Routes } from '@angular/router';
import { SkillCalculatorComponent } from './magic-skill/pages/skill-calculator/skill-calculator.component';

export const routes: Routes = [
  {
    path: 'skill-calculator',
    component: SkillCalculatorComponent,
  },
  {
    path: '',
    redirectTo: '/skill-calculator',
    pathMatch: 'full',
  },
];
