// Matrix/Hacker background effect with cursor tracking
class CodeMatrix {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'matrix-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
      opacity: 0.15;
    `;
    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Code characters
    this.chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    this.charArray = this.chars.split('');
    
    // Matrix columns
    this.columns = [];
    this.cursorX = 0;
    this.cursorY = 0;
    this.cursorRadius = 150; // Cursor influence radius
    
    this.initColumns();
    this.animate();
    
    // Cursor tracking
    document.addEventListener('mousemove', (e) => {
      this.cursorX = e.clientX;
      this.cursorY = e.clientY;
    });
    
    // Touch tracking for mobile
    document.addEventListener('touchmove', (e) => {
      this.cursorX = e.touches[0].clientX;
      this.cursorY = e.touches[0].clientY;
    });
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.fontSize = 14;
    this.columns = [];
    this.initColumns();
  }

  initColumns() {
    const columnCount = Math.ceil(this.canvas.width / this.fontSize);
    for (let i = 0; i < columnCount; i++) {
      this.columns[i] = {
        x: i * this.fontSize,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        chars: []
      };
      // Pre-fill with characters
      for (let j = 0; j < 50; j++) {
        this.columns[i].chars.push(
          this.charArray[Math.floor(Math.random() * this.charArray.length)]
        );
      }
    }
  }

  getDistanceToCursor(x, y) {
    const dx = x - this.cursorX;
    const dy = y - this.cursorY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  animate() {
    this.ctx.fillStyle = 'rgba(245, 244, 239, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = `${this.fontSize}px 'Cascadia Code', monospace`;
    this.ctx.textBaseline = 'top';

    for (let col of this.columns) {
      // Check distance to cursor
      const distToCursor = this.getDistanceToCursor(col.x, col.y);
      const isNearCursor = distToCursor < this.cursorRadius;

      if (isNearCursor) {
        // Cursor zone - fade out / die
        col.opacity *= 0.8;
        if (col.opacity < 0.05) {
          col.opacity = 0.05;
          col.y = -this.fontSize;
        }
      } else {
        // Normal operation - fall down
        col.y += col.speed;
        if (col.y > this.canvas.height) {
          col.y = -this.fontSize;
          col.opacity = Math.random() * 0.5 + 0.3;
        }
      }

      // Draw characters
      let charIndex = 0;
      for (let i = 0; i < col.chars.length; i++) {
        const charY = col.y - i * this.fontSize;
        if (charY < this.canvas.height && charY > -this.fontSize) {
          const opacity = Math.max(0, 1 - (i * 0.08)) * col.opacity;
          this.ctx.fillStyle = `rgba(198, 243, 106, ${opacity})`; // Lime green
          this.ctx.fillText(col.chars[i], col.x, charY);
        }
      }

      // Occasionally change a character
      if (Math.random() > 0.95) {
        const randomIndex = Math.floor(Math.random() * col.chars.length);
        col.chars[randomIndex] = this.charArray[Math.floor(Math.random() * this.charArray.length)];
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CodeMatrix();
  });
} else {
  new CodeMatrix();
}
