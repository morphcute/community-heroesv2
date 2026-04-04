import { useRouter } from "next/navigation";

import { updateRoles } from "../actions";
import { User, Shield, Sword, Axe, Zap, Crosshair, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface RoleSelectionFormProps {
  initialRoles: string[];
}

export default function RoleSelectionForm({ initialRoles }: RoleSelectionFormProps) {
  const roleIcons: Record<string, React.ComponentType<{ className?: string }>> = {
     'TANK_SUPPORT': Shield,
     'FIGHTER': Sword,
     'JUNGLER': Axe,
     'MAGE': Zap,
     'MARKSMAN': Crosshair
  };
  
  const roleMeta: Record<string, { label: string; lane: string; detail: string; accent: string }> = {
     'TANK_SUPPORT': { label: 'Roamer', lane: 'Roam', detail: 'Peel, vision, engage', accent: 'peer-checked:border-emerald-300/50 peer-checked:bg-emerald-300/10' },
     'FIGHTER': { label: 'EXP Laner', lane: 'EXP', detail: 'Duel and frontline pressure', accent: 'peer-checked:border-orange-300/50 peer-checked:bg-orange-300/10' },
     'JUNGLER': { label: 'Jungler', lane: 'Core', detail: 'Objectives, farm, and rotation', accent: 'peer-checked:border-violet-300/50 peer-checked:bg-violet-300/10' },
     'MAGE': { label: 'Mid Laner', lane: 'Mid', detail: 'Wave clear and burst control', accent: 'peer-checked:border-sky-300/50 peer-checked:bg-sky-300/10' },
     'MARKSMAN': { label: 'Gold Laner', lane: 'Gold', detail: 'Scaling damage dealer', accent: 'peer-checked:border-amber-300/50 peer-checked:bg-amber-300/10' }
  };

  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialRoles);
  const router = useRouter();

  // Sync with server state on revalidation
  useEffect(() => {
    setSelectedRoles(initialRoles);
  }, [initialRoles]);

  async function clientAction(formData: FormData) {
     await updateRoles(formData);
     setIsSuccess(true);
     router.refresh();
     setTimeout(() => setIsSuccess(false), 3000);
  }

  const handleRoleToggle = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(prev => prev.filter(r => r !== role));
    } else {
      setSelectedRoles(prev => [...prev, role]);
    }
  };

  return (
    <form action={clientAction} className="space-y-5">
      <div>
        <div className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-slate-500">
          Edit Preferred Roles
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick every lane you can confidently play so captains and teammates know where you fit best.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {['TANK_SUPPORT', 'FIGHTER', 'JUNGLER', 'MAGE', 'MARKSMAN'].map((role, idx) => {
          const Icon = roleIcons[role] || User;
          const isChecked = selectedRoles.includes(role);
          const meta = roleMeta[role];
          
          return (
          <label key={role} className="relative group cursor-pointer" style={{ animationDelay: `${idx * 100}ms` }}>
            <input 
              type="checkbox" 
              name="roles" 
              value={role} 
              checked={isChecked}
              onChange={() => handleRoleToggle(role)}
              className="peer sr-only"
            />
            <div className={`flex items-center gap-3 rounded-[1.1rem] border border-white/6 bg-white/[0.03] p-3 transition-all duration-300 hover:border-white/12 hover:bg-white/[0.05] group-hover:-translate-y-0.5 ${meta.accent}`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${isChecked ? 'border-primary/30 bg-primary text-black' : 'border-white/8 bg-secondary text-gray-400 group-hover:text-white'}`}>
                 <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                 <div className="flex items-center gap-2">
                    <div className="font-display text-sm font-black uppercase tracking-[0.05em] text-white">{meta.label}</div>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                      {meta.lane}
                    </span>
                 </div>
                 <div className="mt-1 text-[11px] text-gray-400">
                    {meta.detail}
                 </div>
              </div>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${isChecked ? 'border-primary bg-primary text-black' : 'border-white/10'}`}>
                 {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>
          </label>
          )
        })}
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-black uppercase tracking-[0.16em] text-black shadow-lg shadow-primary/20 transition-all hover:bg-yellow-400 btn-animate">
         {isSuccess ? (
            <>
               <CheckCircle2 className="w-4 h-4" /> Saved Successfully
            </>
         ) : (
            "Save Roles"
         )}
      </button>
    </form>
  );
}
