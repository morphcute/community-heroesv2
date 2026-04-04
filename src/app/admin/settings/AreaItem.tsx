"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function AreaItem({ area, allHandlers, updateAction, deleteAction }: { area: any, allHandlers: any[], updateAction: (fd: FormData) => void, deleteAction: (fd: FormData) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(area.name);
  const [type, setType] = useState(area.type);
  const [coveredLocations, setCoveredLocations] = useState(area.coveredLocations?.join(", ") || "");
  const [activeHandlerIds, setActiveHandlerIds] = useState<Set<string>>(new Set(area.handlers?.map((h: any) => h.id) || []));

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 bg-black border border-orange-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-1 shadow-lg">
         <input value={name} onChange={e => setName(e.target.value)} placeholder="Area Name..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50" />
         <input value={coveredLocations} onChange={e => setCoveredLocations(e.target.value)} placeholder="Provinces (comma separated)" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400 outline-none focus:border-orange-500/50" />
         
         <div className="flex flex-col gap-3 mt-1 pt-3 border-t border-white/5">
           <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">Assign Moderators ({activeHandlerIds.size})</span>
           <div className="flex flex-wrap gap-2">
             {allHandlers?.map((h: any) => {
               const isActive = activeHandlerIds.has(h.id);
               return (
                 <label key={h.id} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-black border-white/5 hover:border-white/10'}`}>
                   <input type="checkbox" checked={isActive} onChange={(e) => {
                     const newSet = new Set(activeHandlerIds);
                     if (e.target.checked) newSet.add(h.id);
                     else newSet.delete(h.id);
                     setActiveHandlerIds(newSet);
                   }} className="accent-cyan-500 w-3.5 h-3.5" />
                   <div className="flex items-center gap-1.5">
                     {h.image ? <img src={h.image} className="w-4 h-4 rounded-full object-cover" alt="Avatar"/> : null}
                     <span className={`text-[11px] font-bold ${isActive ? 'text-cyan-400' : 'text-gray-400'}`}>{h.name || h.email}</span>
                   </div>
                 </label>
               );
             })}
           </div>
         </div>

         <div className="flex justify-between items-center gap-2 mt-2 pt-3 border-t border-white/5">
           <select value={type} onChange={e => setType(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50">
             <option value="SOLO">Solo Area</option>
             <option value="MULTIPLE">Multiple Area</option>
           </select>
           <div className="flex gap-2 shrink-0">
             <button onClick={() => { setIsEditing(false); setName(area.name); setType(area.type); setCoveredLocations(area.coveredLocations?.join(", ") || ""); setActiveHandlerIds(new Set(area.handlers?.map((h: any) => h.id) || [])); }} className="text-gray-400 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors font-bold text-xs flex items-center gap-1">
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
    <div className="flex justify-between items-start bg-black/40 border border-white/5 rounded-xl p-4 hover:bg-black/60 transition-colors shadow-sm">
      <div className="flex flex-col truncate pr-2 flex-1">
        <div className="flex items-center gap-2">
           <span className="text-[15px] font-black text-gray-200 truncate">{area.name}</span>
           <span className={`text-[9px] uppercase tracking-wider font-black w-fit px-2 py-0.5 rounded-full border ${area.type === 'MULTIPLE' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'}`}>
             {area.type === 'MULTIPLE' ? 'Multiple' : 'Solo'}
           </span>
        </div>
        
        {area.coveredLocations?.length > 0 && (
          <span className="text-[11px] text-gray-500 truncate mt-1 w-full max-w-[280px]">{area.coveredLocations.join(", ")}</span>
        )}
        
        <div className="flex -space-x-1.5 mt-3">
          {area.handlers?.length > 0 ? area.handlers.map((h: any) => (
            <div key={h.id} className="w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center text-[8px] font-black text-white shrink-0 shadow-lg relative z-10 hover:z-20 transform hover:scale-110 transition-all" title={h.name || h.email}>
              {h.image ? <img src={h.image} className="w-full h-full rounded-full object-cover" alt="Avatar"/> : (h.name || h.email)?.substring(0, 2).toUpperCase()}
            </div>
          )) : <span className="text-[10px] text-gray-600 border border-dashed border-gray-600/50 rounded-full px-2 py-0.5">Unassigned</span>}
        </div>
      </div>
      
      <div className="flex gap-1 shrink-0 ml-2">
        <button onClick={() => setIsEditing(true)} className="text-orange-400 hover:text-orange-300 hover:bg-orange-400/10 p-2 rounded-lg transition-colors">
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
