import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { CommentDto, CreateCommentRequest, PagedComments } from '../models/comment.model';

export const route = 'https://localhost:44304/';
//export const route = 'https://commentsapi-bbgqb3g7gwdyfhbu.westus3-01.azurewebsites.net/';
const endPoint = `${route}api/Comment/`;
const DEFAULT_PAGE_SIZE = 25;

@Injectable({ providedIn: 'root' })
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly page = signal<PagedComments | null>(null);

  readonly loading = signal(false);
  readonly loadFailed = signal(false);

  readonly roots = computed(() => buildTree(this.page()?.comments ?? []));
  readonly pageNumber = computed(() => this.page()?.pageNumber ?? 1);
  readonly pageSize = computed(() => this.page()?.pageSize ?? DEFAULT_PAGE_SIZE);
  readonly totalItems = computed(() => this.page()?.totalItems ?? 0);
  readonly totalPages = computed(() => this.page()?.totalPages ?? 1);

  load(pageNumber: number = this.pageNumber()): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    const params = new HttpParams().set('pageNumber', pageNumber);
    this.http.get<PagedComments>(endPoint, { params }).subscribe({
      next: page => {
        this.page.set(page);
        this.loading.set(false);
      },
      error: () => {
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  create(body: CreateCommentRequest, file?: File | null) {
    return this.http.post(endPoint, toFormData(body, file)).pipe(tap(() => this.load()));
  }
}

function toFormData(body: CreateCommentRequest, file?: File | null): FormData {
  const fd = new FormData();
  fd.append('Text', body.text);
  if (body.parentId) fd.append('ParentId', body.parentId);
  fd.append('User.UserName', body.user.userName);
  fd.append('User.Email', body.user.email);
  if (body.user.homePage) fd.append('User.HomePage', body.user.homePage);

  if (file) fd.append('File', file, file.name);
  return fd;
}

function buildTree(pageComments: CommentDto[]): CommentDto[] {
  const flat: CommentDto[] = [];
  const collect = (list: CommentDto[] | undefined) => {
    for (const c of list ?? []) {
      flat.push(c);
      collect(c.replies);
    }
  };
  collect(pageComments);

  const byId = new Map<string, CommentDto>();
  [...flat]
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .forEach(c => byId.set(c.id, { ...c, replies: [] }));

  const roots: CommentDto[] = [];
  for (const c of byId.values()) {
    if (!c.parentId) {
      roots.push(c);
      continue;
    }
    const parent = byId.get(c.parentId);
    parent?.replies!.push(c);
  }
  return roots;
}
