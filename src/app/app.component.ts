import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { ResumeComponent } from './resume/resume.component';
import { ContactComponent } from './contact/contact.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ResumeComponent, ContactComponent],
  template: `
    <div class="app-wrapper">
      <router-outlet (activate)="onActivate($event)"></router-outlet>
      <app-navbar
        [isDark]="isDark"
        [activeTab]="activeTab"
        (themeToggle)="toggleTheme()"
        (tabChange)="onTabChange($event)"
        (resumeOpen)="showResume = true"
        (contactOpen)="showContact = true"
      ></app-navbar>
      <app-resume
        *ngIf="showResume"
        (closed)="showResume = false"
      ></app-resume>
      <app-contact
        *ngIf="showContact"
        [isModal]="true"
        (closed)="showContact = false"
      ></app-contact>
    </div>
  `,
  styles: [`
    .app-wrapper {
      min-height: 100vh;
      position: relative;
      padding-bottom: 100px;
    }
  `]
})
export class AppComponent implements OnInit {
  isDark = true;
  activeTab: 'projects' | 'developer' = 'projects';
  showResume = false;
  showContact = false;
  private activeComponent: any = null;

  constructor(private renderer: Renderer2) {}

  ngOnInit() { this.applyTheme(); }

  onActivate(component: any) {
    this.activeComponent = component;
    if (component.contactOpen) {
      component.contactOpen.subscribe(() => {
        this.showContact = true;
      });
    }
  }

  onTabChange(tab: 'projects' | 'developer') {
    this.activeTab = tab;
    if (this.activeComponent && 'activeTab' in this.activeComponent) {
      this.activeComponent.activeTab.set(tab);
    }
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDark) {
      this.renderer.removeAttribute(document.documentElement, 'data-theme');
    } else {
      this.renderer.setAttribute(document.documentElement, 'data-theme', 'light');
    }
  }
}