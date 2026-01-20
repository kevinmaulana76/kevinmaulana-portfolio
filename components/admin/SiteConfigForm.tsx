import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types.ts';
import { dbService } from '../../services/supabase.ts';
import { IdentitySection } from './settings/IdentitySection.tsx';
import { ExpertiseSection } from './settings/ExpertiseSection.tsx';
import { SocialSection } from './settings/SocialSection.tsx';
import { ChannelSection } from './settings/ChannelSection.tsx';
import { SecuritySection } from './settings/SecuritySection.tsx';

interface SiteConfigFormProps {
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
  setMessage: (m: string) => void;
}

export const SiteConfigForm: React.FC<SiteConfigFormProps> = ({ settings, setMessage }) => {
  const [form, setForm] = useState<SiteSettings>({
    ...settings,
    socialLinks: settings.socialLinks || [],
    hideAdminLink: !!settings.hideAdminLink
  });

  // Keep form in sync with settings if they change externally
  useEffect(() => {
    setForm({
      ...settings,
      socialLinks: settings.socialLinks || [],
      hideAdminLink: !!settings.hideAdminLink
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.updateSettings(form);
      setMessage('SUCCESS: SETTINGS UPDATED');
    } catch (err) { 
      setMessage('ERROR: UPDATE FAILED'); 
    }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-16 max-w-2xl pb-32 animate-fadeIn">
      <div className="space-y-12">
        <IdentitySection form={form} setForm={setForm} />
        <ExpertiseSection form={form} setForm={setForm} />
        <SocialSection form={form} setForm={setForm} />
        <ChannelSection form={form} setForm={setForm} />
        <SecuritySection form={form} setForm={setForm} />
      </div>

      <div className="sticky bottom-8 z-10 pt-8 border-t border-[#F5F5F0]/10 bg-black/80 backdrop-blur-md">
        <button 
          type="submit" 
          className="w-full py-6 bg-white text-black font-black uppercase text-sm tracking-[0.2em] hover:invert transition-all shadow-2xl"
        >
          SAVE CONFIGURATION
        </button>
      </div>
    </form>
  );
};