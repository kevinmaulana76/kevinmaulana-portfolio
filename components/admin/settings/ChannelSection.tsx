import React from 'react';
import { SiteSettings } from '../../../types.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const ChannelSection: React.FC<Props> = ({ form, setForm }) => (
  <div className="space-y-8">
    <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">CHANNEL_MANAGER</h3>
    <div className="space-y-4">
      <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
        <label className="text-[8px] opacity-40 uppercase">Email Address</label>
        <input 
          type="email" 
          value={form.contactEmail || ''} 
          onChange={e => setForm({...form, contactEmail: e.target.value})} 
          className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
        />
      </div>
      <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
        <label className="text-[8px] opacity-40 uppercase">Phone Number</label>
        <input 
          type="text" 
          value={form.phone || ''} 
          onChange={e => setForm({...form, phone: e.target.value})} 
          className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
        />
      </div>
      <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
        <label className="text-[8px] opacity-40 uppercase">Location</label>
        <input 
          type="text" 
          value={form.location || ''} 
          onChange={e => setForm({...form, location: e.target.value})} 
          className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
        />
      </div>
    </div>
  </div>
);