import fs from 'fs';
import path from 'path';

const dir = path.join('public', 'images', 'interim');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function makeSvg(title, subtitle, bg1, bg2, accent, iconType) {
  let icon = '';
  if (iconType === 'sun') {
    icon = `<circle cx="200" cy="180" r="48" fill="${accent}" opacity="0.85" />
            <path d="M200 110v16M200 234v16M130 180h16M254 180h16M150 130l12 12M238 218l12 12M150 230l12-12M238 142l12-12" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" />`;
  } else if (iconType === 'tote') {
    icon = `<path d="M150 170c0-28 22-50 50-50s50 22 50 50" fill="none" stroke="${accent}" stroke-width="3" />
            <path d="M130 170h140l-15 110H145z" fill="${accent}" opacity="0.25" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round" />
            <line x1="170" y1="170" x2="170" y2="240" stroke="${accent}" stroke-width="2" />
            <line x1="230" y1="170" x2="230" y2="240" stroke="${accent}" stroke-width="2" />`;
  } else if (iconType === 'sarong') {
    icon = `<path d="M140 140c30-10 90 20 120 0l-10 130c-40 15-80-15-110 0z" fill="${accent}" opacity="0.3" stroke="${accent}" stroke-width="2.5" />
            <path d="M160 160c20 20 40 10 60 30M150 200c25 15 50 10 70 25" stroke="${accent}" stroke-width="2" stroke-linecap="round" fill="none" />`;
  } else if (iconType === 'dress') {
    icon = `<path d="M175 130l25 20 25-20 15 30-15 110h-65l-15-110z" fill="${accent}" opacity="0.25" stroke="${accent}" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M175 130c12 15 38 15 50 0" stroke="${accent}" stroke-width="2" fill="none" />`;
  } else if (iconType === 'scissor') {
    icon = `<circle cx="170" cy="240" r="16" fill="none" stroke="${accent}" stroke-width="2.5" />
            <circle cx="230" cy="240" r="16" fill="none" stroke="${accent}" stroke-width="2.5" />
            <line x1="182" y1="228" x2="230" y2="140" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" />
            <line x1="218" y1="228" x2="170" y2="140" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" />`;
  } else if (iconType === 'sparkle') {
    icon = `<path d="M200 130l10 35 35 10-35 10-10 35-10-35-35-10 35-10z" fill="${accent}" opacity="0.85" />
            <path d="M235 220l5 15 15 5-15 5-5 15-5-15-15-5 15-5z" fill="${accent}" opacity="0.6" />`;
  } else {
    icon = `<path d="M120 200c25-15 50 15 80 0s50-15 80 0" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" />
            <path d="M130 225c25-15 50 15 80 0s50-15 70 0" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity="0.6" />`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bg1}" />
      <stop offset="100%" stop-color="${bg2}" />
    </linearGradient>
  </defs>
  <rect width="400" height="480" fill="url(#grad)" />
  <g>${icon}</g>
  <path d="M40 370c40-10 60 10 100 0s60-10 100 0 60 10 100 0" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4" />
  <text x="200" y="415" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#141414" text-anchor="middle" letter-spacing="1">${title}</text>
  <text x="200" y="442" font-family="system-ui, sans-serif" font-size="11" font-weight="600" text-transform="uppercase" fill="#5E5A57" text-anchor="middle" letter-spacing="2.5">${subtitle}</text>
</svg>`;
}

const assets = [
  { file: 'landing-hero.svg', title: '365 Days of Summer', sub: 'Trove Label · Resort & Swim', b1: '#FAF6F3', b2: '#F1DDD6', acc: '#0F3D4A', icon: 'sun' },
  { file: 'auth-side.svg', title: 'Your Summer, Rewarded', sub: 'Trove Club Membership', b1: '#0F3D4A', b2: '#0B2E38', acc: '#F2C0AE', icon: 'sparkle' },
  { file: 'reward-discount-250.svg', title: 'Resortwear Voucher', sub: '₹250 off ₹2,000+', b1: '#FAF6F3', b2: '#F8ECE7', acc: '#0F3D4A', icon: 'dress' },
  { file: 'reward-discount-600.svg', title: 'Summer Wardrobe Treat', sub: '₹600 off ₹4,000+', b1: '#FAF6F3', b2: '#F1DDD6', acc: '#C9A24A', icon: 'dress' },
  { file: 'reward-percent-10.svg', title: 'Member Privileges', sub: '10% off up to ₹1,500', b1: '#F8ECE7', b2: '#F2C0AE', acc: '#141414', icon: 'sparkle' },
  { file: 'reward-tote.svg', title: 'Canvas Beach Tote', sub: 'Member Complimentary Gift', b1: '#FAF6F3', b2: '#E6E0D7', acc: '#0F3D4A', icon: 'tote' },
  { file: 'reward-sarong.svg', title: 'Signature Printed Sarong', sub: 'Handcrafted Resort Piece', b1: '#F8ECE7', b2: '#F1DDD6', acc: '#A8432B', icon: 'sarong' },
  { file: 'reward-alterations.svg', title: 'Complimentary Alterations', sub: 'Perfect Resort Fit', b1: '#FAF6F3', b2: '#F3EFE9', acc: '#0F3D4A', icon: 'scissor' },
  { file: 'reward-styling.svg', title: 'Private Styling Session', sub: 'In-Store Experience', b1: '#0F3D4A', b2: '#0B2E38', acc: '#C9A24A', icon: 'sparkle' },
  { file: 'reward-early-access.svg', title: 'New Drop Preview', sub: 'Priority Collection Access', b1: '#F1DDD6', b2: '#E3EEF0', acc: '#0F3D4A', icon: 'sun' },
  { file: 'reward-scheduled.svg', title: 'Resort Weekend Package', sub: 'Styling + ₹3,000 Voucher', b1: '#0F3D4A', b2: '#0B2E38', acc: '#F2C0AE', icon: 'sparkle' },
  { file: 'reward-archived.svg', title: "Summer '25 Tote", sub: 'Archive Drop', b1: '#E6E0D7', b2: '#8C8682', acc: '#2B2826', icon: 'tote' }
];

for (const a of assets) {
  fs.writeFileSync(path.join(dir, a.file), makeSvg(a.title, a.sub, a.b1, a.b2, a.acc, a.icon));
}
console.log('Created', assets.length, 'interim assets in', dir);
