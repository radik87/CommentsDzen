import { route } from '../services/comments.service';

export type AttachmentKind = 'image' | 'text';

export interface Attachment {
  kind: AttachmentKind;

  url: string;
  name: string;
}

export function resolveAttachment(
  filePath?: string | null,
  fileType?: string | null,
): Attachment | null {
  if (!filePath) return null;

  const path = filePath.replace(/\\/g, '/').replace(/^\/?wwwroot\//i, route);
  const type = (fileType ?? '').toLowerCase();
  const ext = path.split('?')[0].split('.').pop()?.toLowerCase() ?? '';

  let kind: AttachmentKind | null = null;
  if (/image|png|jpe?g|gif/.test(type) || ['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
    kind = 'image';
  } else if (/text|txt/.test(type) || ext === 'txt') {
    kind = 'text';
  }
  if (!kind) return null;

  const url = /^https?:\/\//i.test(path) || path.startsWith('/') ? path : `/${path}`;
  return { kind, url, name: path.split('/').pop() || 'file' };
}
