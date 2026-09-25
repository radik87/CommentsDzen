import { Injectable, signal } from '@angular/core';
import { Attachment } from '../models/attachment';

@Injectable({ providedIn: 'root' })
export class LightboxService {
  readonly current = signal<Attachment | null>(null);
  private opener: HTMLElement | null = null;

  open(item: Attachment, opener?: HTMLElement | null): void {
    this.opener = opener ?? null;
    this.current.set(item);
  }

  close(): void {
    if (!this.current()) return;
    this.current.set(null);
    this.opener?.focus();
    this.opener = null;
  }
}
