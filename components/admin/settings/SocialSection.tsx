import React from 'react';
import { SiteSettings, SocialLink } from '../../../types.ts';
import { getSocialIcon, generateId } from '../../../utils/helpers.ts';

interface Props {
  form: SiteSettings;
  setForm: (f: SiteSettings) => void;
}

export const SocialSection: React.FC<Props> = ({ form, setForm }) => {
  const addSocial = () => {
    const newLink: SocialLink = { id: generateId(), label: 'New Social', url: 'https://' };
    setForm({...form, socialLinks: [...(form.socialLinks || []), newLink]});
  };

  const updateSocial = (id: string, updates: Partial<SocialLink>) => {
    const next = (form.socialLinks || []).map(link => link.id === id ? {...link, ...updates} : link);
    setForm({...form, socialLinks: next});
  };

  const remSocial = (id: string) => {
    setForm({...form, socialLinks: (form.socialLinks || []).filter(link => link.id !== id)});
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b border-[#F5F5F0]/10 pb-4">
        <h3 className="text-xl font-poster">SOCIAL_MANAGER</h3>
        <button type="button" onClick={addSocial} className="text-[10px] uppercase font-bold text-[#F5F5F0]/40 hover:text-white">[ADD_CHANNEL]</button>
      </div>
      <div className="space-y-3">
        {(form.socialLinks || []).map((link) => (
          <div key={link.id} className="grid grid-cols-12 gap-4 p-4 border border-[#F5F5F0]/10 bg-[#080808] items-center">
            <div className="col-span-1 flex justify-center">
               <i className={`${getSocialIcon(link.label)} text-lg opacity-60`}></i>
            </div>
            <div className="col-span-3">
              <label className="text-[8px] opacity-40 uppercase block mb-1">Label</label>
              <input 
                type="text" 
                value={link.label} 
                onChange={e => updateSocial(link.id, {label: e.target.value})} 
                className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
                placeholder="Instagram" 
              />
            </div>
            <div className="col-span-7">
              <label className="text-[8px] opacity-40 uppercase block mb-1">URL</label>
              <input 
                type="text" 
                value={link.url} 
                onChange={e => updateSocial(link.id, {url: e.target.value})} 
                className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" 
                placeholder="https://..." 
              />
            </div>
            <div className="col-span-1 flex items-end justify-center">
              <button type="button" onClick={() => remSocial(link.id)} className="text-rose-900 hover:text-rose-500 transition-colors">
                <i className="fas fa-trash-can text-xs"></i>
              </button>
            </div>
          </div>
        ))}
        {(form.socialLinks || []).length === 0 && (
          <div className="p-8 border border-dashed border-[#F5F5F0]/10 text-center text-[10px] opacity-20 uppercase font-black">No social links configured</div>
        )}
      </div>
    </div>
  );
};