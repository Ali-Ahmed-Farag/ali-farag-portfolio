import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PhotoCardComponent } from '../photo-card/photo-card.component';
import { PageTransition } from '../shared/page-transition';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, PhotoCardComponent],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent extends PageTransition implements OnInit {
  @Input() isDark = true;
  @Output() contactOpen = new EventEmitter<void>();

  get isLight(): boolean {
    return document.documentElement.hasAttribute('data-theme');
  }

  firstName = 'Ali';
  lastName  = 'Ahmed Farag';
  title     = 'DATA ENGINEER';
  status    = 'Available';
  tagline   = 'Designing & Building End-to-End Data Pipelines.';
  photoPath = 'assets/images/profile.jpg';

  constructor(private router: Router) {
    super();
  }

  ngOnInit() {
    this.initPageTransition(this.router);
  }

  protected override onEdgeScrollDown() {
    this.startTransition('Stack', '/stack');
  }

  openContact() {
    this.contactOpen.emit();
  }
}
