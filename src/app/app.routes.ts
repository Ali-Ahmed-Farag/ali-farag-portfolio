import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero.component';

export const routes: Routes = [
  {
    path: '',
    component: HeroComponent,
  },
  {
    path: 'stack',
    loadComponent: () =>
      import('./stack/stack.component').then(m => m.StackComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects/projects.component').then(m => m.ProjectsComponent),
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component').then(m => m.ContactComponent),
  },
  {
    path: 'resume',
    loadComponent: () =>
      import('./resume/resume.component').then(m => m.ResumeComponent),
  },
];