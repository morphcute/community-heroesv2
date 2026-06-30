"use client";
import { useState } from "react";

const HANDLED_AREAS = [
  "Ilocos",
  "Batanes / Cagayan / Isabela / Nueva Vizcaya / Quirino",
  "Baguio / La Union / Pangasinan",
  "Nueva Ecija / Aurora",
  "Bataan / Zambales",
  "Tarlac",
  "Pampanga",
  "Caloocan / Valenzuela / Malabon / Navotas",
  "Quezon City / Marikina",
  "Makati / Pasay",
  "San Juan / Mandaluyong / Pasig",
  "Las Piñas / Muntinlupa / Parañaque",
  "Taguig",
  "Manila City",
  "Rizal",
  "Cavite",
  "Laguna",
  "Batangas",
  "Quezon Province",
  "MIMAROPA",
  "Region V (Bicol)",
  "Aklan / Antique / Capiz",
  "Iloilo / Guimaras",
  "Negros / Siquijor",
  "Bohol",
  "Cebu",
  "Samar",
  "Leyte / Biliran",
  "Agusan / Surigao / Dinagat Islands",
  "Zamboanga Peninsula / Sulu Archipelago",
  "Zamboanga Sibugay",
  "Mis.Occ/ Lanao del Norte / Lanao del Sur",
  "Davao",
  "Cotabato / Maguindanao",
  "Sultan Kudarat / General Santos / South Cotabato / Sarangani"
];

export default function RegionSelect({ 
  defaultValue = "", 
  fieldName = "locationRestriction" 
}: { 
  defaultValue?: string,
  fieldName?: string
}) {
  let initialScope = "NATIONWIDE";
  if (defaultValue && defaultValue !== "") {
    initialScope = "PROVINCIAL";
  }

  const [scope, setScope] = useState(initialScope);
  const [specificLocation, setSpecificLocation] = useState(defaultValue || HANDLED_AREAS[0]);

  const finalValue = scope === "NATIONWIDE" ? "" : specificLocation;

  return (
    <div className="space-y-2 w-full">
      <input type="hidden" name={fieldName} value={finalValue} />
      
      <select 
         value={scope} 
         onChange={(e) => {
            const val = e.target.value;
            setScope(val);
            if (val === "PROVINCIAL" && !specificLocation) setSpecificLocation(HANDLED_AREAS[0]);
         }}
         className="w-full bg-[#0c1320] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500/50 outline-none transition-colors appearance-none cursor-pointer"
      >
        <option value="NATIONWIDE">Nationwide (Open to All)</option>
        <option value="PROVINCIAL">Per Area (Select Assigned Area)</option>
      </select>

      {scope === "PROVINCIAL" && (
        <select 
           value={specificLocation} 
           onChange={(e) => setSpecificLocation(e.target.value)}
           className="w-full bg-[#0c1320]/80 border border-primary/30 rounded-xl px-4 py-3 text-sm text-primary focus:border-primary/80 outline-none transition-colors appearance-none cursor-pointer animate-in fade-in slide-in-from-top-2"
        >
          {HANDLED_AREAS.map((p: string) => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
    </div>
  );
}
