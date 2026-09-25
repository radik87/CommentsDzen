import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommentDto } from '../models/comment.model';
import { CommentsService } from '../services/comments.service';
import { CommentItem } from '../comment-item/comment-item';

type SortKey = 'userName' | 'email' | 'createdAt';

@Component({
  selector: 'app-comment-list',
  imports: [DatePipe, CommentItem],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.css',
})
export class CommentList implements OnInit {
  protected readonly api = inject(CommentsService);

  protected readonly sortKey = signal<SortKey>('createdAt');

  protected readonly sortDir = signal<'asc' | 'desc'>('desc');

  protected readonly sorted = computed(() => {
    const k = this.sortKey();
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    const val = (c: CommentDto) =>
      k === 'createdAt' ? Date.parse(c.createdAt) : c.user[k].toLowerCase();

    return [...this.api.roots()].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      return (x < y ? -1 : x > y ? 1 : 0) * dir;
    });
  });

  ngOnInit(): void {
    this.api.load();
  }

  protected sortBy(key: SortKey): void {
    if (this.sortKey() === key) {
      this.sortDir.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  protected arrow(key: SortKey): string {
    return this.sortKey() === key ? (this.sortDir() === 'asc' ? '↑' : '↓') : '';
  }

  protected prevPage(): void {
    if (this.api.pageNumber() > 1) this.api.load(this.api.pageNumber() - 1);
  }

  protected nextPage(): void {
    if (this.api.pageNumber() < this.api.totalPages()) this.api.load(this.api.pageNumber() + 1);
  }

  protected ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }
}
