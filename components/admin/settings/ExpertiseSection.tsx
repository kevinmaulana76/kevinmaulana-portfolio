import React from 'react';
import { SiteSettings } from '../../../types.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const ExpertiseSection: React.FC<Props> = ({ form, setForm }) => {
  const capList = form.capabilities ? form.capabilities.split('\n').filter(Boolean) : [];

  const updateCap = (idx: number, val: string) => {
    const next = [...capList];
    next[idx] = val;
    setForm({...form, capabilities: next.join('\n')});
  };

  const addCap = () => {
    setForm({...form, capabilities: [...capList, 'New Expertise'].join('\n')});
  };

  const remCap = (idx: number) => {
    setForm({...form, capabilities: capList.filter((_, i) => i !== idx).join('\n')});
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-[#F5F5F0]/10 pb-4">
        <h3 className="text-xl font-poster">KEY_EXPERTISE</h3>
        <button type="button" onClick={addCap} className="text-[10px] uppercase font-bold text-[#F5F5F0]/40 hover:text-white">[ADD]</button>
      </div>
      <div className="space-y-2">
        {capList.map((cap, idx) => (
          <div key={idx} className="flex gap-4 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
            <input 
              type="text" 
              value={cap} 
              onChange={e => updateCap(idx, e.target.value)} 
              className="flex-1 bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
            />
            <button type="button" onClick={() => remCap(idx)} className="text-rose-900 text-[10px] font-bold">DEL</button>
          </div>
        ))}
        {capList.length === 0 && (
          <div className="p-8 border border-dashed border-[#F5F5F0]/10 text-center text-[10px] opacity-20 uppercase font-black">No expertise listed</div>
        )}
      </div>
    </div>
  );
};