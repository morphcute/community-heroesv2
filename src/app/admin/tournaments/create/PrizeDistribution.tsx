"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import AppSelect from "@/components/ui/AppSelect";

type PrizeDistributionPayload = {
  currency?: string;
  distribution?: Array<{
    rank: number;
    amount: number;
  }>;
};

export function PrizeDistribution({ initialPrizes }: { initialPrizes?: string }) {
  let defaultPrizes = [{ place: "1", amount: "", currency: "Diamonds" }];

  if (initialPrizes) {
    try {
      if (initialPrizes.trim().startsWith("{") || initialPrizes.trim().startsWith("[")) {
        const parsed = JSON.parse(initialPrizes) as PrizeDistributionPayload;
        if (parsed && parsed.distribution && parsed.distribution.length > 0) {
          defaultPrizes = parsed.distribution.map((d) => ({
            place: d.rank.toString(),
            amount: d.amount.toString(),
            currency: parsed.currency || "Diamonds",
          }));
        }
      } else {
        const parts = initialPrizes.split(" | ");
        if (parts.length > 0 && parts[0].includes(":")) {
          defaultPrizes = parts.map((part) => {
            const [placePart, rest] = part.split(": ");
            const [amount, currency] = rest ? rest.trim().split(" ") : ["", "Diamonds"];
            return {
              place: placePart ? placePart.trim() : "",
              amount: amount ? amount.trim() : "",
              currency: currency ? currency.trim() : "Diamonds",
            };
          });
        }
      }
    } catch {
      // Ignore malformed legacy values so the form still renders.
    }
  }

  const [prizes, setPrizes] = useState(defaultPrizes);

  const addPrize = () => {
    setPrizes([...prizes, { place: (prizes.length + 1).toString(), amount: "", currency: "Diamonds" }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: string, value: string) => {
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };

  const totalAmount = prizes.reduce((sum, prize) => sum + (Number(prize.amount) || 0), 0);
  const compiledPrizeString = JSON.stringify({
    total: totalAmount,
    currency: "Diamonds",
    distribution: prizes
      .filter((prize) => prize.amount)
      .map((prize) => ({
        rank: parseInt(prize.place, 10) || 1,
        amount: Number(prize.amount),
      })),
  });

  return (
    <div className="col-span-1 mt-2 space-y-4 border-t border-white/5 pt-6 md:col-span-2 lg:col-span-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-black uppercase tracking-widest text-white">Prizing & Distribution Bracket</label>
          <p className="mt-1 text-xs text-gray-500">Configure exactly what each placement wins in Diamonds or cash.</p>
        </div>
        <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-400">
          Final Payout: {prizes.filter((prize) => prize.amount).length} Tiers
        </div>
      </div>

      <input type="hidden" name="prizePool" value={compiledPrizeString} />

      <div className="space-y-3">
        {prizes.map((prize, index) => (
          <div className="flex items-center gap-3" key={index}>
            <input
              type="text"
              value={prize.place}
              onChange={(e) => updatePrize(index, "place", e.target.value)}
              className="w-1/3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-bold text-white outline-none focus:border-blue-500/50"
              placeholder="e.g. Champion"
            />
            <input
              type="number"
              value={prize.amount}
              onChange={(e) => updatePrize(index, "amount", e.target.value)}
              className="w-1/3 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-black text-[#FFD700] outline-none focus:border-blue-500/50"
              placeholder="Amount (e.g. 4000)"
            />
            <AppSelect
              value={prize.currency}
              onValueChange={(value) => updatePrize(index, "currency", value)}
              className="w-1/4"
              placeholder="Currency"
              options={[
                { value: "Diamonds", label: "Diamonds" },
                { value: "USD", label: "USD ($)" },
                { value: "PHP", label: "PHP" },
              ]}
              triggerClassName="px-4 py-3"
            />
            {prizes.length > 1 ? (
              <button
                title="Remove Tier"
                type="button"
                onClick={() => removePrize(index)}
                className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        ))}

        <button
          type="button"
          onClick={addPrize}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-4 text-sm font-bold uppercase tracking-wider text-gray-400 transition-all hover:border-white/50 hover:bg-white/5 hover:text-white"
        >
          <Plus className="h-5 w-5" /> Add Placement Tier
        </button>
      </div>
    </div>
  );
}
