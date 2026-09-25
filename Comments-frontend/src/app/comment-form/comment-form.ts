import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommentsService } from '../services/comments.service';
import { ALLOWED_TAGS, SafeCommentPipe } from '../pipes/safe-comment.pipe';
import { Captcha } from '../captcha/captcha';
import { PreparedFile, prepareFile } from '../utils/prepare-file';

type FieldName = 'userName' | 'email' | 'homePage' | 'text' | 'captcha';

function validTags(control: AbstractControl): ValidationErrors | null {
  const stack: string[] = [];
  const re = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(control.value ?? ''))) {
    const tag = m[1].toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return { forbiddenTag: tag };
    if (m[0].startsWith('</')) {
      if (stack.pop() !== tag) return { unclosedTag: true };
    } else {
      stack.push(tag);
    }
  }
  return stack.length ? { unclosedTag: true } : null;
}

@Component({
  selector: 'app-comment-form',
  imports: [ReactiveFormsModule, SafeCommentPipe, Captcha],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.css',
})
export class CommentForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(CommentsService);

  readonly parentId = input<string | null>(null);
  readonly created = output<void>();

  private readonly textArea = viewChild.required<ElementRef<HTMLTextAreaElement>>('ta');
  private readonly captcha = viewChild(Captcha);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly showPreview = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly attachment = signal<PreparedFile | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly preparing = signal(false);
  private fileToken = 0;

  protected readonly form = this.fb.group({
    userName: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    homePage: ['', [Validators.pattern(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i)]],
    text: ['', [Validators.required, validTags]],
    captcha: [
      '',
      [
        Validators.required,
        (c: AbstractControl): ValidationErrors | null =>
          this.captcha()?.matches(c.value) ? null : { captchaMismatch: true },
      ],
    ],
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      const url = this.previewUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  protected invalid(name: FieldName): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected onCaptchaRefreshed(): void {
    this.form.controls.captcha.reset();
  }

  protected async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.clearFile(false);
    if (!file) return;

    const token = ++this.fileToken;
    this.preparing.set(true);
    try {
      const prepared = await prepareFile(file);
      if (token !== this.fileToken) return;
      this.attachment.set(prepared);
      if (prepared.kind === 'image') {
        this.previewUrl.set(URL.createObjectURL(prepared.file));
      }
    } catch (e) {
      if (token !== this.fileToken) return;
      this.fileError.set(e instanceof Error ? e.message : 'Не удалось обработать файл.');
      input.value = '';
    } finally {
      if (token === this.fileToken) this.preparing.set(false);
    }
  }

  protected clearFile(resetInput = true): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set(null);
    this.attachment.set(null);
    this.fileError.set(null);
    if (resetInput) {
      const el = this.fileInput()?.nativeElement;
      if (el) el.value = '';
    }
  }

  protected sizeKb(bytes: number): string {
    return (bytes / 1024).toFixed(1);
  }

  protected wrap(tag: 'i' | 'strong' | 'code' | 'a'): void {
    const el = this.textArea().nativeElement;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const open = tag === 'a' ? '<a href="" title="">' : `<${tag}>`;
    const wrapped = `${open}${value.slice(s, e)}</${tag}>`;
    this.form.controls.text.setValue(value.slice(0, s) + wrapped + value.slice(e));
    this.form.controls.text.markAsDirty();
    el.focus();
  }

  protected submit(): void {
    if (this.preparing()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userName, email, homePage, text } = this.form.getRawValue();
    this.submitting.set(true);
    this.error.set(null);

    this.api
      .create(
        {
          text,
          parentId: this.parentId(),
          user: { userName, email, homePage: homePage || null },
        },
        this.attachment()?.file,
      )
      .subscribe({
        next: () => {
          this.form.controls.text.reset();
          this.clearFile();
          this.captcha()?.refresh();
          this.showPreview.set(false);
          this.submitting.set(false);
          this.created.emit();
        },
        error: () => {
          this.error.set('Не удалось отправить комментарий. Проверьте, что сервер запущен, и повторите.');
          this.submitting.set(false);
        },
      });
  }
}
