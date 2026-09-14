import { Component, signal, computed, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

declare const emailjs: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  @Input() isModal = false;
  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  goHome() {
    if (this.isModal) {
      this.closed.emit();
    } else {
      this.router.navigate(['/']);
    }
  }

  // ── Tabs ──────────────────────────────────────────────
  activeTab: 'call' | 'message' = 'call';

  // ── Calendar ──────────────────────────────────────────
  today = new Date();
  currentMonth = signal(new Date(this.today.getFullYear(), this.today.getMonth(), 1));
  selectedDate = signal<Date | null>(new Date(this.today));
  selectedSlot = signal<string | null>(null);

  monthLabel = computed(() =>
    this.currentMonth().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  calendarDays = computed(() => {
    const year  = this.currentMonth().getFullYear();
    const month = this.currentMonth().getMonth();
    const first = new Date(year, month, 1).getDay();
    const last  = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = Array(first).fill(null);
    for (let d = 1; d <= last; d++) days.push(d);
    return days;
  });

  selectedDateLabel = computed(() => {
    const d = this.selectedDate();
    if (!d) return '';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  });

  timeSlots = ['06:00 PM','07:00 PM','08:00 PM','09:00 PM','10:00 PM','11:00 PM','12:00 AM'];

  prevMonth() {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
  }

  nextMonth() {
    const d = this.currentMonth();
    this.currentMonth.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.selectedDate.set(null);
    this.selectedSlot.set(null);
  }

  selectDay(day: number | null) {
    if (!day) return;
    const d = this.currentMonth();
    this.selectedDate.set(new Date(d.getFullYear(), d.getMonth(), day));
    this.selectedSlot.set(null);
  }

  isToday(day: number | null): boolean {
    if (!day) return false;
    const d = this.currentMonth();
    const t = this.today;
    return d.getFullYear() === t.getFullYear() &&
           d.getMonth()    === t.getMonth()    &&
           day             === t.getDate();
  }

  isSelected(day: number | null): boolean {
    if (!day) return false;
    const sel = this.selectedDate();
    if (!sel) return false;
    const d = this.currentMonth();
    return d.getFullYear() === sel.getFullYear() &&
           d.getMonth()    === sel.getMonth()    &&
           day             === sel.getDate();
  }

  isPast(day: number | null): boolean {
    if (!day) return false;
    const d = this.currentMonth();
    const date = new Date(d.getFullYear(), d.getMonth(), day);
    const t = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    return date < t;
  }

  // ── Book-a-call form ──────────────────────────────────
  callForm = { name: '', email: '' };
  callStatus: 'idle' | 'sending' | 'success' | 'error' = 'idle';

  async submitCall() {
    if (!this.selectedDate() || !this.selectedSlot() ||
        !this.callForm.name  || !this.callForm.email) return;

    this.callStatus = 'sending';
    try {
      await emailjs.send(
        'service_nay6z7g',   // ✅ Ali's EmailJS Service ID
        'TODO_TEMPLATE_ID',  // ⚠️ ضيف Template ID بتاعك هنا
        {
          name:    this.callForm.name,
          email:   this.callForm.email,
          message: `Meeting request on ${this.selectedDateLabel()} at ${this.selectedSlot()}`,
        },
        'TODO_PUBLIC_KEY'    // ⚠️ ضيف Public Key بتاعك هنا
      );
      this.callStatus = 'success';
    } catch {
      this.callStatus = 'error';
    }
  }

  // ── Send-a-message form ───────────────────────────────
  msgForm = { name: '', email: '', phone: '', whatsapp: false, message: '' };
  msgStatus: 'idle' | 'sending' | 'success' | 'error' = 'idle';

  async submitMessage() {
    if (!this.msgForm.name || !this.msgForm.email || !this.msgForm.message) return;
    this.msgStatus = 'sending';
    try {
      await emailjs.send(
        'service_nay6z7g',   // ✅ Ali's EmailJS Service ID
        'TODO_TEMPLATE_ID',  // ⚠️ ضيف Template ID بتاعك هنا
        {
          name:    this.msgForm.name,
          email:   this.msgForm.email,
          message: this.msgForm.message +
            (this.msgForm.phone ? `\n\nPhone: ${this.msgForm.phone}` : '') +
            (this.msgForm.whatsapp ? '\nWhatsApp: Yes' : ''),
        },
        'TODO_PUBLIC_KEY'    // ⚠️ ضيف Public Key بتاعك هنا
      );
      this.msgStatus = 'success';
    } catch {
      this.msgStatus = 'error';
    }
  }
}