import { Component, ElementRef, afterNextRender, output, viewChild } from '@angular/core';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LENGTH = 5;
const WIDTH = 170;
const HEIGHT = 52;

function randInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

@Component({
  selector: 'app-captcha',
  templateUrl: './captcha.html',
  styleUrl: './captcha.css',
})
export class Captcha {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private code = '';

  readonly refreshed = output<void>();

  constructor() {
    afterNextRender(() => this.generate());
  }

  matches(value: string | null | undefined): boolean {
    return !!this.code && (value ?? '').trim().toUpperCase() === this.code;
  }

  refresh(): void {
    this.generate();
    this.refreshed.emit();
  }

  private generate(): void {
    this.code = Array.from({ length: LENGTH }, () => ALPHABET[randInt(ALPHABET.length)]).join('');
    this.draw(this.code);
  }

  private draw(text: string): void {
    const canvas = this.canvas().nativeElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WIDTH * dpr;
    canvas.height = HEIGHT * dpr;
    canvas.style.width = `${WIDTH}px`;
    canvas.style.height = `${HEIGHT}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = '#eef0fb';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsla(${rand(0, 360)}, 50%, 55%, 0.6)`;
      ctx.lineWidth = rand(1, 2.2);
      ctx.beginPath();
      ctx.moveTo(rand(0, WIDTH), rand(0, HEIGHT));
      ctx.bezierCurveTo(
        rand(0, WIDTH), rand(0, HEIGHT),
        rand(0, WIDTH), rand(0, HEIGHT),
        rand(0, WIDTH), rand(0, HEIGHT),
      );
      ctx.stroke();
    }

    const step = WIDTH / (text.length + 1);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [...text].forEach((ch, i) => {
      ctx.save();
      ctx.translate(step * (i + 1), HEIGHT / 2 + rand(-5, 5));
      ctx.rotate(rand(-0.35, 0.35));
      ctx.font = `700 ${Math.round(rand(28, 34))}px "Segoe UI", system-ui, sans-serif`;
      ctx.fillStyle = `hsl(${rand(0, 360)}, 55%, 32%)`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    });

    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `hsla(${rand(0, 360)}, 40%, 40%, 0.5)`;
      ctx.fillRect(rand(0, WIDTH), rand(0, HEIGHT), 1.5, 1.5);
    }
  }
}
