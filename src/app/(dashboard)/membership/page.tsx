import { Check, Crown, Shield, Sparkles, Star, Zap } from "lucide-react";
import { PageHero, PageShell, SurfaceCard } from "@/components/ui/PageShell";

export default function MembershipPage() {
  return (
    <PageShell size="wide">
      <PageHero
        eyebrow="Membership"
        icon={<Crown className="h-4 w-4" />}
        title={
          <>
            Upgrade your
            <span className="text-gradient-primary"> competitive kit</span>
          </>
        }
        description="Pick a plan that matches your grind, from casual ladder climbs to full-team management."
        stats={[
          { label: "Free", value: "$0" },
          { label: "Pro", value: "$9.99" },
          { label: "Team", value: "$29.99" },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <PlanCard
          icon={<Shield className="h-6 w-6 text-slate-300" />}
          title="Free"
          price="$0"
          subtitle="Perfect for getting started"
          tone="default"
          buttonLabel="Current Plan"
          buttonClassName="action-button-secondary w-full justify-center text-[11px]"
          features={["Join basic tournaments", "Create 1 team", "Basic stats tracking"]}
        />

        <PlanCard
          icon={<Crown className="h-6 w-6 text-primary" />}
          title="Pro"
          price="$9.99"
          subtitle="For competitive players"
          tone="gold"
          badge="Most Popular"
          buttonLabel="Upgrade to Pro"
          buttonClassName="action-button-primary w-full justify-center text-[11px]"
          features={[
            "Join all tournaments",
            "Create up to 5 teams",
            "Advanced analytics and insights",
            "Priority support",
            "Exclusive badges",
          ]}
        />

        <PlanCard
          icon={<Zap className="h-6 w-6 text-cyan-300" />}
          title="Team"
          price="$29.99"
          subtitle="For organized squads"
          tone="blue"
          buttonLabel="Get Team Plan"
          buttonClassName="action-button-secondary w-full justify-center text-[11px]"
          features={[
            "5 Pro memberships included",
            "Team branding customization",
            "Scrimmage finder priority",
            "Role scouting toolkit",
          ]}
        />
      </div>
    </PageShell>
  );
}

function PlanCard({
  icon,
  title,
  price,
  subtitle,
  features,
  tone,
  badge,
  buttonLabel,
  buttonClassName,
}: {
  icon: React.ReactNode;
  title: string;
  price: string;
  subtitle: string;
  features: string[];
  tone: "default" | "gold" | "blue";
  badge?: string;
  buttonLabel: string;
  buttonClassName: string;
}) {
  return (
    <SurfaceCard tone={tone} className="flex flex-col">
      {badge ? (
        <div className="absolute right-5 top-5 rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" />
          {badge}
        </div>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
          {icon}
        </div>
        <div className="mt-6">
          <h2 className="font-display text-3xl font-black uppercase tracking-[0.08em] text-white">
            {title}
            {title === "Pro" ? <Star className="ml-2 inline h-5 w-5 text-primary" /> : null}
          </h2>
          <div className="mt-3 font-display text-5xl font-black uppercase tracking-[0.06em] text-white">{price}</div>
          <div className="mt-2 text-sm text-slate-400">{subtitle}</div>
        </div>

        <div className="mt-8 flex-1 space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-slate-200">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Check className="h-3.5 w-3.5" />
              </div>
              {feature}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <button className={buttonClassName}>{buttonLabel}</button>
        </div>
      </div>
    </SurfaceCard>
  );
}
