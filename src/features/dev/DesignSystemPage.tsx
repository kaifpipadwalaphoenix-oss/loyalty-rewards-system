import * as React from 'react';
import { Wordmark } from '@/components/brand/Wordmark';
import { WaveLine } from '@/components/brand/WaveLine';
import { TierChip } from '@/components/brand/TierChip';
import { PointsValue } from '@/components/brand/PointsValue';
import { Money } from '@/components/brand/Money';
import { MembershipCard } from '@/components/brand/MembershipCard';
import { RewardCard } from '@/components/brand/RewardCard';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Field } from '@/components/forms/Field';
import { PhoneInput } from '@/components/forms/PhoneInput';
import { CurrencyInput } from '@/components/forms/CurrencyInput';
import { OtpInput } from '@/components/forms/OtpInput';
import { DayMonthPicker, type DayMonthValue } from '@/components/forms/DayMonthPicker';
import { PinPad } from '@/components/forms/PinPad';
import { Panel } from '@/components/layout/Panel';
import { PageHeader } from '@/components/layout/PageHeader';
import { Section } from '@/components/layout/Section';
import { KpiBand, KpiItem } from '@/components/data/KpiBand';
import { EmptyState } from '@/components/data/EmptyState';
import { ErrorState } from '@/components/data/ErrorState';
import { Skeleton } from '@/components/data/Skeleton';
import { DataTable } from '@/components/data/DataTable';
import { brandImages } from '@/assets/brand/images';

