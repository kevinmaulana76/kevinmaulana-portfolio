import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/supabase.ts';
import { Project, SiteSettings, DESIGN_CATEGORIES, DesignCategory, SocialLink } from '../types.ts';
import { generateDescription } from '../services/gemini.ts';

const ADMIN_AUTH_KEY = 'kevin_portfolio_admin_auth_v2';

const compressImage = (file: File, maxWidth: number = 1000): Promise<string> => {
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
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const AuthGateway: React.FC<{ 
  onSuccess: (remember: boolean) => void;
  message: string;
  setMessage: (m: string) => void;
}> = ({ onSuccess, message, setMessage }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentSettings = await dbService.getSettings();
    if (password === currentSettings.adminPassword) {
      onSuccess(rememberMe);
      setMessage('');
    } else {
      setMessage('INVALID ACCESS KEY');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const settings = await dbService.getSettings();
    if (resetToken === settings.recoveryToken) {
      await dbService.updateSettings({ adminPassword: newPassword || 'admin' });
      setMessage(`SUCCESS: Password updated to "${newPassword || 'admin'}"`);
      setShowReset(false);
    } else {
      setMessage('INVALID RECOVERY TOKEN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="max-w-md w-full border border-[#F5F5F0]/20 p-10 bg-[#080808]">
        <div className="mb-10 uppercase text-center">
          <h1 className="text-4xl font-poster mb-2">AUTH_GATE</h1>
          <p className="text-[#F5F5F0]/40 text-[10px] tracking-widest font-bold">SYSTEM ACCESS CONTROL</p>
        </div>

        {message && (
          <div className={`p-4 border mb-6 text-[10px] font-black tracking-widest text-center uppercase ${message.includes('SUCCESS') ? 'border-green-500 text-green-500' : 'border-rose-500 text-rose-500'}`}>
            {message}
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative border-b border-[#F5F5F0]/20">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-transparent py-3 pr-10 text-white focus:outline-none focus:border-[#F5F5F0] transition-all uppercase placeholder:text-zinc-800 tracking-widest text-xs" 
                placeholder="PASSWORD" 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F5F5F0]/40 hover:text-white transition-colors">
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setRememberMe(!rememberMe)} className={`w-4 h-4 border flex items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-[#F5F5F0]/20'}`}>
                {rememberMe && <i className="fas fa-check text-[10px] text-black"></i>}
              </button>
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]/40 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>Remember Access</label>
            </div>
            <button className="w-full py-4 bg-[#F5F5F0] text-black font-black text-xs uppercase tracking-[0.2em]">Enter Dashboard</button>
            <button type="button" onClick={() => setShowReset(true)} className="w-full text-zinc-700 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors mt-4">Forgotten Password?</button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-4">
              <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} className="w-full bg-black border-b border-[#F5F5F0]/20 py-3 text-white focus:outline-none placeholder:text-zinc-800 text-xs tracking-widest" placeholder="RECOVERY TOKEN" />
              <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-black border-b border-[#F5F5F0]/20 py-3 text-white focus:outline-none placeholder:text-zinc-800 text-xs tracking-widest" placeholder="NEW PASSWORD" />
            </div>
            <button className="w-full py-4 bg-zinc-800 text-white font-black text-xs uppercase tracking-[0.2em]">Update Credentials</button>
            <button type="button" onClick={() => setShowReset(false)} className="w-full text-zinc-700 hover:text-white text-[10px] uppercase font-bold tracking-widest">Return to Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

const ProjectManager: React.FC<{ projects: Project[]; onRefresh: () => void; setMessage: (m: string) => void }> = ({ projects, onRefresh, setMessage }) => {
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const projectFileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.imageUrls?.length) {
      setMessage('ERROR: Title and Images are required');
      return;
    }
    try {
      if (editingProject.id) {
        await dbService.updateProject(editingProject.id, editingProject);
      } else {
        await dbService.saveProject(editingProject as any);
      }
      setEditingProject(null);
      onRefresh();
      setMessage('SUCCESS: PROJECT SAVED');
    } catch (err) {
      setMessage('ERROR: SAVE FAILED');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAI = async () => {
    if (!editingProject?.title || !editingProject?.category) return;
    setIsGenerating(true);
    const desc = await generateDescription(editingProject.title, editingProject.category);
    setEditingProject({ ...editingProject, description: desc });
    setIsGenerating(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const newUrls = [...(editingProject?.imageUrls || [])];
    for (const file of Array.from(files)) {
      const compressed = await compressImage(file);
      newUrls.push(compressed);
    }
    setEditingProject({...editingProject, imageUrls: newUrls});
    setIsUploading(false);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end border-b border-[#F5F5F0]/10 pb-6">
        <h2 className="text-6xl font-poster">PROJECTS</h2>
        <button onClick={() => setEditingProject({ category: 'Social Media', imageUrls: [] })} className="bg-[#F5F5F0] text-black px-6 py-3 font-black text-[10px] tracking-widest">NEW_ENTRY</button>
      </div>

      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 overflow-y-auto">
          <div className="w-full max-w-2xl border border-[#F5F5F0]/20 p-10 bg-[#080808] my-auto">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={editingProject.title || ''} onChange={e => setEditingProject({...editingProject, title: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:border-[#F5F5F0] focus:outline-none" placeholder="TITLE" />
                <select value={editingProject.category || 'Social Media'} onChange={e => setEditingProject({...editingProject, category: e.target.value as DesignCategory})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none uppercase text-xs">
                  {DESIGN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase opacity-40">Images</label>
                  <button type="button" onClick={() => projectFileInputRef.current?.click()} className="text-[8px] border border-[#F5F5F0]/20 px-3 py-1">UPLOAD</button>
                  <input ref={projectFileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {editingProject.imageUrls?.map((url, idx) => (
                    <div key={idx} className="relative aspect-[4/5] border border-[#F5F5F0]/10 overflow-hidden">
                      <img src={url} className="w-full h-full object-cover grayscale" />
                      <button type="button" onClick={() => {
                        const next = [...(editingProject.imageUrls || [])];
                        next.splice(idx, 1);
                        setEditingProject({...editingProject, imageUrls: next});
                      }} className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 hover:opacity-100 text-[8px] text-rose-500">DEL</button>
                    </div>
                  ))}
                  {isUploading && <div className="aspect-[4/5] bg-zinc-900 animate-pulse flex items-center justify-center text-[8px]">...</div>}
                </div>
              </div>
              <textarea value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-24 focus:outline-none text-xs" placeholder="DESCRIPTION" />
              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-4 bg-white text-black font-black uppercase text-xs">SAVE</button>
                <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-4 border border-white text-white font-black uppercase text-xs">CANCEL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="border border-[#F5F5F0]/10 p-2 bg-[#080808]">
            <div className="aspect-[4/5] overflow-hidden grayscale mb-4"><img src={proj.imageUrls?.[0]} className="w-full h-full object-cover" /></div>
            <div className="flex justify-between items-center p-2">
              <span className="uppercase font-black text-[10px] tracking-widest">{proj.title}</span>
              <div className="flex gap-4">
                <button onClick={() => setEditingProject(proj)} className="text-[10px] font-bold uppercase hover:underline">Edit</button>
                <button onClick={async () => { if(confirm('Delete?')) { await dbService.deleteProject(proj.id); onRefresh(); } }} className="text-[10px] font-bold uppercase text-rose-900">Del</button>
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
  
  const capList = form.capabilities?.split('\n').filter(Boolean) || [];
  const updateCap = (idx: number, val: string) => {
    const next = [...capList];
    next[idx] = val;
    setForm({...form, capabilities: next.join('\n')});
  };
  const addCap = () => setForm({...form, capabilities: [...capList, 'New Expertise'].join('\n')});
  const remCap = (idx: number) => setForm({...form, capabilities: capList.filter((_, i) => i !== idx).join('\n')});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.updateSettings(form);
      setMessage('SUCCESS: SETTINGS UPDATED');
    } catch (err) { setMessage('ERROR: UPDATE FAILED'); }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-16 max-w-2xl pb-32">
      <div className="space-y-8">
        <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">IDENTITY</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none" placeholder="SITE NAME" />
          <input type="text" value={form.designerName} onChange={e => setForm({...form, designerName: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none" placeholder="DESIGNER NAME" />
        </div>
        <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-32 focus:outline-none text-xs" placeholder="BIO" />
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-[#F5F5F0]/10 pb-4">
          <h3 className="text-xl font-poster">KEY_EXPERTISE</h3>
          <button type="button" onClick={addCap} className="text-[10px] uppercase font-bold text-[#F5F5F0]/40 hover:text-white">[ADD]</button>
        </div>
        <div className="space-y-2">
          {capList.map((cap, idx) => (
            <div key={idx} className="flex gap-4 p-4 border border-[#F5F5F0]/10 bg-[#080808]">
              <input type="text" value={cap} onChange={e => updateCap(idx, e.target.value)} className="flex-1 bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" />
              <button type="button" onClick={() => remCap(idx)} className="text-rose-900 text-[10px] font-bold">DEL</button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">CHANNEL_MANAGER</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10">
            <label className="text-[8px] opacity-40 uppercase">Email Address</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10">
            <label className="text-[8px] opacity-40 uppercase">Phone Number</label>
            <input type="text" value={form.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" />
          </div>
          <div className="flex flex-col gap-1 p-4 border border-[#F5F5F0]/10">
            <label className="text-[8px] opacity-40 uppercase">Location</label>
            <input type="text" value={form.location || ''} onChange={e => setForm({...form, location: e.target.value})} className="w-full bg-transparent border-b border-[#F5F5F0]/10 py-1 text-xs focus:outline-none" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-xl font-poster border-b border-[#F5F5F0]/10 pb-4">SECURITY</h3>
        <input type="password" value={form.adminPassword} onChange={e => setForm({...form, adminPassword: e.target.value})} className="w-full bg-black border-b border-[#F5F5F0]/20 py-2 focus:outline-none" placeholder="NEW PASSWORD" />
      </div>

      <button type="submit" className="w-full py-6 bg-white text-black font-black uppercase text-sm tracking-[0.2em]">SAVE CONFIGURATION</button>
    </form>
  );
};

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

  useEffect(() => {
    if (localStorage.getItem(ADMIN_AUTH_KEY) === 'true') setIsLoggedIn(true);
  }, []);

  useEffect(() => { if (isLoggedIn) loadData(); }, [isLoggedIn]);

  if (!isLoggedIn) return <AuthGateway onSuccess={() => { setIsLoggedIn(true); localStorage.setItem(ADMIN_AUTH_KEY, 'true'); }} message={message} setMessage={setMessage} />;

  return (
    <div className="container mx-auto px-6 py-32 min-h-screen flex flex-col lg:flex-row gap-16">
      <div className="lg:w-64 flex flex-col gap-4 uppercase font-black text-xs tracking-[0.2em]">
        <button onClick={() => setActiveTab('projects')} className={`p-4 border ${activeTab === 'projects' ? 'bg-white text-black' : 'border-[#F5F5F0]/20'}`}>PROJECTS</button>
        <button onClick={() => setActiveTab('settings')} className={`p-4 border ${activeTab === 'settings' ? 'bg-white text-black' : 'border-[#F5F5F0]/20'}`}>SETTINGS</button>
        <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem(ADMIN_AUTH_KEY); }} className="p-4 border border-rose-900 text-rose-900 mt-10">LOGOUT</button>
      </div>
      <div className="flex-grow">
        {message && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-white text-black text-[10px] font-black">{message}</div>}
        {activeTab === 'projects' ? <ProjectManager projects={projects} onRefresh={loadData} setMessage={setMessage} /> : settings && <SiteConfigForm settings={settings} onSave={dbService.updateSettings} setMessage={setMessage} />}
      </div>
    </div>
  );
};

export default Admin;