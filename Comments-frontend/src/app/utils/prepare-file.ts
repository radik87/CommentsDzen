export const MAX_IMAGE_WIDTH = 320;
export const MAX_IMAGE_HEIGHT = 240;
export const MAX_TEXT_BYTES = 100 * 1024;

export interface PreparedFile {
  file: File;
  kind: 'image' | 'text';

  resized: boolean;
}

const IMAGE_EXT = /\.(jpe?g|png|gif)$/i;
const TEXT_EXT = /\.txt$/i;
const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/gif']);

async function sniffImageFormat(file: File): Promise<'jpeg' | 'png' | 'gif' | null> {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return 'png';
  if (
    bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61
  ) return 'gif';
  return null;
}

async function looksLikeText(file: File): Promise<boolean> {
  const sample = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  if (sample.length === 0) return true;
  let suspicious = 0;
  for (const b of sample) {
    const isPrintable = b === 9 || b === 10 || b === 13 || (b >= 32 && b !== 127);
    if (!isPrintable) suspicious++;
  }
  return suspicious / sample.length < 0.05;
}

export async function prepareFile(file: File): Promise<PreparedFile> {
  const hasImageExt = IMAGE_EXT.test(file.name);
  const hasTextExt = TEXT_EXT.test(file.name);

  if (!hasImageExt && !hasTextExt) {
    throw new Error('Допустимые форматы: JPG, GIF, PNG и TXT.');
  }

  if (hasTextExt) {
    if (file.type && !file.type.startsWith('text/')) {
      throw new Error('Файл с расширением .txt должен быть текстовым.');
    }
    if (file.size > MAX_TEXT_BYTES) {
      throw new Error('Текстовый файл не должен быть больше 100 КБ.');
    }
    if (!(await looksLikeText(file))) {
      throw new Error('Похоже, это не текстовый файл. Допускается только формат TXT.');
    }
    return { file, kind: 'text', resized: false };
  }

  if (file.type && !IMAGE_MIME.has(file.type)) {
    throw new Error('Допустимые форматы изображений: JPG, GIF, PNG.');
  }
  const format = await sniffImageFormat(file);
  if (!format) {
    throw new Error('Файл не распознан как изображение JPG, GIF или PNG.');
  }
  return prepareImage(file);
}

async function prepareImage(file: File): Promise<PreparedFile> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('Не удалось прочитать изображение.');
  }

  try {
    const { width, height } = bitmap;

    if (width <= MAX_IMAGE_WIDTH && height <= MAX_IMAGE_HEIGHT) {
      return { file, kind: 'image', resized: false };
    }

    const scale = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Не удалось обработать изображение.');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, w, h);

    const isJpeg = /\.jpe?g$/i.test(file.name);
    const mime = isJpeg ? 'image/jpeg' : 'image/png';
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, mime, 0.9));
    if (!blob) throw new Error('Не удалось обработать изображение.');

    const name = isJpeg ? file.name : file.name.replace(/\.(png|gif)$/i, '.png');
    return { file: new File([blob], name, { type: mime }), kind: 'image', resized: true };
  } finally {
    bitmap.close();
  }
}
