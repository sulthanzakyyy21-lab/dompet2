/**
 * Ambient Crystal Snowflake Animation (Frozen Ice Crystals)
 * Generates high-definition 6-fold radial symmetry ice crystals
 * inspired by intricate crystalline snowflake structures.
 */
const snow = {
  canvas: null,
  ctx: null,
  flakes: [],
  sprites: [],
  maxFlakes: 60,
  animId: null,
  isActive: true,

  // Color palettes inspired by Frozen ice crystals (light cyan, deep ice blue, electric azure)
  palettes: [
    // 1. Frozen Elsa / Iconic Crystal Ice (Exact match to reference image)
    {
      stroke: '#0284c7',
      facetFill: 'rgba(56, 189, 248, 0.65)',
      facetFillDark: 'rgba(2, 132, 199, 0.70)',
      highlight: '#f0f9ff',
      light: '#bae6fd',
      glow: 'rgba(56, 189, 248, 0.85)',
      coreFill: 'rgba(186, 230, 253, 0.9)'
    },
    // 2. Electric Sky Cyan (Vibrant light cyan)
    {
      stroke: '#0369a1',
      facetFill: 'rgba(125, 211, 252, 0.70)',
      facetFillDark: 'rgba(14, 165, 233, 0.75)',
      highlight: '#ffffff',
      light: '#7dd3fc',
      glow: 'rgba(14, 165, 233, 0.90)',
      coreFill: 'rgba(224, 242, 254, 0.95)'
    },
    // 3. Aqua Turquoise Ice (Mint / Sea Ice)
    {
      stroke: '#0e7490',
      facetFill: 'rgba(103, 232, 249, 0.65)',
      facetFillDark: 'rgba(6, 182, 212, 0.75)',
      highlight: '#f0fdfa',
      light: '#a5f3fc',
      glow: 'rgba(6, 182, 212, 0.85)',
      coreFill: 'rgba(207, 250, 254, 0.92)'
    },
    // 4. Royal Glacier Azure (Deep crystal blue)
    {
      stroke: '#1d4ed8',
      facetFill: 'rgba(96, 165, 250, 0.65)',
      facetFillDark: 'rgba(37, 99, 235, 0.75)',
      highlight: '#eff6ff',
      light: '#bfdbfe',
      glow: 'rgba(59, 130, 246, 0.85)',
      coreFill: 'rgba(219, 234, 254, 0.9)'
    },
    // 5. Luminous Frosted Diamond (Bright ice white & sky blue glow)
    {
      stroke: '#0284c7',
      facetFill: 'rgba(224, 242, 254, 0.80)',
      facetFillDark: 'rgba(186, 230, 253, 0.85)',
      highlight: '#ffffff',
      light: '#e0f2fe',
      glow: 'rgba(56, 189, 248, 0.95)',
      coreFill: '#ffffff'
    }
  ],

  init() {
    this.canvas = document.getElementById('snow-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Sesuaikan jumlah partikel berdasarkan ukuran layar (ringan di mobile)
    this.maxFlakes = window.innerWidth < 768 ? 32 : 60;

    this.resize();
    window.addEventListener('resize', () => {
      this.resize();
      this.maxFlakes = window.innerWidth < 768 ? 32 : 60;
    });

    // Buat sprite kristal salju resolusi tinggi (pre-rendered untuk performa maksimal 60fps)
    this.generateSprites();

    // Inisialisasi butiran kristal salju
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

  /**
   * Pre-render variasi kristal salju ke off-screen canvas.
   * Menggambar bentuk kristal segi enam (6-fold radial symmetry) lengkap dengan ujung tombak berlian,
   * sayap kristal lateral, berkas sekunder 12-titik, dan inti bercahaya persis seperti gambar referensi.
   */
  generateSprites() {
    this.sprites = [];
    this.palettes.forEach((palette, pIdx) => {
      // 2 variasi gaya untuk setiap palet (styler berlian lancip & kristal lebat)
      this.sprites.push(this.drawSnowflakeCanvas(palette, 1));
      this.sprites.push(this.drawSnowflakeCanvas(palette, 2));
    });
  },

  drawSnowflakeCanvas(palette, styleVariant) {
    const sCanvas = document.createElement('canvas');
    const size = 160; // Kanvas sprite beresolusi tinggi (160x160)
    sCanvas.width = size;
    sCanvas.height = size;
    const sCtx = sCanvas.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    const R = 64; // Jari-jari maksimum kristal

    sCtx.lineCap = 'round';
    sCtx.lineJoin = 'round';

    // Efek aura kristal bercahaya (glowing ice aura)
    sCtx.shadowColor = palette.glow;
    sCtx.shadowBlur = 6;

    // ==========================================
    // 1. Gambar 6 Lengan Utama (6-Fold Radial Symmetry)
    // ==========================================
    for (let arm = 0; arm < 6; arm++) {
      sCtx.save();
      sCtx.translate(cx, cy);
      sCtx.rotate((arm * Math.PI) / 3);

      // Tulang Punggung Lengan (Spine kristal)
      sCtx.beginPath();
      sCtx.moveTo(0, 0);
      sCtx.lineTo(0, -R);
      sCtx.strokeStyle = palette.light;
      sCtx.lineWidth = 1.6;
      sCtx.stroke();

      // --- Ujung Tombak Berlian Kristal (Spearhead Diamond Tip) ---
      sCtx.beginPath();
      sCtx.moveTo(0, -R); // Puncak terluar
      sCtx.lineTo(R * 0.11, -R * 0.82); // Sudut kanan
      sCtx.lineTo(0, -R * 0.65); // Sudut bawah
      sCtx.lineTo(-R * 0.11, -R * 0.82); // Sudut kiri
      sCtx.closePath();
      sCtx.fillStyle = palette.facetFill;
      sCtx.fill();
      sCtx.strokeStyle = palette.stroke;
      sCtx.lineWidth = 1.3;
      sCtx.stroke();

      // Garis kilau dalam pada ujung tombak
      sCtx.beginPath();
      sCtx.moveTo(0, -R);
      sCtx.lineTo(0, -R * 0.65);
      sCtx.strokeStyle = palette.highlight;
      sCtx.lineWidth = 1;
      sCtx.stroke();

      // --- Sayap Kristal Luar (Outer Chevron Wings) ---
      this.drawCrystalWing(sCtx, 0, -R * 0.63, R * 0.38, Math.PI / 5.2, palette);
      this.drawCrystalWing(sCtx, 0, -R * 0.63, R * 0.38, -Math.PI / 5.2, palette);

      // --- Sayap Kristal Tengah (Mid Chevron Wings) ---
      this.drawCrystalWing(sCtx, 0, -R * 0.44, R * 0.32, Math.PI / 4.8, palette);
      this.drawCrystalWing(sCtx, 0, -R * 0.44, R * 0.32, -Math.PI / 4.8, palette);

      // --- Faset Belah Ketupat Tengah (Mid Rhombus Facet) ---
      sCtx.beginPath();
      sCtx.moveTo(0, -R * 0.44);
      sCtx.lineTo(R * 0.085, -R * 0.33);
      sCtx.lineTo(0, -R * 0.22);
      sCtx.lineTo(-R * 0.085, -R * 0.33);
      sCtx.closePath();
      sCtx.fillStyle = palette.facetFillDark;
      sCtx.fill();
      sCtx.strokeStyle = palette.stroke;
      sCtx.lineWidth = 1.1;
      sCtx.stroke();

      // --- Sayap Kristal Pangkal (Inner Spurs) ---
      this.drawCrystalSpur(sCtx, 0, -R * 0.22, R * 0.18, Math.PI / 4.2, palette);
      this.drawCrystalSpur(sCtx, 0, -R * 0.22, R * 0.18, -Math.PI / 4.2, palette);

      sCtx.restore();
    }

    // ==========================================
    // 2. Berkas Kristal Sekunder Antar Lengan (12-Point Layered Depth)
    // ==========================================
    for (let arm = 0; arm < 6; arm++) {
      sCtx.save();
      sCtx.translate(cx, cy);
      sCtx.rotate((arm * Math.PI) / 3 + Math.PI / 6);

      const rSec = styleVariant === 1 ? R * 0.48 : R * 0.42;

      // Tombak berlian kecil di antara tiap lengan utama
      sCtx.beginPath();
      sCtx.moveTo(0, -rSec);
      sCtx.lineTo(R * 0.065, -rSec * 0.65);
      sCtx.lineTo(0, -rSec * 0.32);
      sCtx.lineTo(-R * 0.065, -rSec * 0.65);
      sCtx.closePath();
      sCtx.fillStyle = palette.facetFill;
      sCtx.fill();
      sCtx.strokeStyle = palette.stroke;
      sCtx.lineWidth = 1;
      sCtx.stroke();

      // Garis poros
      sCtx.beginPath();
      sCtx.moveTo(0, 0);
      sCtx.lineTo(0, -rSec);
      sCtx.strokeStyle = palette.highlight;
      sCtx.lineWidth = 0.9;
      sCtx.stroke();

      sCtx.restore();
    }

    // ==========================================
    // 3. Inti Bintang Faset Kristal (Central Multifaceted Core)
    // ==========================================
    sCtx.save();
    sCtx.translate(cx, cy);

    // Faset Bintang Heksagonal Inti
    sCtx.beginPath();
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const r = i % 2 === 0 ? R * 0.22 : R * 0.12;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) sCtx.moveTo(x, y);
      else sCtx.lineTo(x, y);
    }
    sCtx.closePath();
    sCtx.fillStyle = palette.coreFill;
    sCtx.fill();
    sCtx.strokeStyle = palette.highlight;
    sCtx.lineWidth = 1.3;
    sCtx.stroke();

    // Kilau Inti Pusat (Glowing Radial Center)
    const grad = sCtx.createRadialGradient(0, 0, 1, 0, 0, R * 0.14);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, palette.light);
    grad.addColorStop(0.7, palette.glow);
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    sCtx.beginPath();
    sCtx.arc(0, 0, R * 0.14, 0, Math.PI * 2);
    sCtx.fillStyle = grad;
    sCtx.fill();

    sCtx.restore();

    return sCanvas;
  },

  drawCrystalWing(ctx, startX, startY, length, angle, palette) {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.18, -length * 0.52);
    ctx.lineTo(0, -length);
    ctx.lineTo(-length * 0.18, -length * 0.52);
    ctx.closePath();

    ctx.fillStyle = palette.facetFill;
    ctx.fill();
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tulang sayap
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -length);
    ctx.strokeStyle = palette.highlight;
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  },

  drawCrystalSpur(ctx, startX, startY, length, angle, palette) {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length * 0.16, -length * 0.5);
    ctx.lineTo(0, -length);
    ctx.lineTo(-length * 0.16, -length * 0.5);
    ctx.closePath();

    ctx.fillStyle = palette.facetFillDark;
    ctx.fill();
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.restore();
  },

  createFlake(randomY = false) {
    const width = this.canvas ? this.canvas.width : window.innerWidth;
    const height = this.canvas ? this.canvas.height : window.innerHeight;

    // Ukuran kristal: kecil-kecil yang banyak (13px - 22px), sebagian sedang (23px - 30px), sedikit yang besar (32px - 38px)
    const rand = Math.random();
    let size;
    if (rand < 0.55) {
      size = Math.random() * 8 + 13; // Kecil 13px - 21px
    } else if (rand < 0.85) {
      size = Math.random() * 8 + 22; // Sedang 22px - 30px
    } else {
      size = Math.random() * 8 + 31; // Besar & detail 31px - 39px
    }

    // Pilih secara acak salah satu sprite kristal es beresolusi tinggi
    const sprite = this.sprites[Math.floor(Math.random() * this.sprites.length)];

    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -size - 10,
      size: size,
      sprite: sprite,
      speedY: Math.random() * 0.8 + 0.45, // Kecepatan melayang turun dengan anggun
      speedX: Math.random() * 0.5 - 0.25, // Sedikit hembusan horizontal
      swing: Math.random() * Math.PI * 2, // Sudut ayunan melayang
      swingSpeed: Math.random() * 0.02 + 0.008,
      rotation: Math.random() * Math.PI * 2, // Rotasi putaran kristal
      rotSpeed: (Math.random() - 0.5) * 0.015, // Putaran pelan yang elegan saat jatuh
      opacity: Math.random() * 0.25 + 0.72 // Opasitas tinggi (72% - 97%) agar jelas terlihat di layar putih
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
      f.rotation += f.rotSpeed;
      f.y += f.speedY;
      f.x += f.speedX + Math.sin(f.swing) * 0.5;

      // Jika kristal salju melewati batas bawah atau samping layar, daur ulang ke atas
      if (f.y > height + f.size + 15) {
        this.flakes[i] = this.createFlake(false);
      }
      if (f.x > width + f.size + 15) {
        f.x = -f.size;
      } else if (f.x < -f.size - 15) {
        f.x = width + f.size;
      }

      // Gambar sprite kristal salju dengan transformasi posisi, skala, rotasi, dan opasitas
      if (f.sprite) {
        this.ctx.save();
        this.ctx.translate(f.x, f.y);
        this.ctx.rotate(f.rotation);
        this.ctx.globalAlpha = f.opacity;
        this.ctx.drawImage(
          f.sprite,
          -f.size / 2,
          -f.size / 2,
          f.size,
          f.size
        );
        this.ctx.restore();
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  },

  toggle() {
    this.isActive = !this.isActive;
    const btn = document.getElementById('toggle-snow-btn');
    if (this.isActive) {
      if (btn) {
        btn.classList.add('text-sky-600', 'bg-sky-50/80', 'border-sky-200/70');
        btn.classList.remove('text-slate-400', 'bg-slate-100/60', 'border-slate-200');
      }
      this.animate();
    } else {
      if (btn) {
        btn.classList.remove('text-sky-600', 'bg-sky-50/80', 'border-sky-200/70');
        btn.classList.add('text-slate-400', 'bg-slate-100/60', 'border-slate-200');
      }
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      if (this.animId) cancelAnimationFrame(this.animId);
    }
  }
};
