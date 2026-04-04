"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function PrizeDistribution({ initialPrizes }: { initialPrizes?: string }) {
  let defaultPrizes = [{ place: "1", amount: "", currency: "Diamonds" }];
  
  if (initialPrizes) {
    try {
      if (initialPrizes.trim().startsWith("{") || initialPrizes.trim().startsWith("[")) {
        const parsed = JSON.parse(initialPrizes);
        if (parsed && parsed.distribution && parsed.distribution.length > 0) {
          defaultPrizes = parsed.distribution.map((d: any) => ({
            place: d.rank.toString(),
            amount: d.amount.toString(),
            currency: parsed.currency || "Diamonds"
          }));
        }
      } else {
        // Legacy String Splitter (e.g., "Champion: 50 Diamonds | 2nd Place: ...")
        const parts = initialPrizes.split(" | ");
        if (parts.length > 0 && parts[0].includes(":")) {
          defaultPrizes = parts.map(part => {
            const [placePart, rest] = part.split(": ");
            const [amount, currency] = rest ? rest.trim().split(" ") : ["", "Diamonds"];
            return {
              place: placePart ? placePart.trim() : "",
              amount: amount ? amount.trim() : "",
              currency: currency ? currency.trim() : "Diamonds"
            };
          });
        }
      }
    } catch (e) {
      // Silenced to prevent Next.js dev overlay from catching console.error during SSR hydration
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

  // Compile final JSON structure to ship to backend natively
  const totalAmount = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const compiledPrizeString = JSON.stringify({
    total: totalAmount,
    currency: "Diamonds",
    distribution: prizes.filter(p => p.amount).map(p => ({
      rank: parseInt(p.place) || 1,
      amount: Number(p.amount)
    }))
  });

  return (
    <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-4 mt-2 border-t border-white/5 pt-6">
      <div className="flex items-center justify-between">
         <div>
            <label className="text-sm font-black text-white uppercase tracking-widest">Prizing & Distribution Bracket</label>
            <p className="text-xs text-gray-500 mt-1">Configure exactly what each placement wins in Diamonds or Cash natively mapped globally.</p>
         </div>
         <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-xs rounded uppercase tracking-wider">
           Final Payout: {prizes.filter(p => p.amount).length} Tiers
         </div>
      </div>
      
      {/* Hidden input to inject the single compiled string into formData */}
      <input type="hidden" name="prizePool" value={compiledPrizeString} />

      <div className="space-y-3">
        {prizes.map((prize, index) => (
          <div className="flex items-center gap-3" key={index}>
            <input 
              type="text" 
              value={prize.place} 
              onChange={(e) => updatePrize(index, 'place', e.target.value)}
              className="w-1/3 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500/50 outline-none"
              placeholder="e.g. Champion"
            />
            <input 
              type="number" 
              value={prize.amount} 
              onChange={(e) => updatePrize(index, 'amount', e.target.value)}
              className="w-1/3 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-[#FFD700] focus:border-blue-500/50 outline-none"
              placeholder="Amount (e.g. 4000)"
            />
            <select 
              value={prize.currency} 
              onChange={(e) => updatePrize(index, 'currency', e.target.value)}
              className="w-1/4 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
            >
              <option value="Diamonds">Diamonds</option>
              <option value="USD">USD ($)</option>
              <option value="PHP">PHP (₱)</option>
            </select>
            {prizes.length > 1 && (
              <button title="Remove Tier" type="button" onClick={() => removePrize(index)} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        
        <button type="button" onClick={addPrize} className="flex items-center justify-center gap-2 w-full py-4 mt-2 px-4 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 hover:bg-white/5 text-sm font-bold uppercase tracking-wider transition-all">
          <Plus className="w-5 h-5" /> Add Placement Tier
        </button>
      </div>
    </div>
  );
}
