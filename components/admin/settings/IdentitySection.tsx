import React, { useRef, useState } from 'react';
import { SiteSettings } from '../../../types.ts';
import { compressImage } from '../../../utils/helpers.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const IdentitySection: React.FC<Props> = ({ form, setForm }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const currentHeroImages = [...(form.heroImages || [])];
    
    for (const file of Array.from(files)) {
      if (currentHeroImages.length >= 3) break;
      const compressed = await compressImage(file, 1200);
      currentHeroImages.push(compressed);
    }
    
    setForm({ ...form, heroImages: currentHeroImages });
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeHeroImage = (idx: number) => {
    const next = [...(form.heroImages || [])];
    next.splice(idx, 1);
    setForm({ ...form, heroImages: next });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">IDENTITY</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-[8px] opacity-40 uppercase">Site Name</label>
            <input 
              type="text" 
              value={form.siteName || ''} 
              onChange={e => setForm({...form, siteName: e.target.value})} 
              className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none" 
              placeholder="SITE NAME" 
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[8px] opacity-40 uppercase">Designer Name</label>
            <input 
              type="text" 
              value={form.designerName || ''} 
              onChange={e => setForm({...form, designerName: e.target.value})} 
              className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none" 
              placeholder="DESIGNER NAME" 
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[8px] opacity-40 uppercase">Biography (Main Profile)</label>
          <textarea 
            value={form.bio || ''} 
            onChange={e => setForm({...form, bio: e.target.value})} 
            className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none text-xs" 
            placeholder="Main profile bio used in the about section..." 
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[8px] opacity-40 uppercase">Hero Subtext (Tagline)</label>
          <textarea 
            value={form.heroSubtext || ''} 
            onChange={e => setForm({...form, heroSubtext: e.target.value})} 
            className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-20 focus:outline-none text-xs" 
            placeholder="Text displayed right under the site name in the hero section..." 
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-[#F5F5F0]/10 pb-4">
          <h3 className="text-xl font-poster">HERO_IMAGES</h3>
          <span className="text-[8px] opacity-40 uppercase">MAX 3 SLOTS</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => {
            const img = form.heroImages?.[idx];
            return (
              <div key={idx} className="relative aspect-[3/4] border border-[#F5F5F0]/10 bg-zinc-900 overflow-hidden group">
                {img ? (
                  <>
                    <img src={img} className="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" alt={`Hero ${idx + 1}`} />
                    <button 
                      type="button" 
                      onClick={() => removeHeroImage(idx)}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 font-black text-[10px] uppercase"
                    >
                      REMOVE
                    </button>
                  </>
                ) : (
                  <button 
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-20 hover:opacity-100 transition-opacity"
                  >
                    <i className={`fas ${isUploading ? 'fa-spinner animate-spin' : 'fa-plus'} text-xs`}></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">SLOT_{idx + 1}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          multiple
          className="hidden" 
          onChange={handleHeroUpload} 
        />
        <p className="text-[8px] opacity-20 uppercase tracking-widest italic text-center">These images will be displayed in the landing page hero slider.</p>
      </div>
    </div>
  );
};