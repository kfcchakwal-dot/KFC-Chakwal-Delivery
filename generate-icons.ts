import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// High-fidelity SVG recreating the uploaded KFC Chakwal Delivery circular emblem
const svgLogo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Top KFC Banner Arc Path -->
    <!-- Arc from left to right for top KFC red banner text -->
    <path id="topArc" d="M 120,170 A 180,180 0 0,1 392,170" fill="none" />
    <!-- Bottom Chakwal Delivery Arc Path -->
    <path id="bottomArc" d="M 80,360 A 200,200 0 0,0 432,360" fill="none" />

    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Outer Black Ring -->
  <circle cx="256" cy="256" r="250" fill="#111111" />

  <!-- Inner White Ring -->
  <circle cx="256" cy="256" r="236" fill="#ffffff" />
  <circle cx="256" cy="256" r="226" fill="#111111" />

  <!-- Inner Main White Background -->
  <circle cx="256" cy="256" r="218" fill="#ffffff" />

  <!-- Decorative Black Side Arcs -->
  <path d="M 40,256 A 216,216 0 0,1 472,256" fill="none" stroke="#222222" stroke-width="40" stroke-linecap="butt" opacity="0.9" />

  <!-- Inner Clean White Center -->
  <circle cx="256" cy="256" r="198" fill="#ffffff" />

  <!-- Top KFC Red Banner -->
  <path d="M 124,192 C 145,100 367,100 388,192 C 340,166 172,166 124,192 Z" fill="#e4002b" filter="url(#shadow)" />
  
  <!-- KFC Text inside Red Banner -->
  <text x="256" y="162" text-anchor="middle" font-family="'Impact', 'Barlow Condensed', 'Arial Black', sans-serif" font-weight="900" font-style="italic" font-size="58" fill="#ffffff" letter-spacing="3">KFC</text>

  <!-- Delivery Scooter & Chicken Graphics in Center -->
  <g transform="translate(130, 200)">
    <!-- Speed Motion Lines behind scooter -->
    <line x1="-20" y1="40" x2="25" y2="40" stroke="#e4002b" stroke-width="5" stroke-linecap="round" />
    <line x1="-30" y1="52" x2="15" y2="52" stroke="#111111" stroke-width="5" stroke-linecap="round" />
    <line x1="-15" y1="64" x2="25" y2="64" stroke="#e4002b" stroke-width="5" stroke-linecap="round" />
    <line x1="-10" y1="96" x2="20" y2="96" stroke="#111111" stroke-width="5" stroke-linecap="round" />

    <!-- Scooter Cargo Box -->
    <rect x="25" y="16" width="70" height="50" rx="8" fill="#111111" />
    <rect x="29" y="20" width="62" height="42" rx="6" fill="#1e1e1e" />

    <!-- Crispy Fried Chicken Drumstick poking out of box -->
    <!-- Bone -->
    <g transform="translate(18, -12)">
      <!-- Bone knuckles -->
      <circle cx="6" cy="18" r="6" fill="#f4ede4" stroke="#111111" stroke-width="2.5" />
      <circle cx="16" cy="12" r="6" fill="#f4ede4" stroke="#111111" stroke-width="2.5" />
      <!-- Bone shaft -->
      <path d="M 12,18 L 32,36 L 24,44 L 8,24 Z" fill="#f4ede4" stroke="#111111" stroke-width="2" />
    </g>

    <!-- Crispy Fried Chicken Drumstick Meat -->
    <path d="M 40,24 C 30,5 65,-2 82,14 C 98,30 92,62 70,64 C 52,66 42,42 40,24 Z" fill="#e4002b" stroke="#111111" stroke-width="4" />
    <!-- Drumstick Highlight / Crisp texture -->
    <ellipse cx="64" cy="24" rx="14" ry="8" transform="rotate(-30 64 24)" fill="#ff4d6d" opacity="0.6" />
    <ellipse cx="76" cy="36" rx="4" ry="2" fill="#ffffff" opacity="0.8" />

    <!-- Scooter Seat & Body -->
    <path d="M 95,50 C 95,44 105,40 120,40 C 132,40 135,46 135,52 L 132,65 L 95,65 Z" fill="#111111" />

    <!-- Scooter Main Red Body Chassis -->
    <path d="M 45,66 C 55,60 110,60 115,70 L 145,95 L 180,95 C 185,95 188,90 185,80 L 175,45 C 172,38 180,34 186,34 L 195,34" fill="none" stroke="#e4002b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- Red Front Apron / Cowl -->
    <path d="M 172,42 L 184,80 C 186,88 178,102 165,102 L 140,102 L 126,82 Z" fill="#e4002b" stroke="#111111" stroke-width="3.5" />

    <!-- Handlebar & Headlight -->
    <line x1="168" y1="36" x2="198" y2="30" stroke="#111111" stroke-width="8" stroke-linecap="round" />
    <!-- Headlight -->
    <circle cx="198" cy="30" r="8" fill="#ffffff" stroke="#111111" stroke-width="3" />
    <path d="M 198,30 L 225,25 L 225,35 Z" fill="#ffe066" opacity="0.4" />

    <!-- Rear Fender & Mudguard -->
    <path d="M 30,80 C 35,56 95,56 100,80 L 98,90 L 32,90 Z" fill="#e4002b" stroke="#111111" stroke-width="3" />
    <path d="M 45,72 L 85,72" stroke="#111111" stroke-width="3" stroke-linecap="round" />

    <!-- Rear Wheel -->
    <circle cx="65" cy="98" r="24" fill="#111111" />
    <circle cx="65" cy="98" r="14" fill="#ffffff" stroke="#111111" stroke-width="3" />
    <circle cx="65" cy="98" r="6" fill="#111111" />

    <!-- Front Wheel -->
    <circle cx="195" cy="98" r="24" fill="#111111" />
    <circle cx="195" cy="98" r="14" fill="#ffffff" stroke="#111111" stroke-width="3" />
    <circle cx="195" cy="98" r="6" fill="#111111" />

    <!-- Ground Line -->
    <line x1="30" y1="124" x2="225" y2="124" stroke="#111111" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Bottom Curved Black Banner -->
  <path d="M 68,340 C 95,465 417,465 444,340 C 380,390 132,390 68,340 Z" fill="#111111" />

  <!-- White Curved Text: CHAKWAL DELIVERY -->
  <!-- Upper text path for perfect arched typography -->
  <path id="chakwalArc" d="M 96,370 Q 256,480 416,370" fill="none" />
  <text fill="#ffffff" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="34" letter-spacing="4">
    <textPath href="#chakwalArc" startOffset="50%" text-anchor="middle">
      CHAKWAL DELIVERY
    </textPath>
  </text>
</svg>`;

async function generateAssets() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save master SVG
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgLogo);
  console.log('Saved public/logo.svg');

  // Convert to PNG sizes using sharp
  const svgBuffer = Buffer.from(svgLogo);

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512.png'));
  console.log('Saved public/pwa-512.png');

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192.png'));
  console.log('Saved public/pwa-192.png');

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Saved public/apple-touch-icon.png');

  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Saved public/favicon.png');

  // Also save in src/assets/ for direct React imports
  const srcAssetsDir = path.resolve('src/assets');
  if (!fs.existsSync(srcAssetsDir)) {
    fs.mkdirSync(srcAssetsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(srcAssetsDir, 'logo.svg'), svgLogo);
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(srcAssetsDir, 'logo.png'));
  console.log('Saved src/assets/logo.svg and src/assets/logo.png');
}

generateAssets().catch((err) => {
  console.error(err);
  process.exit(1);
});
