const sharp = require('sharp');
const path = require('path');

const PUBLIC = path.join(__dirname, '..', 'public');

// A simple shopping cart icon as SVG
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#16a34a"/>
      <stop offset="100%" style="stop-color:#15803d"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#bg)"/>
  <!-- Shopping cart -->
  <g transform="translate(136, 156)" fill="none" stroke="white" stroke-width="28" stroke-linecap="round" stroke-linejoin="round">
    <!-- Cart body -->
    <path d="M0,180 L240,180 L210,60 L30,60 Z"/>
    <!-- Handle -->
    <path d="M60,60 L80,10"/>
    <path d="M180,60 L160,10"/>
    <!-- Wheels -->
    <circle cx="80" cy="226" r="24" fill="white"/>
    <circle cx="200" cy="226" r="24" fill="white"/>
    <!-- Price tag -->
    <rect x="80" y="100" width="80" height="50" rx="8" fill="white" stroke="none"/>
    <text x="120" y="133" font-family="Arial" font-size="28" font-weight="bold" fill="#16a34a" text-anchor="middle" stroke="none">$</text>
  </g>
</svg>`;

async function generate() {
  const buf = Buffer.from(svg);

  await sharp(buf).resize(192, 192).png().toFile(path.join(PUBLIC, 'icon-192.png'));
  console.log('Created icon-192.png');

  await sharp(buf).resize(512, 512).png().toFile(path.join(PUBLIC, 'icon-512.png'));
  console.log('Created icon-512.png');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err.message);
  process.exit(1);
});
