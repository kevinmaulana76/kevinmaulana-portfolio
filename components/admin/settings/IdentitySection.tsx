import React from 'react';
import { SiteSettings } from '../../../types.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const IdentitySection: React.FC<Props> = ({ form, setForm }) => (
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
      <label className="text-[8px] opacity-40 uppercase">Biography</label>
      <textarea 
        value={form.bio || ''} 
        onChange={e => setForm({...form, bio: e.target.value})} 
        className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none text-xs" 
        placeholder="BIO" 
      />
    </div>
  </div>
);