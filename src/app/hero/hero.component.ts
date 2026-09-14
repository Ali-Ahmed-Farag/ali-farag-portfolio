import { Component, Input, OnInit, OnDestroy, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { PhotoCardComponent } from '../photo-card/photo-card.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoCardComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() isDark = true;
  @Output() contactOpen = new EventEmitter<void>();

  get isLight(): boolean {
    return document.documentElement.hasAttribute('data-theme');
  }

  firstName = 'Ali';
  lastName  = 'Farag';
  title     = 'Data Engineer';
  status    = 'Available';
  timezone  = 'UTC+02:00';
  photoPath = 'assets/images/profile.jpg';

  overlayVisible = false;
  overlayWord    = '';
  overlayPhase: 'in' | 'hold' | 'out' = 'in';
  private scrollLocked = false;
  private t1: any; private t2: any; private t3: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.scrollLocked = true;
    setTimeout(() => { this.scrollLocked = false; }, 700);
  }

  ngOnDestroy() {
    clearTimeout(this.t1); clearTimeout(this.t2); clearTimeout(this.t3);
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(e: WheelEvent) {
    if (this.scrollLocked) return;
    if (e.deltaY > 30) this.triggerTransition('Stack', '/stack');
  }

  openContact() {
    this.contactOpen.emit();
  }

  private triggerTransition(word: string, route: string) {
    this.scrollLocked   = true;
    this.overlayWord    = word;
    this.overlayPhase   = 'in';
    this.overlayVisible = true;

    this.t1 = setTimeout(() => { this.overlayPhase = 'hold'; }, 250);
    this.t2 = setTimeout(() => { this.overlayPhase = 'out'; }, 900);
    this.t3 = setTimeout(() => {
      this.overlayVisible = false;
      this.router.navigate([route]);
    }, 1300);
  }
}