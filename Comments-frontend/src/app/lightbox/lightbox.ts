import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
  host: { '(document:keydown.escape)': 'close()' },
})
export class Lightbox {
  protected readonly lb = inject(LightboxService);
  private readonly http = inject(HttpClient);
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  protected readonly text = signal<string | null>(null);
  protected readonly failed = signal(false);
  private sub?: Subscription;

  constructor() {

    effect(() => {
      const item = this.lb.current();
      this.sub?.unsubscribe();
      this.text.set(null);
      this.failed.set(false);

      if (item?.kind === 'text') {
        this.sub = this.http.get(item.url, { responseType: 'text' }).subscribe({
          next: t => this.text.set(t),
          error: () => this.failed.set(true),
        });
      }
    });

    effect(() => this.closeBtn()?.nativeElement.focus());
  }

  protected close(): void {
    this.lb.close();
  }
}
