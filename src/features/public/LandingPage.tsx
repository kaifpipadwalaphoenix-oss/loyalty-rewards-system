import React from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Wordmark';
import { TierChip } from '@/components/brand/TierChip';
import { ManagedImage } from '@/components/brand/ManagedImage';
import { brandImages, getTierImage } from '@/assets/brand/images';
import { Button } from '@/components/ui/button';
import { DemoBar } from '@/components/demo/DemoBar';
import { useAppData } from '@/hooks/useAppData';
import { Sparkles, Gift, Heart, ArrowRight } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const tiers = useAppData((d) => d.tiers);

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col">
      <DemoBar />

      {/* Navigation Header */}
      <header className="bg-sand-card/90 backdrop-blur-xs border-b border-sand-subtle sticky top-7 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Wordmark size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="px-2.5 sm:px-3">
                Sign In
              </Button>
            </Link>
            <Link to="/join">
              <Button size="sm" className="px-3">
                <span className="hidden sm:inline">Join Trove Club</span>
                <span className="sm:hidden">Join</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Editorial Photography (Direction D) */}
      <section className="relative overflow-hidden py-20 md:py-32 px-6 border-b border-sand-subtle">
        <div className="absolute inset-0 z-0">
          <ManagedImage
            src={brandImages.landingHero.src}
            alt={brandImages.landingHero.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-[#FAF6F1]/95 via-[#FAF6F1]/85 to-[#FAF6F1]/60 md:to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="max-w-xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sand/90 backdrop-blur-xs border border-sand-subtle text-xs uppercase font-bold tracking-widest text-tide">
              <Sparkles className="w-3.5 h-3.5 text-terracotta" />
              365 Days of Summer Loyalty
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-charcoal tracking-tight font-normal leading-[1.1]">
              Your summer, <br />
              <span className="italic">rewarded.</span>
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted leading-relaxed">
              Welcome to Trove Club. Earn Trove Points on every resortwear piece, unlock bespoke atelier rewards, and enjoy elevated milestone celebrations.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/join">
                <Button size="lg" className="w-full sm:w-auto bg-tide text-white hover:bg-tide/90">
                  Join Trove Club
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-sand-card/90 backdrop-blur-xs">
                  Member Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 px-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-3">
            <div className="w-10 h-10 bg-sand border border-sand-subtle flex items-center justify-center mx-auto text-tide">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal font-semibold">Earn on Every Piece</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Earn 5 Trove Points for every ₹100 spent in-store at the Trove store. Points accrue automatically on your single account.
            </p>
          </div>

          <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-3">
            <div className="w-10 h-10 bg-sand border border-sand-subtle flex items-center justify-center mx-auto text-tide">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal font-semibold">Milestone Celebrations</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Unlock annual birthday bonus points, anniversary treat or shopping vouchers, and companion couple-visit perks.
            </p>
          </div>

          <div className="bg-sand-card p-6 border border-sand-subtle shadow-2xs space-y-3">
            <div className="w-10 h-10 bg-sand border border-sand-subtle flex items-center justify-center mx-auto text-tide">
              <Gift className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-charcoal font-semibold">Curated Atelier Rewards</h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              Redeem points for instant shopping vouchers, artisanal resort accessories, private styling sessions, and seasonal previews.
            </p>
          </div>
        </div>
      </section>

      {/* Membership Tiers Preview with Tier Photography (Direction D) */}
      <section className="py-14 px-6 bg-sand-card border-y border-sand-subtle">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <p className="text-xs uppercase tracking-widest text-tide font-bold">The Tiers of Trove</p>
            <h2 className="font-serif text-3xl text-charcoal">Sun-Drenched Privileges</h2>
            <p className="text-xs text-charcoal-muted max-w-md mx-auto">
              Your tier reflects qualifying resortwear purchases in the rolling 12 months.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-sand border border-sand-subtle flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="relative h-32 w-full overflow-hidden bg-sand">
                  <ManagedImage
                    src={getTierImage(tier.accent).src}
                    alt={getTierImage(tier.accent).alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-charcoal/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-serif font-semibold text-base drop-shadow-xs">{tier.name}</span>
                    <TierChip tier={tier} size="sm" />
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-semibold text-tide mb-1">
                      {tier.thresholdPaise === 0
                        ? 'Entry Level'
                        : `From ₹${(tier.thresholdPaise / 100).toLocaleString('en-IN')}`}
                    </p>
                    <p className="text-xs text-charcoal-muted leading-relaxed line-clamp-2">{tier.description}</p>
                  </div>
                  <div className="border-t border-sand-subtle pt-2.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-charcoal-muted block mb-0.5">
                      Earn Rate
                    </span>
                    <span className="text-xs font-semibold text-charcoal">
                      +{tier.earnBonusPct}% points multiplier
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal text-sand text-xs mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <Wordmark size="md" />
            <p className="text-sand/60 text-[11px]">
              Trove Label resortwear &amp; swimwear loyalty programme prototype.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-sand/80 font-medium">
            <Link to="/login" className="hover:text-sand transition-colors">
              Member Sign In
            </Link>
            <Link to="/join" className="hover:text-sand transition-colors">
              Join Programme
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
