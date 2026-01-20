import React from 'react';
import { SiteSettings } from '../../../types.ts';
import { generateId } from '../../../utils/helpers.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const SecuritySection: React.FC<Props> = ({ form, setForm }) => {
  const regenerateToken = () => {
    if (confirm('Regenerate Recovery Token? Your old token will stop working.')) {
      setForm({ ...form, recoveryToken: generateId() });
    }
  };

  const toggleHideLink = () => {
    setForm({ ...form, hideAdminLink: !form.hideAdminLink });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">SECURITY</h3>
      
      <div className="space-y-6">
        {/* Admin Link Visibility Toggle (Hide Access) */}
        <div className="p-6 border border-[#F5F5F0]/10 bg-[#080808] flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Stealth Mode</h4>
            <p className="text-[8px] opacity-40 uppercase">Hide the "Access" link from the main navigation footer/header.</p>
          </div>
          <button 
            type="button" 
            onClick={toggleHideLink}
            className={`w-14 h-7 border transition-all relative rounded-full ${form.hideAdminLink ? 'bg-white border-white' : 'border-[#F5F5F0]/20 bg-zinc-900'}`}
          >
            <div className={`absolute top-1 w-5 h-5 transition-all rounded-full ${form.hideAdminLink ? 'right-1 bg-black' : 'left-1 bg-white/20'}`}></div>
          </button>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
            <label className="text-[8px] opacity-40 uppercase">Admin Password</label>
            <input 
              type="password" 
              value={form.adminPassword || ''} 
              onChange={e => setForm({...form, adminPassword: e.target.value})} 
              className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none focus:border-white transition-all text-sm" 
              placeholder="NEW PASSWORD" 
            />
          </div>
          
          <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[8px] opacity-40 uppercase">Recovery Token</label>
              <button 
                type="button" 
                onClick={regenerateToken}
                className="text-[8px] font-bold text-rose-500 hover:text-rose-400 transition-colors uppercase"
              >
                [Regenerate]
              </button>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={form.recoveryToken || ''} 
                readOnly 
                className="flex-grow bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none opacity-60 cursor-text font-mono text-[10px]" 
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
            </div>
            <span className="text-[7px] opacity-20 uppercase mt-1 italic">Keep this safe to reset your password if lost.</span>
          </div>
        </div>
      </div>
    </div>
  );
};