import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Attachment, resolveAttachment } from '../models/attachment';
import { CommentDto } from '../models/comment.model';
import { SafeCommentPipe } from '../pipes/safe-comment.pipe';
import { CommentForm } from '../comment-form/comment-form';
import { LightboxService } from '../services/lightbox.service';

@Component({
  selector: 'app-comment-item',
  imports: [DatePipe, SafeCommentPipe, CommentForm],
  templateUrl: './comment-item.html',
  styleUrl: './comment-item.css',
})
export class CommentItem {
  readonly comment = input.required<CommentDto>();

  readonly showHeader = input(true);
  protected readonly replying = signal(false);
  private readonly lightbox = inject(LightboxService);

  protected readonly attachment = computed(() =>
    resolveAttachment(this.comment().filePath, this.comment().fileType),
  );

  protected readonly homeHref = computed(() => {
    const h = this.comment().user.homePage?.trim();
    if (!h) return null;
    return /^https?:\/\//i.test(h) ? h : `https://${h}`;
  });

  protected openAttachment(a: Attachment, event: Event): void {
    this.lightbox.open(a, event.currentTarget as HTMLElement);
  }
}
