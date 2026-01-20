
import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/supabase';
import { Project, SiteSettings, DESIGN_CATEGORIES, DesignCategory, SocialLink } from '../types';
import { generateDescription } from '../services/gemini';
import { getSocialIcon } from '../App';

// --- UTILITIES ---

const compressImage = (file: File, maxWidth: number = 1200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality for speed and balance
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- SUB-COMPONENTS ---

const AuthGateway: React.FC<{ 
  onSuccess: () => void;
  message: string;
  setMessage: (m: string) => void;
}> = ({ onSuccess, message, setMessage }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = await dbService.getSettings();
    if (password === currentSettings.adminPassword) {
      onSuccess();
      setMessage('');
    } else {
      setMessage('INVALID ACCESS KEY');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode === 'RESET2024') {
      await dbService.updateSettings({ adminPassword: 'admin' });
      setMessage('SYSTEM RECOVERY: Password set to "admin"');
      setShowReset(false);
    } else {
      setMessage('INVALID RECOVERY TOKEN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="max-w-md w-full border-poster p-10 bg-black">
        <div className="mb-10 uppercase text-center">
          <h1 className="text-4xl font-poster mb-2">AUTH_REQUIRED</h1>
          <p className="text-[#F5F5F0]/40 text-[10px] tracking-widest font-bold">CORE ACCESS GATEWAY</p>
        </div>

        {message && (
          <div className={`p-4 border mb-6 text-[10px] font-black tracking-widest text-center uppercase ${message.includes('SUCCESS') || message.includes('RECOVERY') ? 'border-green-500 text-green-500' : 'border-rose-500 text-rose-500'}`}>
            {message}
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative border-b border-[#F5F5F0]/40">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-black py-3 pr-10 text-white focus:outline-none focus:border-[#F5F5F0] transition-all uppercase placeholder:text-zinc-800 tracking-widest text-xs" 
                placeholder="ACCESS_PASSWORD" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F5F5F0]/40 hover:text-white transition-colors"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
            <button className="w-full py-4 bg-[#F5F5F0] text-black font-black text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all">Login System</button>
            <button type="button" onClick={() => setShowReset(true)} className="w-full text-zinc-700 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors mt-4">Forgot Credentials?</button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <input type="text" value={resetCode} onChange={(e) => setResetCode(e.target.value)} className="w-full bg-black border-b border-[#F5F5F0]/40 py-3 text-white focus:outline-none focus:border-[#F5F5F0] transition-all uppercase placeholder:text-zinc-800 text-xs tracking-widest" placeholder="RECOVERY_TOKEN" />
            <button className="w-full py-4 bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all">Reset Password</button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full text-zinc-700 hover:text-white text-[10px] uppercase font-bold tracking-widest">Return to Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

const AdminSidebar: React.FC<{ 
  activeTab: string; 
  setActiveTab: (t: 'projects' | 'settings') => void;
  onLogout: () => void;
}> = ({ activeTab, setActiveTab, onLogout }) => (
  <div className="lg:w-64 flex flex-col gap-4 uppercase font-black text-xs tracking-[0.2em]">
    <button onClick={() => setActiveTab('projects')} className={`text-left p-4 border ${activeTab === 'projects' ? 'bg-[#F5F5F0] text-black border-[#F5F5F0]' : 'border-[#F5F5F0]/20 text-[#F5F5F0]/40 transition-colors'}`}>[01] PROJECTS_MGR</button>
    <button onClick={() => setActiveTab('settings')} className={`text-left p-4 border ${activeTab === 'settings' ? 'bg-[#F5F5F0] text-black border-[#F5F5F0]' : 'border-[#F5F5F0]/20 text-[#F5F5F0]/40 transition-colors'}`}>[02] SITE_CONFIG</button>
    <div className="mt-10 pt-10 border-t border-[#F5F5F0]/10">
      <button onClick={onLogout} className="w-full text-left p-4 border border-rose-900/20 text-rose-900 hover:text-rose-500 hover:border-rose-500 transition-all">[00] DISCONNECT</button>
    </div>
  </div>
);

const ProjectManager: React.FC<{ projects: Project[]; onRefresh: () => void; setMessage: (m: string) => void }> = ({ projects, onRefresh, setMessage }) => {
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.imageUrls?.length) return;
    if (editingProject.id) {
      await dbService.updateProject(editingProject.id, editingProject);
    } else {
      await dbService.saveProject(editingProject as any);
    }
    setEditingProject(null);
    onRefresh();
    setMessage('SUCCESS: PROJECT_SAVED');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAI = async () => {
    if (!editingProject?.title || !editingProject?.category) return;
    setIsGenerating(true);
    const desc = await generateDescription(editingProject.title, editingProject.category);
    setEditingProject({ ...editingProject, description: desc });
    setIsGenerating(false);
  };

  const handleProjectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImageUrls = [...(editingProject?.imageUrls || [])];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i]);
        newImageUrls.push(compressed);
      }
      setEditingProject({ ...editingProject, imageUrls: newImageUrls });
      setMessage(`SUCCESS: ${files.length} IMAGES_UPLOADED`);
    } catch (err) {
      console.error(err);
      setMessage('ERROR: UPLOAD_FAILED');
    } finally {
      setIsUploading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeProjectImage = (index: number) => {
    const newImageUrls = [...(editingProject?.imageUrls || [])];
    newImageUrls.splice(index, 1);
    setEditingProject({ ...editingProject, imageUrls: newImageUrls });
  };

  return (
    <div className="space-y-12 page-transition">
      <div className="flex justify-between items-end border-b border-[#F5F5F0] pb-6">
        <div className="space-y-2">
          <h2 className="text-6xl font-poster">PROJECTS</h2>
          <p className="text-[9px] text-[#F5F5F0]/40 tracking-widest uppercase font-bold">Manage your works gallery and AI-powered metadata.</p>
        </div>
        <button onClick={() => setEditingProject({ category: 'Social Media', imageUrls: [] })} className="bg-[#F5F5F0] text-black px-6 py-3 font-black text-[10px] tracking-widest hover:invert transition-all">ADD_ENTRY</button>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl border-poster p-10 bg-black my-auto">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase opacity-40">Project Title</label>
                <input type="text" value={editingProject.title || ''} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:border-[#F5F5F0] focus:outline-none" placeholder="Project Name" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase opacity-40">Category</label>
                <select value={editingProject.category || 'Social Media'} onChange={e => setEditingProject({...editingProject, category: e.target.value as DesignCategory})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:border-[#F5F5F0] focus:outline-none uppercase text-xs">
                  {DESIGN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black tracking-widest uppercase opacity-40">Images (Slider)</label>
                  <button type="button" onClick={() => projectFileInputRef.current?.click()} className="text-[8px] border border-[#F5F5F0]/20 px-3 py-1 hover:bg-[#F5F5F0] hover:text-black transition-all">UPLOAD_IMAGES</button>
                  <input ref={projectFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleProjectImageUpload} />
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {editingProject.imageUrls?.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/5] group border border-[#F5F5F0]/10 overflow-hidden">
                      <img src={url} className="w-full h-full object-cover grayscale" />
                      <button 
                        type="button" 
                        onClick={() => removeProjectImage(idx)}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-[8px] font-black text-rose-500">[REMOVE]</span>
                      </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => projectFileInputRef.current?.click()}
                    className={`aspect-[4/5] border border-dashed border-[#F5F5F0]/20 flex items-center justify-center cursor-pointer hover:border-[#F5F5F0]/50 transition-all ${isUploading ? 'animate-pulse bg-[#F5F5F0]/5' : ''}`}
                  >
                    <span className="text-[8px] opacity-20">{isUploading ? 'WAIT...' : '[+]'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase opacity-40">Description (Manual or AI)</label>
                <div className="flex gap-4">
                  <textarea value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="flex-grow bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none text-xs" placeholder="Brief context..."></textarea>
                  <button type="button" onClick={handleAI} disabled={isGenerating} className="border border-[#F5F5F0]/20 px-4 hover:bg-white hover:text-black uppercase text-[10px] font-black w-24 transition-all">{isGenerating ? 'GEN...' : 'AI_WRITE'}</button>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-4 bg-white text-black font-black uppercase text-xs hover:bg-[#F5F5F0]/90 transition-all">SAVE_ENTRY</button>
                <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-4 border border-white text-white font-black uppercase text-xs hover:bg-white/10 transition-all">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="border border-[#F5F5F0]/10 p-2 group bg-[#080808] hover:border-[#F5F5F0]/30 transition-all">
            <div className="aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700 mb-4">
              <img src={proj.imageUrls?.[0]} className="w-full h-full object-cover" alt={proj.title} />
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <span className="uppercase font-black text-[10px] tracking-widest">{proj.title}</span>
                <span className="text-[8px] opacity-40">{proj.imageUrls?.length} IMAGES</span>
              </div>
              <span className="uppercase text-[9px] opacity-30 font-bold">{proj.category}</span>
              <div className="flex gap-4 border-t border-[#F5F5F0]/10 pt-4">
                <button onClick={() => setEditingProject(proj)} className="text-[10px] font-bold uppercase hover:line-through">Edit</button>
                <button onClick={async () => { if(confirm('Delete this project?')) { await dbService.deleteProject(proj.id); onRefresh(); } }} className="text-[10px] font-bold uppercase hover:line-through text-rose-900">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SiteConfigForm: React.FC<{ settings: SiteSettings; onSave: (s: SiteSettings) => void; setMessage: (m: string) => void }> = ({ settings, onSave, setMessage }) => {
  const [form, setForm] = useState(settings);
  const [compressing, setCompressing] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setMessage('SUCCESS: CONFIG_SAVED');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleHeroImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(index);
      const compressed = await compressImage(file);
      const newHeroImages = [...(form.heroImages || ['', '', ''])];
      newHeroImages[index] = compressed;
      setForm({ ...form, heroImages: newHeroImages });
      setMessage(`SUCCESS: IMAGE_${index + 1} COMPRESSED`);
    } catch (err) {
      console.error(err);
      setMessage('ERROR: COMPRESSION_FAILED');
    } finally {
      setCompressing(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeHeroImage = (index: number) => {
    const newHeroImages = [...(form.heroImages || ['', '', ''])];
    newHeroImages[index] = '';
    setForm({ ...form, heroImages: newHeroImages });
  };

  const addSocialLink = () => {
    const newLink: SocialLink = { id: Math.random().toString(36).substr(2, 9), label: 'New Social', url: '#' };
    setForm({ ...form, socialLinks: [...(form.socialLinks || []), newLink] });
  };

  const updateSocialLink = (id: string, updates: Partial<SocialLink>) => {
    const updated = form.socialLinks.map(link => link.id === id ? { ...link, ...updates } : link);
    setForm({ ...form, socialLinks: updated });
  };

  const removeSocialLink = (id: string) => {
    setForm({ ...form, socialLinks: form.socialLinks.filter(l => l.id !== id) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 max-w-2xl uppercase font-black text-[10px] tracking-widest page-transition pb-24">
      {/* HERO GALLERY SECTION */}
      <div className="space-y-8">
        <div className="border-b border-[#F5F5F0]/20 pb-4">
          <h3 className="text-xl font-poster">HERO GALLERY (3 SLOTS)</h3>
          <p className="text-[9px] text-[#F5F5F0]/40 mt-1">Manage the triple images in your hero section. Auto-compressed for performance.</p>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-2 group">
              <label className="opacity-40">SLOT_0{idx + 1}</label>
              <div 
                onClick={() => fileInputRefs[idx].current?.click()}
                className={`relative aspect-[3/4] border-2 border-dashed border-[#F5F5F0]/10 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-[#F5F5F0]/30 ${compressing === idx ? 'animate-pulse' : ''}`}
              >
                {(form.heroImages?.[idx]) ? (
                  <>
                    <img src={form.heroImages[idx]} className="w-full h-full object-cover grayscale" alt={`Slot ${idx}`} />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[8px] font-black">CHANGE_IMAGE</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fas fa-plus mb-2 opacity-20 text-sm"></i>
                    <span className="block text-[8px] opacity-20">UPLOAD</span>
                  </div>
                )}
                {compressing === idx && (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <span className="text-[8px] animate-pulse">COMPRESSING...</span>
                  </div>
                )}
              </div>
              <input 
                ref={fileInputRefs[idx]}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => handleHeroImageUpload(idx, e)} 
              />
              {form.heroImages?.[idx] && (
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); removeHeroImage(idx); }}
                  className="w-full py-2 text-rose-900 hover:text-rose-500 transition-colors text-[8px]"
                >
                  [REMOVE_IMAGE]
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-b border-[#F5F5F0]/20 pb-4">
          <h3 className="text-xl font-poster">IDENTITY & CONTENT</h3>
          <p className="text-[9px] text-[#F5F5F0]/40 mt-1">Basic information shown on homepage and profile section.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="opacity-40">Site Name (Header)</label>
            <input type="text" value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="opacity-40">Designer Name (Footer/Profile)</label>
            <input type="text" value={form.designerName} onChange={e => setForm({...form, designerName: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="opacity-40">Bio (About you)</label>
          <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none focus:border-[#F5F5F0] text-xs leading-relaxed transition-colors" placeholder="Tell your story..."></textarea>
        </div>

        <div className="space-y-2">
          <label className="opacity-40">Capabilities (One per line)</label>
          <textarea value={form.capabilities} onChange={e => setForm({...form, capabilities: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none focus:border-[#F5F5F0] text-xs transition-colors" placeholder="Adobe Photoshop&#10;Social Media Ads&#10;..."></textarea>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-b border-[#F5F5F0]/20 pb-4 flex justify-between items-end">
          <div>
            <h3 className="text-xl font-poster">CHANNELS & SOCIALS</h3>
            <p className="text-[9px] text-[#F5F5F0]/40 mt-1">Manage your online presence. Icons auto-detected by name.</p>
          </div>
          <button type="button" onClick={addSocialLink} className="text-[8px] border border-[#F5F5F0]/20 px-3 py-1 hover:bg-[#F5F5F0] hover:text-black transition-all">ADD_CHANNEL</button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="opacity-40">Primary Email</label>
              <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="opacity-40">Location / City</label>
              <input type="text" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            {form.socialLinks?.map((link) => (
              <div key={link.id} className="flex flex-col md:flex-row gap-4 p-4 border border-[#F5F5F0]/10 bg-zinc-900/10 group hover:border-[#F5F5F0]/30 transition-all">
                <div className="flex-1 space-y-2">
                  <label className="opacity-20 flex items-center gap-2">
                    <i className={getSocialIcon(link.label)}></i> PLATFORM_NAME
                  </label>
                  <input type="text" value={link.label} onChange={e => updateSocialLink(link.id, { label: e.target.value })} className="w-full bg-transparent border-b border-[#F5F5F0]/20 py-1 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
                </div>
                <div className="flex-[2] space-y-2">
                  <label className="opacity-20">PROFILE_URL</label>
                  <input type="text" value={link.url} onChange={e => updateSocialLink(link.id, { url: e.target.value })} className="w-full bg-transparent border-b border-[#F5F5F0]/20 py-1 focus:outline-none focus:border-[#F5F5F0] transition-colors" />
                </div>
                <button type="button" onClick={() => removeSocialLink(link.id)} className="md:self-end py-1 text-rose-900 hover:text-rose-500 transition-colors text-[8px] uppercase font-bold">[REMOVE]</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="border-b border-[#F5F5F0]/20 pb-4">
          <h3 className="text-xl font-poster">SECURITY & ACCESS</h3>
          <p className="text-[9px] text-[#F5F5F0]/40 mt-1">Control access to this admin panel.</p>
        </div>

        <div className="flex items-center justify-between border border-[#F5F5F0]/10 p-6 bg-zinc-900/5">
          <div className="space-y-1">
            <span className="text-xs">Hide "Access" Link</span>
            <p className="text-[8px] opacity-40 lowercase leading-tight">Removes the login button from the public header.</p>
          </div>
          <button type="button" onClick={() => setForm({...form, hideAdminLink: !form.hideAdminLink})} className={`px-4 py-2 border text-[9px] font-black transition-all ${form.hideAdminLink ? 'bg-[#F5F5F0] text-black border-[#F5F5F0]' : 'border-[#F5F5F0]/20'}`}>{form.hideAdminLink ? '[HIDDEN]' : '[VISIBLE]'}</button>
        </div>

        <div className="space-y-2">
          <label className="opacity-40">Admin Access Password</label>
          <div className="relative border-b border-[#F5F5F0]/20">
            <input 
              type={showPassword ? "text" : "password"} 
              value={form.adminPassword} 
              onChange={e => setForm({...form, adminPassword: e.target.value})} 
              className="w-full bg-black py-2 pr-10 focus:outline-none focus:border-[#F5F5F0] transition-colors" 
              placeholder="Enter new password..." 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F5F5F0]/40 hover:text-white transition-colors"
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
            </button>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full py-6 bg-[#F5F5F0] text-black font-black uppercase text-sm tracking-[0.2em] hover:invert transition-all fixed bottom-8 left-1/2 -translate-x-1/2 max-w-2xl z-50 shadow-2xl">SAVE_ALL_CONFIGS</button>
    </form>
  );
};

// --- MAIN PAGE ---

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'settings'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const [p, s] = await Promise.all([dbService.getProjects(), dbService.getSettings()]);
    setProjects(p);
    setSettings(s);
  };

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  if (!isLoggedIn) return <AuthGateway onSuccess={() => setIsLoggedIn(true)} message={message} setMessage={setMessage} />;

  return (
    <div className="container mx-auto px-6 py-24 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-20">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLoggedIn(false)} />
        <div className="flex-grow pb-32">
          {message && (
            <div className="mb-10 p-4 border border-[#F5F5F0] uppercase text-xs font-black text-center bg-white text-black fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-64 shadow-2xl animate-bounce">
              {message}
            </div>
          )}
          {activeTab === 'projects' ? (
            <ProjectManager projects={projects} onRefresh={loadData} setMessage={setMessage} />
          ) : (
            settings && <SiteConfigForm settings={settings} onSave={dbService.updateSettings} setMessage={setMessage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
