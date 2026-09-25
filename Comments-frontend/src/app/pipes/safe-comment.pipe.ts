import { Pipe, PipeTransform } from '@angular/core';

export const ALLOWED_TAGS = new Set(['a', 'code', 'i', 'strong']);

const esc = (s: string) =>
  s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

@Pipe({ name: 'safeComment' })
export class SafeCommentPipe implements PipeTransform {
  transform(html: string | null | undefined): string {
    const doc = new DOMParser().parseFromString(html ?? '', 'text/html');
    return this.render(doc.body);
  }

  private render(parent: Node): string {
    let out = '';
    parent.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        out += esc(node.textContent ?? '');
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const inner = this.render(el);

      if (!ALLOWED_TAGS.has(tag)) {
        out += inner;
        return;
      }

      if (tag === 'a') {
        const href = el.getAttribute('href') ?? '';
        const safeHref = /^https?:\/\//i.test(href) ? esc(href) : '#';
        const title = esc(el.getAttribute('title') ?? '');
        out += `<a href="${safeHref}" title="${title}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
      } else {
        out += `<${tag}>${inner}</${tag}>`;
      }
    });
    return out;
  }
}
