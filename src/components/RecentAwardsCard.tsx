import { Shield, Users } from "lucide-react";
import Link from "next/link";

interface RecentAwardsCardProps {
  awards: { id: string; title: string; amount: number; currency: string }[];
}

export default function RecentAwardsCard({ awards }: RecentAwardsCardProps) {
  if (!awards || awards.length === 0) {
    return null;
  }
  return (
    <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-4 glass-card">
      <h3 className="text-sm font-bold text-white mb-2">Recent Awards</h3>
      <ul className="space-y-1 text-xs text-slate-400">
        {awards.map((a) => (
          <li key={a.id} className="flex justify-between items-center">
            <span>{a.title}</span>
            <span className="font-bold text-primary">
              {a.currency === "DIAMONDS" ? `${a.amount} 💎` : `$${a.amount}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
