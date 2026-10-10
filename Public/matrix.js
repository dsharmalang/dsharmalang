class MatrixCanvas {
  constructor() {
    this.canvas = document.getElementById('matrix-canvas') || document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
    this.fontSize = 11;
    this.columns = [];
    this.characterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/\\|{}[]()!@#$%^&*+-=;:アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

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
    this.cols = Math.ceil(this.canvas.width / this.fontSize) + 10;
    this.buildColumns();
  }

  buildColumns() {
    this.columns = [];
    for (let i = 0; i < this.cols; i++) {
      this.columns.push({
        x: i * this.fontSize,
        y: Math.random() * this.canvas.height * 1.8,
        speed: 1.5 + Math.random() * 5,
        alpha: 0.4 + Math.random() * 0.8,
        chars: Array.from({ length: 50 }, () => this.randomChar()),
      });
    }
  }

  randomChar() {
    return this.characterSet[Math.floor(Math.random() * this.characterSet.length)];
  }

  drawColumn(column) {
    const radius = 350;
    const distX = column.x - this.pointer.x;
    const distY = column.y - this.pointer.y;
    const distance = Math.hypot(distX, distY);
    const influence = Math.max(0, 1 - distance / radius);

    if (this.pointer.active && influence > 0) {
      column.alpha *= 0.5;
      if (column.alpha < 0.01) column.alpha = 0.01;
    } else {
      column.alpha = Math.min(1, column.alpha + 0.08);
    }

    const textAlpha = column.alpha * (1 - influence * 0.88);

    this.ctx.shadowColor = `rgba(198, 243, 106, ${Math.max(textAlpha * 0.7, 0.15)})`;
    this.ctx.shadowBlur = 22;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    
    this.ctx.fillStyle = `rgba(198, 243, 106, ${textAlpha})`;
    this.ctx.textBaseline = 'top';

    for (let i = 0; i < column.chars.length; i++) {
      const yy = column.y + i * this.fontSize;
      if (yy > this.canvas.height + this.fontSize) continue;
      if (yy > -this.fontSize) {
        this.ctx.fillText(column.chars[i], column.x, yy);
      }
    }

    this.ctx.shadowBlur = 0;
    this.ctx.shadowColor = 'transparent';

    column.y += column.speed + influence * 1.5;
    if (column.y > this.canvas.height + this.fontSize) {
      column.y = -Math.random() * this.canvas.height;
      column.chars = Array.from({ length: 50 }, () => this.randomChar());
      column.alpha = 0.4 + Math.random() * 0.8;
    }

    if (Math.random() > 0.91) {
      const index = Math.floor(Math.random() * column.chars.length);
      column.chars[index] = this.randomChar();
    }
  }

  loop() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = 'rgba(198, 243, 106, 0.04)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvas.height; i += 5) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.canvas.width, i);
      this.ctx.stroke();
    }

    this.ctx.font = `bold ${this.fontSize}px "Cascadia Code", monospace`;
    this.columns.forEach((column) => this.drawColumn(column));
    requestAnimationFrame(() => this.loop());
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MatrixCanvas());
} else {
  new MatrixCanvas();
}
