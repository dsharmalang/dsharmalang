class MatrixCanvas {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas') || document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
    this.fontSize = 18;
    this.columns = [];
    this.characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|{}[]()!@#$%^&*+-=;:';

    if (!this.canvas.parentNode) {
      document.body.insertBefore(this.canvas, document.body.firstChild);
    }

    this.resize();
    this.buildColumns();
    this.bindEvents();
    this.loop();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('pointermove', (event) => {
      this.pointer.x = event.clientX;
      this.pointer.y = event.clientY;
      this.pointer.active = true;
    });

    window.addEventListener('pointerleave', () => {
      this.pointer.active = false;
    });

    window.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (!touch) return;
      this.pointer.x = touch.clientX;
      this.pointer.y = touch.clientY;
      this.pointer.active = true;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.pointer.active = false;
    });
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.cols = Math.ceil(this.canvas.width / this.fontSize);
    this.buildColumns();
  }

  buildColumns() {
    this.columns = [];
    for (let i = 0; i < this.cols; i++) {
      this.columns.push({
        x: i * this.fontSize,
        y: Math.random() * this.canvas.height,
        speed: 1 + Math.random() * 2.2,
        alpha: 0.25 + Math.random() * 0.7,
        chars: Array.from({ length: 28 }, () => this.randomChar()),
      });
    }
  }

  randomChar() {
    return this.characterSet[Math.floor(Math.random() * this.characterSet.length)];
  }

  drawColumn(column) {
    const radius = 130;
    const distX = column.x - this.pointer.x;
    const distY = column.y - this.pointer.y;
    const distance = Math.hypot(distX, distY);
    const influence = Math.max(0, 1 - distance / radius);

    if (this.pointer.active && influence > 0) {
      column.alpha *= 0.82;
      if (column.alpha < 0.04) {
        column.alpha = 0.04;
      }
    } else {
      column.alpha = Math.min(1, column.alpha + 0.03);
    }

    const textAlpha = column.alpha * (1 - influence * 0.82);
    this.ctx.fillStyle = `rgba(198, 243, 106, ${textAlpha})`;

    for (let i = 0; i < column.chars.length; i++) {
      const yy = column.y + i * this.fontSize;
      if (yy > this.canvas.height + this.fontSize) continue;
      if (yy > -this.fontSize) {
        this.ctx.fillText(column.chars[i], column.x, yy);
      }
    }

    column.y += column.speed + influence * 0.8;
    if (column.y > this.canvas.height + this.fontSize) {
      column.y = -Math.random() * this.canvas.height;
      column.chars = Array.from({ length: 28 }, () => this.randomChar());
      column.alpha = 0.25 + Math.random() * 0.7;
    }

    if (Math.random() > 0.96) {
      const index = Math.floor(Math.random() * column.chars.length);
      column.chars[index] = this.randomChar();
    }
  }

  loop() {
    this.ctx.fillStyle = 'rgba(5, 11, 20, 0.12)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.font = `${this.fontSize}px "Cascadia Code", monospace`;

    this.columns.forEach((column) => this.drawColumn(column));
    requestAnimationFrame(() => this.loop());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MatrixCanvas());
} else {
  new MatrixCanvas();
}
