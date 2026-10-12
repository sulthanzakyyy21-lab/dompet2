const snow = {
  canvas: null,
  ctx: null,
  flakes: [],
  maxFlakes: 45,
  animId: null,
  isActive: true,

  init() {
    this.canvas = document.getElementById('snow-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Inisialisasi butiran salju
    this.flakes = [];
    for (let i = 0; i < this.maxFlakes; i++) {
      this.flakes.push(this.createFlake(true));
    }

    this.animate();
  },

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createFlake(randomY = false) {
    const width = this.canvas ? this.canvas.width : window.innerWidth;
    const height = this.canvas ? this.canvas.height : window.innerHeight;
    
    // Variasi radius partikel: partikel lembut 1.2px - 3.2px
    const radius = Math.random() * 2 + 1.2;
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -10,
      radius: radius,
      speedY: Math.random() * 0.9 + 0.4, // Kecepatan jatuh pelan dan anggun
      speedX: Math.random() * 0.5 - 0.25, // Sedikit hembusan angin horizontal
      swing: Math.random() * Math.PI * 2, // Sudut ayunan
      swingSpeed: Math.random() * 0.02 + 0.01,
      opacity: Math.random() * 0.45 + 0.25 // Opasitas lembut (tidak mengganggu teks)
    };
  },

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const width = this.canvas.width;
    const height = this.canvas.height;

    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];

      f.swing += f.swingSpeed;
      f.y += f.speedY;
      f.x += f.speedX + Math.sin(f.swing) * 0.4;

      // Jika salju keluar dari bawah atau samping layar, daur ulang ke atas
      if (f.y > height + 10) {
        this.flakes[i] = this.createFlake(false);
      }
      if (f.x > width + 10) {
        f.x = -10;
      } else if (f.x < -10) {
        f.x = width + 10;
      }

      // Gambar butiran salju dengan efek glowing lembut putih kebiruan
      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(224, 242, 254, ${f.opacity})`; // Warna soft sky/ice white
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = 'rgba(186, 230, 253, 0.4)';
      this.ctx.fill();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  },

  toggle() {
    this.isActive = !this.isActive;
    const btn = document.getElementById('toggle-snow-btn');
    if (this.isActive) {
      if (btn) btn.classList.add('text-sky-600', 'bg-sky-50');
      this.animate();
    } else {
      if (btn) btn.classList.remove('text-sky-600', 'bg-sky-50');
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.animId) cancelAnimationFrame(this.animId);
    }
  }
};