export const DesignSystemPage: React.FC = () => {
  const [phone, setPhone] = React.useState('9876543210');
  const [paise, setPaise] = React.useState(499000);
  const [otp, setOtp] = React.useState('482913');
  const [dayMonth, setDayMonth] = React.useState<DayMonthValue>({ day: 14, month: 3 });
  const [pin, setPin] = React.useState('1234');

  const sampleTableData = [
    { id: '1', name: 'Tara Menon', mobile: '+91 90000 00002', tier: 'Tide', points: 1438 },
    { id: '2', name: 'Kabir Malhotra', mobile: '+91 90000 00003', tier: 'Shore', points: 1000 },
    { id: '3', name: 'Zoya Siddiqui', mobile: '+91 90000 00004', tier: 'Golden Hour', points: 2850 },
  ];

  return (
    <div className="min-h-screen bg-shell-50 text-ink-900 pb-24">
      {/* Top Banner */}
      <div className="bg-blush-200 border-b border-sand-200 px-4 py-2 text-xs font-sans text-center">
        Trove Club Design System & Component Catalogue (Dev Only)
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-12">
        <PageHeader
          eyebrow="Trove Club Design Tokens"
          title="The Summer Ledger"
          subtitle="Editorial, white-framed identity for Trove Label. Playfair Display headings, Work Sans UI, square controls, and ocean Tide palette."
        />

        {/* 1. Brand Tokens & Typography */}
        <Section title="1. Brand & Typography">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Wordmark & Motif">
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-ink-500 font-sans block mb-1">Standard</span>
                  <Wordmark size="xl" />
                </div>
                <div className="bg-tide-800 p-4">
                  <span className="text-xs text-blush-200 font-sans block mb-1">Inverse (on Tide)</span>
                  <Wordmark size="xl" inverse />
                </div>
                <div>
                  <span className="text-xs text-ink-500 font-sans block mb-1">Signature Wave Line</span>
                  <WaveLine className="w-40 h-6 text-tide-800" strokeWidth={2} />
                </div>
              </div>
            </Panel>

            <Panel title="Typography Scale">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-ink-500 block">Playfair 400 (Display XL)</span>
                  <span className="font-serif text-3xl md:text-4xl">365 Days of Summer</span>
                </div>
                <div>
                  <span className="text-xs text-ink-500 block">Work Sans SemiBold (UI Title)</span>
                  <span className="font-sans font-semibold text-lg">Member Privileges & Benefits</span>
                </div>
                <div>
                  <span className="text-xs text-ink-500 block">Work Sans Regular (Body)</span>
                  <p className="font-sans text-sm text-ink-500 leading-relaxed">
                    Members earn 5 Trove Points for every ₹100 spent in store. Redeemable for exclusive treats.
                  </p>
                </div>
                <div className="flex gap-4 items-baseline">
                  <div>
                    <span className="text-xs text-ink-500 block">Money (en-IN)</span>
                    <Money paise={1499000} className="font-serif text-2xl text-ink-900" />
                  </div>
                  <div>
                    <span className="text-xs text-ink-500 block">Points (pts)</span>
                    <PointsValue points={1438} className="font-serif text-2xl text-coral-600" />
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        </Section>

        {/* 2. Membership Cards (Tier Accents) */}
        <Section title="2. Membership Cards (4 Tier Accents)">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MembershipCard
              name="Meera Iyer"
              memberNo="TC104581"
              tierName="Shore"
              tierRank={0}
              points={0}
              accent="shore"
            />
            <MembershipCard
              name="Tara Menon"
              memberNo="TC104582"
              tierName="Tide"
              tierRank={1}
              points={1438}
              accent="tide"
            />
            <MembershipCard
              name="Zoya Siddiqui"
              memberNo="TC104583"
              tierName="Golden Hour"
              tierRank={2}
              points={2850}
              accent="golden"
            />
            <MembershipCard
              name="Kavita Rao"
              memberNo="TC104584"
              tierName="Endless Summer"
              tierRank={3}
              points={6420}
              accent="endless"
            />
          </div>
        </Section>

        {/* 3. Button Primitives */}
        <Section title="3. Button Primitives">
          <Panel title="Variants and States">
            <div className="flex flex-wrap gap-4 items-center">
              <Button variant="primary">Primary (Near Black)</Button>
              <Button variant="secondary">Secondary (Outlined)</Button>
              <Button variant="brand">Brand (Tide)</Button>
              <Button variant="celebrate">Celebrate (Peach)</Button>
              <Button variant="ghost">Ghost Link</Button>
              <Button variant="danger">Danger (Reversal)</Button>
              <Button variant="primary" isLoading>
                Processing
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t border-sand-200 flex flex-wrap gap-3 items-center">
              <span className="text-xs text-ink-500 font-sans block w-full mb-1">Sizes</span>
              <Button size="sm">Small (36px)</Button>
              <Button size="md">Medium (44px)</Button>
              <Button size="lg">Large (52px)</Button>
              <Button size="xl">Counter Action (56px)</Button>
            </div>
          </Panel>
        </Section>

        {/* 4. Chips and Badges */}
        <Section title="4. Chips & Badges">
          <Panel title="Status & Tier Chips">
            <div className="flex flex-wrap gap-3 items-center">
              <TierChip tierName="Shore" accent="shore" />
              <TierChip tierName="Tide" accent="tide" />
              <TierChip tierName="Golden Hour" accent="golden" />
              <TierChip tierName="Endless Summer" accent="endless" />
              <Chip variant="success">Active Member</Chip>
              <Chip variant="warning">Expiring in 30 Days</Chip>
              <Chip variant="danger">Voided Purchase</Chip>
              <Chip variant="info">Couple Bonus</Chip>
              <Chip variant="neutral">Draft</Chip>
            </div>
          </Panel>
        </Section>

        {/* 5. Form Components */}
        <Section title="5. Form Components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Input Controls">
              <div className="space-y-4">
                <Field id="phone" label="Mobile Number">
                  <PhoneInput id="phone" value={phone} onChange={setPhone} />
                </Field>

                <Field id="amount" label="Purchase Amount (INR)">
                  <CurrencyInput id="amount" valuePaise={paise} onChangePaise={setPaise} />
                </Field>

                <Field id="birthday" label="Birthday" helperText="Day and month only">
                  <DayMonthPicker id="birthday" value={dayMonth} onChange={setDayMonth} />
                </Field>

                <Field id="err-sample" label="Input with Error" error="Enter a valid 10-digit mobile number">
                  <PhoneInput id="err-sample" value="123" hasError />
                </Field>
              </div>
            </Panel>

            <Panel title="OTP & Staff PIN Pad">
              <div className="space-y-8">
                <div>
                  <span className="text-xs font-sans font-medium text-ink-900 block mb-2 text-center">
                    Simulated 6-Digit OTP Input
                  </span>
                  <OtpInput value={otp} onChange={setOtp} />
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <span className="text-xs font-sans font-medium text-ink-900 block mb-4 text-center">
                    4-Digit Staff PIN Pad
                  </span>
                  <PinPad value={pin} onChange={setPin} />
                </div>
              </div>
            </Panel>
          </div>
        </Section>

        {/* 6. Reward Cards */}
        <Section title="6. Reward Cards">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <RewardCard
              id="rwd-1"
              name="₹250 off Resortwear"
              pointsCost={500}
              valueSummary="Valid on orders of ₹2,000 or more in physical stores."
              imageSrc={brandImages.rewards.discount250.src}
              imageAlt={brandImages.rewards.discount250.alt}
              eligibilityStatus="eligible"
            />
            <RewardCard
              id="rwd-2"
              name="Signature Printed Sarong"
              pointsCost={1500}
              valueSummary="Handcrafted resort piece in limited summer drop."
              imageSrc={brandImages.rewards.sarong.src}
              imageAlt={brandImages.rewards.sarong.alt}
              eligibilityStatus="points_short"
              eligibilityText="62 pts to go"
            />
            <RewardCard
              id="rwd-3"
              name="Private Styling Session"
              pointsCost={2500}
              valueSummary="One-on-one styling with refreshments."
              imageSrc={brandImages.rewards.styling.src}
              imageAlt={brandImages.rewards.styling.alt}
              eligibilityStatus="tier_locked"
              eligibilityText="Tide and above"
            />
          </div>
        </Section>

        {/* 7. KPI Band */}
        <Section title="7. KPI Band (Admin Metric Band)">
          <KpiBand columns={4}>
            <KpiItem label="Total Members" value="26" context="+3 in last 30 days" />
            <KpiItem label="Points Issued" value="18,450" context="≈ ₹9,225 value" />
            <KpiItem label="Points Redeemed" value="6,200" context="12 rewards claimed" />
            <KpiItem label="Outstanding Liability" value="₹16,420" context="32,840 pts held" />
          </KpiBand>
        </Section>

        {/* 8. Data Table */}
        <Section title="8. Data Table with Responsive Card Mode">
          <DataTable
            data={sampleTableData}
            keyExtractor={(i) => i.id}
            columns={[
              { id: 'name', header: 'Member Name', cell: (i) => i.name, sortable: true },
              { id: 'mobile', header: 'Mobile', cell: (i) => i.mobile },
              {
                id: 'tier',
                header: 'Tier',
                cell: (i) => (
                  <TierChip
                    tierName={i.tier}
                    accent={i.tier === 'Golden Hour' ? 'golden' : i.tier === 'Tide' ? 'tide' : 'shore'}
                  />
                ),
              },
              {
                id: 'points',
                header: 'Points',
                cell: (i) => <PointsValue points={i.points} />,
                align: 'right',
                sortable: true,
              },
            ]}
          />
        </Section>

        {/* 9. Feedback States */}
        <Section title="9. Feedback States">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              title="No vouchers yet"
              description="Your redeemed rewards and occasion treats will appear here. Browse the catalogue to treat yourself."
              action={<Button variant="primary">Explore Rewards</Button>}
            />
            <ErrorState
              title="Unable to load activity"
              description="Could not read the ledger data in this browser tab. Please retry or reset demo data."
              onRetry={() => alert('Retrying...')}
            />
          </div>

          <Panel title="Loading Shimmer">
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </Panel>
        </Section>
      </div>
    </div>
  );
};

export default DesignSystemPage;
