export interface ImageSlot {
  src: string;
  alt: string;
  credit?: string;
  fallbackGradient?: string;
}

export const brandImages = {
  landingHero: {
    src: '/images/brand/hero-resortwear.webp',
    alt: 'Trove Label resortwear collection — 365 days of summer',
    credit: 'Trove Club Editorial',
    fallbackGradient: 'linear-gradient(135deg, var(--sand-100), var(--blush-200))',
  },
  authSide: {
    src: '/images/brand/hero-resortwear.webp',
    alt: 'Trove Club membership editorial',
    credit: 'Trove Club Editorial',
    fallbackGradient: 'linear-gradient(135deg, var(--tide-900), var(--tide-800))',
  },
  dashboardBand: {
    src: '/images/brand/hero-resortwear.webp',
    alt: 'Trove ocean summer scene',
    credit: 'Trove Club Editorial',
    fallbackGradient: 'linear-gradient(135deg, var(--tide-100), var(--blush-100))',
  },
  tiers: {
    shore: { src: '/images/brand/tier-shore.webp', alt: 'Shore Tier - pastel sunrise ocean' },
    tide: { src: '/images/brand/tier-tide.webp', alt: 'Tide Tier - azure swirling ocean tide' },
    goldenHour: { src: '/images/brand/tier-golden-hour.webp', alt: 'Golden Hour Tier - amber coastal villa' },
    endlessSummer: { src: '/images/brand/tier-endless-summer.webp', alt: 'Endless Summer Tier - volcanic sunset' },
  },
  emptyState: {
    src: '/images/interim/landing-hero.svg',
    alt: 'Trove Club wave graphic',
    credit: 'Trove Club Design',
    fallbackGradient: 'linear-gradient(135deg, var(--shell-50), var(--blush-100))',
  },
  rewards: {
    discount250: {
      src: '/images/brand/reward-atelier-voucher.webp',
      alt: '₹250 off resortwear purchase of ₹2,000 or more',
    },
    discount600: {
      src: '/images/brand/reward-atelier-voucher.webp',
      alt: '₹600 off resortwear purchase of ₹4,000 or more',
    },
    percent10: {
      src: '/images/brand/reward-atelier-voucher.webp',
      alt: '10% off resortwear up to ₹1,500 savings',
    },
    tote: {
      src: '/images/brand/reward-tote.webp',
      alt: 'Trove canvas beach tote bag in natural cotton',
    },
    sarong: {
      src: '/images/brand/reward-swim-pouch.webp',
      alt: 'Signature printed resort swim pouch in handcrafted summer terracotta',
    },
    alterations: {
      src: '/images/brand/reward-resort-hat.webp',
      alt: 'Complimentary in-store garment alterations voucher',
    },
    styling: {
      src: '/images/brand/reward-styling-session.webp',
      alt: 'Private in-store resort styling appointment',
    },
    earlyAccess: {
      src: '/images/brand/hero-resortwear.webp',
      alt: 'VIP early access pass to the next collection drop',
    },
    scheduled: {
      src: '/images/brand/reward-styling-session.webp',
      alt: 'Resort weekend styling package with ₹3,000 gift voucher',
    },
    archived: {
      src: '/images/brand/reward-tote.webp',
      alt: 'Archived Summer 2025 beach tote',
    },
  },
} as const;

export type RewardImageKey = keyof typeof brandImages.rewards;

export function getTierImage(accent: 'shore' | 'tide' | 'golden' | 'endless'): ImageSlot {
  switch (accent) {
    case 'shore':
      return brandImages.tiers.shore;
    case 'tide':
      return brandImages.tiers.tide;
    case 'golden':
      return brandImages.tiers.goldenHour;
    case 'endless':
      return brandImages.tiers.endlessSummer;
    default:
      return brandImages.tiers.shore;
  }
}

export const INTERIM_IMAGES = [
  { key: 'reward-discount-250', label: '₹250 Voucher', src: brandImages.rewards.discount250.src, alt: brandImages.rewards.discount250.alt },
  { key: 'reward-discount-600', label: '₹600 Voucher', src: brandImages.rewards.discount600.src, alt: brandImages.rewards.discount600.alt },
  { key: 'reward-percent-10', label: '10% Voucher', src: brandImages.rewards.percent10.src, alt: brandImages.rewards.percent10.alt },
  { key: 'reward-tote', label: 'Beach Tote', src: brandImages.rewards.tote.src, alt: brandImages.rewards.tote.alt },
  { key: 'reward-sarong', label: 'Resort Sarong', src: brandImages.rewards.sarong.src, alt: brandImages.rewards.sarong.alt },
  { key: 'reward-alterations', label: 'Alterations', src: brandImages.rewards.alterations.src, alt: brandImages.rewards.alterations.alt },
  { key: 'reward-styling', label: 'Styling Session', src: brandImages.rewards.styling.src, alt: brandImages.rewards.styling.alt },
  { key: 'reward-early-access', label: 'Early Access', src: brandImages.rewards.earlyAccess.src, alt: brandImages.rewards.earlyAccess.alt },
];
