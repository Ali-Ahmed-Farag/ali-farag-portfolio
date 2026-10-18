import { Directive } from '@angular/core';
import { Router } from '@angular/router';

export type OverlayPhase = 'in' | 'hold' | 'out';

const ENTRY_LOCK_MS = 300;
const EDGE_DEBOUNCE_MS = 1000;
const EDGE_THRESHOLD = 60;
const EDGE_HOLD_MS = 100;
const HOLD_MS = 100;
const OUT_MS = 350;
const NAVIGATE_MS = 550;
const NAV_SAFETY_MS = 1500;
const MODAL_SELECTOR =
  '.resume-backdrop, .contact-backdrop, .video-modal-backdrop, .gallery-modal-backdrop';

@Directive()
export abstract class PageTransition {
  overlayVisible = false;
  overlayWord = '';
  overlayPhase: OverlayPhase = 'in';

  protected transitionRouter!: Router;

  private locked = true;
  private bound = false;
  private edgeAccum = 0;
  private edgeStreak = 0;
  private edgeStreakAt = 0;
  private lastWheelAt = 0;
  private lastSeenY = 0;
  private timers: ReturnType<typeof setTimeout>[] = [];
  private readonly wheelListener = (e: WheelEvent) => this.handleWheel(e);
  private readonly scrollListener = () => {
    this.lastSeenY = document.scrollingElement?.scrollTop ?? window.scrollY;
  };

  protected initPageTransition(router: Router): void {
    this.transitionRouter = router;
    this.locked = true;
    this.lastSeenY = document.scrollingElement?.scrollTop ?? window.scrollY;
    this.pushTimer(setTimeout(() => { this.locked = false; }, ENTRY_LOCK_MS));
    if (!this.bound) {
      window.addEventListener('wheel', this.wheelListener, { passive: true });
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      this.bound = true;
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('wheel', this.wheelListener);
    window.removeEventListener('scroll', this.scrollListener);
    this.bound = false;
    this.finishTransition();
  }

  protected handleWheel(e: WheelEvent): void {
    if (this.locked || this.overlayVisible || this.modalOpen()) {
      this.resetEdge();
      return;
    }

    if (e.deltaY === 0) return;

    const now = Date.now();
    const gap = now - this.lastWheelAt;
    this.lastWheelAt = now;

    const down = e.deltaY > 0;
    const atEdge = down ? this.atBottom() : this.atTop();
    const el = document.scrollingElement ?? document.documentElement;
    const scrolledByThisWheel = Math.abs(el.scrollTop - this.lastSeenY) > 1;
    this.lastSeenY = el.scrollTop;

    if (!atEdge) {
      this.resetEdge();
      return;
    }

    if (scrolledByThisWheel || this.edgeStreak === 0 || gap > EDGE_DEBOUNCE_MS) {
      this.edgeStreak = 1;
      this.edgeStreakAt = now;
      this.edgeAccum = e.deltaY;
      return;
    }

    this.edgeStreak++;
    this.edgeAccum += e.deltaY;

    if (now - this.edgeStreakAt < EDGE_HOLD_MS) return;
    if (Math.abs(this.edgeAccum) < EDGE_THRESHOLD) return;

    if (down) this.onEdgeScrollDown();
    else this.onEdgeScrollUp();
  }

  private resetEdge(): void {
    this.edgeAccum = 0;
    this.edgeStreak = 0;
    this.edgeStreakAt = 0;
  }

  protected onEdgeScrollDown(): void {}
  protected onEdgeScrollUp(): void {}

  protected atTop(): boolean {
    const el = document.scrollingElement ?? document.documentElement;
    return el.scrollTop <= 0;
  }

  protected atBottom(): boolean {
    const el = document.scrollingElement ?? document.documentElement;
    return el.scrollTop + window.innerHeight >= el.scrollHeight - 2;
  }

  protected startTransition(word: string, route: string): void {
    if (this.overlayVisible) return;

    this.overlayVisible = true;
    this.overlayWord = word;
    this.overlayPhase = 'in';
    this.locked = true;
    this.resetEdge();
    document.body.style.overflow = 'hidden';

    this.pushTimer(setTimeout(() => { this.overlayPhase = 'hold'; }, HOLD_MS));
    this.pushTimer(setTimeout(() => { this.overlayPhase = 'out'; }, OUT_MS));
    this.pushTimer(setTimeout(() => { void this.navigate(route); }, NAVIGATE_MS));
  }

  private async navigate(route: string): Promise<void> {
    const safety = setTimeout(() => this.finishTransition(), NAV_SAFETY_MS);
    try {
      await this.transitionRouter.navigate([route]);
    } catch {
      // navigation failed: the fail-safe below still restores the page
    } finally {
      clearTimeout(safety);
      this.finishTransition();
    }
  }

  protected finishTransition(): void {
    this.clearTimers();
    this.overlayVisible = false;
    this.overlayWord = '';
    this.overlayPhase = 'in';
    this.locked = false;
    this.resetEdge();
    document.body.style.overflow = '';
  }

  private modalOpen(): boolean {
    return document.querySelector(MODAL_SELECTOR) !== null;
  }

  private pushTimer(id: ReturnType<typeof setTimeout>): void {
    this.timers.push(id);
  }

  private clearTimers(): void {
    this.timers.forEach((id) => clearTimeout(id));
    this.timers = [];
  }
}
