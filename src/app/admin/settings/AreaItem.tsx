"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import AppSelect from "@/components/ui/AppSelect";

type AreaHandler = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

type AreaRecord = {
  id: string;
  name: string;
  type: string;
  coveredLocations: string[];
  handlers: AreaHandler[];
};

export default function AreaItem({
  area,
  allHandlers,
  updateAction,
  deleteAction,
}: {
  area: AreaRecord;
  allHandlers: AreaHandler[];
  updateAction: (fd: FormData) => void;
  deleteAction: (fd: FormData) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(area.name);
  const [type, setType] = useState(area.type);
  const [coveredLocations, setCoveredLocations] = useState(area.coveredLocations?.join(", ") || "");
  const [activeHandlerIds, setActiveHandlerIds] = useState<Set<string>>(new Set(area.handlers?.map((handler) => handler.id) || []));

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 bg-card border border-border rounded-xl p-4 animate-in fade-in slide-in-from-top-1 shadow-lg">
         <input value={name} onChange={e => setName(e.target.value)} placeholder="Area Name..." className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" />
         <input value={coveredLocations} onChange={e => setCoveredLocations(e.target.value)} placeholder="Provinces (comma separated)" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground outline-none focus:border-primary/50" />
         
         <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-border">
           <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Assign Moderators ({activeHandlerIds.size})</span>
           <div className="flex flex-wrap gap-2">
             {allHandlers?.map((h) => {
               const isActive = activeHandlerIds.has(h.id);
               return (
                 <label key={h.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${isActive ? 'bg-primary/10 border-primary/30' : 'bg-card border-border hover:border-border/80'}`}>
                   <input type="checkbox" checked={isActive} onChange={(e) => {
                     const newSet = new Set(activeHandlerIds);
                     if (e.target.checked) newSet.add(h.id);
                     else newSet.delete(h.id);
                     setActiveHandlerIds(newSet);
                   }} className="accent-primary w-3.5 h-3.5" />
                   <div className="flex items-center gap-1.5">
                     {h.image ? <img src={h.image} className="w-4 h-4 rounded-full object-cover" alt="Avatar"/> : null}
                     <span className={`text-[11px] font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{h.name || h.email}</span>
                   </div>
                 </label>
               );
             })}
           </div>
         </div>

         <div className="flex justify-between items-center gap-2 mt-2 pt-3 border-t border-border">
           <AppSelect
             value={type}
             onValueChange={setType}
             className="flex-1"
             placeholder="Select area type"
             options={[
               { value: "SOLO", label: "Solo Area" },
               { value: "MULTIPLE", label: "Multiple Area" },
             ]}
             triggerClassName="rounded-lg border-border bg-background px-3 py-2"
             contentClassName="rounded-xl"
           />
           <div className="flex gap-2 shrink-0">
             <button onClick={() => { setIsEditing(false); setName(area.name); setType(area.type); setCoveredLocations(area.coveredLocations?.join(", ") || ""); setActiveHandlerIds(new Set(area.handlers?.map((handler) => handler.id) || [])); }} className="text-muted-foreground px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors font-bold text-xs flex items-center gap-1">
               <X className="w-4 h-4" /> Cancel
             </button>
             <button onClick={async () => {
               const fd = new FormData();
               fd.append("id", area.id);
               fd.append("name", name);
               fd.append("type", type);
               fd.append("coveredLocations", coveredLocations);
               Array.from(activeHandlerIds).forEach(hid => fd.append("handlerIds", hid as string));
               await updateAction(fd);
               setIsEditing(false);
             }} className="text-black px-4 py-2 bg-primary rounded-lg hover:bg-yellow-400 transition-colors font-bold text-xs flex items-center gap-1">
               <Check className="w-4 h-4" /> Save Area
             </button>
           </div>
         </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-start bg-muted/40 border border-border rounded-xl p-4 hover:bg-muted transition-colors shadow-sm">
      <div className="flex flex-col truncate pr-2 flex-1">
        <div className="flex items-center gap-2">
           <span className="text-[15px] font-black text-foreground truncate">{area.name}</span>
           <span className={`text-[9px] uppercase tracking-wider font-black w-fit px-2 py-0.5 rounded-full border ${area.type === 'MULTIPLE' ? 'bg-muted border border-border text-muted-foreground' : 'bg-primary/10 text-primary border-primary/20'}`}>
             {area.type === 'MULTIPLE' ? 'Multiple' : 'Solo'}
           </span>
        </div>
        
        {area.coveredLocations?.length > 0 && (
          <span className="text-[11px] text-muted-foreground truncate mt-1 w-full max-w-[280px]">{area.coveredLocations.join(", ")}</span>
        )}
        
        <div className="flex -space-x-1.5 mt-3">
          {area.handlers?.length > 0 ? area.handlers.map((h) => (
            <div key={h.id} className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center text-[8px] font-black text-foreground shrink-0 shadow-lg relative z-10 hover:z-20 transform hover:scale-110 transition-all" title={h.name || h.email || undefined}>
              {h.image ? <img src={h.image} className="w-full h-full rounded-full object-cover" alt="Avatar"/> : (h.name || h.email)?.substring(0, 2).toUpperCase()}
            </div>
          )) : <span className="text-[10px] text-muted-foreground border border-dashed border-border rounded-full px-2 py-0.5">Unassigned</span>}
        </div>
      </div>
      
      <div className="flex gap-1 shrink-0 ml-2">
        <button onClick={() => setIsEditing(true)} className="text-primary hover:text-yellow-400 hover:bg-primary/10 p-2 rounded-lg transition-colors">
          <Pencil className="w-4 h-4" />
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={area.id} />
          <button type="submit" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
