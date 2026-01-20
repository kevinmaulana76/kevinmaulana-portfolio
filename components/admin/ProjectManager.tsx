import React, { useState, useRef } from 'react';
import { Project, DESIGN_CATEGORIES, DesignCategory } from '../../types.ts';
import { dbService } from '../../services/supabase.ts';
import { generateDescription } from '../../services/gemini.ts';
import { compressImage } from '../../utils/helpers.ts';

interface ProjectManagerProps {
  projects: Project[];
  onRefresh: () => void;
  setMessage: (m: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, onRefresh, setMessage }) => {
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
              <div className="flex gap-4 items-end">
                <div className="flex-grow">
                   <textarea value={editingProject.description || ''} onChange={e => setEditingProject({...editingProject, description: e.target.value})} className="w-full bg-black border border-[#F5F5F0]/20 p-4 h-24 focus:outline-none text-xs" placeholder="DESCRIPTION" />
                </div>
                <button type="button" onClick={handleAI} disabled={isGenerating} className="p-4 border border-[#F5F5F0]/20 hover:bg-white hover:text-black transition-all group">
                   <i className={`fas fa-wand-magic-sparkles ${isGenerating ? 'animate-spin' : ''}`}></i>
                </button>
              </div>
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