import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() isDark = true;
  @Input() activeTab: 'projects' | 'developer' = 'projects';
  @Output() themeToggle = new EventEmitter<void>();
  @Output() tabChange   = new EventEmitter<'projects' | 'developer'>();
  @Output() resumeOpen  = new EventEmitter<void>();
  @Output() contactOpen = new EventEmitter<void>();

  activeItem = 'home';
  hoveredItem: string | null = null;
  isProjectsPage = false;
  private routerSub?: Subscription;

  navItems = [
    { id: 'home',      label: 'Home',      icon: 'home',      route: '/'          },
    { id: 'stack',     label: 'Stack',     icon: 'layers',    route: '/stack'     },
    { id: 'projects',  label: 'Projects',  icon: 'kanban',    route: '/projects'  },
    { id: 'resume',    label: 'Resume',    icon: 'file',      route: null         },
    { id: 'contact',   label: 'Contact',   icon: 'mail',      route: null         },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.syncActiveFromUrl(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.syncActiveFromUrl(e.urlAfterRedirects));
  }

  ngOnDestroy() { this.routerSub?.unsubscribe(); }

  private syncActiveFromUrl(url: string) {
    this.isProjectsPage = url.startsWith('/projects');
    const match = this.navItems.find(item => item.route === url)
      ?? (url === '/' ? this.navItems.find(item => item.route === '/') : null);
    if (match) this.activeItem = match.id;
  }

  setActive(item: { id: string; route: string | null }) {
    this.activeItem = item.id;

    if (item.id === 'resume')  { this.resumeOpen.emit();  return; }
    if (item.id === 'contact') { this.contactOpen.emit(); return; }
    if (item.route) { this.router.navigateByUrl(item.route); }
  }

  setTab(tab: 'projects' | 'developer') { this.tabChange.emit(tab); }
  onToggle() { this.themeToggle.emit(); }
}