"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

interface BrandCustomizationFormProps {
  logoUrlSetting: string;
  iconUrlSetting: string;
  backgroundUrlSetting: string;
  updateAction: (data: FormData) => Promise<void>;
}

export default function BrandCustomizationForm({
  logoUrlSetting,
  iconUrlSetting,
  backgroundUrlSetting,
  updateAction,
}: BrandCustomizationFormProps) {
  const [logoPreview, setLogoPreview] = useState(logoUrlSetting);
  const [iconPreview, setIconPreview] = useState(iconUrlSetting);
  const [backgroundPreview, setBackgroundPreview] = useState(backgroundUrlSetting);
  const [customBgText, setCustomBgText] = useState(
    backgroundUrlSetting.startsWith("radial-gradient") || backgroundUrlSetting.startsWith("linear-gradient")
      ? backgroundUrlSetting
      : ""
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const selectPreset = (val: string) => {
    setBackgroundPreview(val);
    setCustomBgText(val);
  };

  return (
    <form action={updateAction} className="space-y-6 max-w-4xl">
      
      {/* Grid of File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Logo Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Site Logo</span>
          <div className="w-24 h-24 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden mb-3">
            <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain p-2" />
          </div>
          <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl cursor-pointer text-xs font-bold text-white transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Image
            <input 
              type="file" 
              name="logo_file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, setLogoPreview)}
            />
          </label>
          <input type="hidden" name="logo_url" value={logoPreview} />
          <p className="text-[9px] text-slate-500 mt-2">Recommended format: PNG transparent background.</p>
        </div>

        {/* Favicon Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Tab Favicon</span>
          <div className="w-24 h-24 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden mb-3">
            <img src={iconPreview} alt="Favicon preview" className="max-w-full max-h-full object-contain p-4" />
          </div>
          <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl cursor-pointer text-xs font-bold text-white transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Favicon
            <input 
              type="file" 
              name="icon_file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, setIconPreview)}
            />
          </label>
          <input type="hidden" name="icon_url" value={iconPreview} />
          <p className="text-[9px] text-slate-500 mt-2">Short icon loaded on browser tabs.</p>
        </div>

        {/* Background Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center text-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Dark Mode Background</span>
          <div className="w-24 h-24 bg-black/50 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden mb-3 relative">
            {backgroundPreview.startsWith("radial-gradient") || backgroundPreview.startsWith("linear-gradient") || backgroundPreview.startsWith("#") ? (
              <div className="w-full h-full rounded-lg" style={{ background: backgroundPreview }} />
            ) : (
              <img src={backgroundPreview} alt="Background preview" className="w-full h-full object-cover rounded-lg" />
            )}
          </div>
          <label className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl cursor-pointer text-xs font-bold text-white transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload File
            <input 
              type="file" 
              name="background_file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleFileChange(e, setBackgroundPreview)}
            />
          </label>
          <input type="hidden" name="background_url" value={backgroundPreview} />
          <p className="text-[9px] text-slate-500 mt-2">Large image or custom gradient overlay.</p>
        </div>

      </div>

      {/* Background Style Presets */}
      <div className="bg-white/5 border border-white/10 rounded-[1.6rem] p-5">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-4">Background Design Presets</span>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Preset 1 */}
          <button
            type="button"
            onClick={() => selectPreset("radial-gradient(circle at 50% 30%, #1e1b06 0%, #03050c 100%)")}
            className="bg-black/40 border border-white/10 hover:border-primary/50 text-left p-3 rounded-xl transition-all hover:scale-[1.02] flex flex-col gap-2 shrink-0 cursor-pointer"
          >
            <div className="h-12 w-full rounded-lg" style={{ background: "radial-gradient(circle at 50% 30%, #1e1b06 0%, #03050c 100%)" }} />
            <div className="text-[10px] font-black text-white">Pomelli Gold Aura</div>
          </button>

          {/* Preset 2 */}
          <button
            type="button"
            onClick={() => selectPreset("radial-gradient(circle at 50% 30%, #0c1020 0%, #03050c 100%)")}
            className="bg-black/40 border border-white/10 hover:border-primary/50 text-left p-3 rounded-xl transition-all hover:scale-[1.02] flex flex-col gap-2 shrink-0 cursor-pointer"
          >
            <div className="h-12 w-full rounded-lg" style={{ background: "radial-gradient(circle at 50% 30%, #0c1020 0%, #03050c 100%)" }} />
            <div className="text-[10px] font-black text-white">Midnight Blue Glow</div>
          </button>

          {/* Preset 3 */}
          <button
            type="button"
            onClick={() => selectPreset("#03050c")}
            className="bg-black/40 border border-white/10 hover:border-primary/50 text-left p-3 rounded-xl transition-all hover:scale-[1.02] flex flex-col gap-2 shrink-0 cursor-pointer"
          >
            <div className="h-12 w-full rounded-lg bg-[#03050c] border border-white/5" />
            <div className="text-[10px] font-black text-white">Deep Matte Black</div>
          </button>

          {/* Preset 4 */}
          <button
            type="button"
            onClick={() => selectPreset("/bg-dark.jpg")}
            className="bg-black/40 border border-white/10 hover:border-primary/50 text-left p-3 rounded-xl transition-all hover:scale-[1.02] flex flex-col gap-2 shrink-0 cursor-pointer"
          >
            <div className="h-12 w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: "url('/bg-dark.jpg')" }} />
            <div className="text-[10px] font-black text-white">Default Tech Grid</div>
          </button>

        </div>
        
        <div className="mt-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Custom background color, gradient, or URL string"
            className="input-hud flex-1"
            value={customBgText}
            onChange={(e) => {
              setCustomBgText(e.target.value);
              setBackgroundPreview(e.target.value);
            }}
          />
        </div>
      </div>

      <button type="submit" className="action-button-primary text-xs py-3 px-8 mt-2">
        Save Platform Branding
      </button>
    </form>
  );
}
