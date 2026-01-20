import React, { useState, useEffect } from 'react';
import { dbService } from '../services/supabase.ts';
import { Project, SiteSettings } from '../types.ts';
import { AuthGateway } from '../components/admin/AuthGateway.tsx';
import { SystemDiagnostics } from '../components/admin/SystemDiagnostics.tsx';
import { ProjectManager } from '../components/admin/ProjectManager.tsx';
import { SiteConfigForm } from '../components/admin/SiteConfigForm.tsx';
import { ADMIN_AUTH_KEY } from '../utils/helpers.ts';

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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    window.dispatchEvent(new Event('admin-auth-change'));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(ADMIN_AUTH_KEY);
    window.dispatchEvent(new Event('admin-auth-change'));
  };

  if (!isLoggedIn) {
    return (
      <AuthGateway 
        onSuccess={handleLoginSuccess} 
        message={message} 
        setMessage={setMessage} 
      />
    );
  }

  return (
    <div className="container mx-auto px-6 py-32 min-h-screen flex flex-col lg:flex-row gap-16">
      <div className="lg:w-64 flex flex-col gap-4 uppercase font-black text-xs tracking-[0.2em]">
        <button 
          onClick={() => setActiveTab('projects')} 
          className={`p-4 border ${activeTab === 'projects' ? 'bg-white text-black' : 'border-[#F5F5F0]/20'}`}
        >
          PROJECTS
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`p-4 border ${activeTab === 'settings' ? 'bg-white text-black' : 'border-[#F5F5F0]/20'}`}
        >
          SETTINGS
        </button>
        
        <div className="mt-auto space-y-4 pt-12">
          <SystemDiagnostics />
          <button 
            onClick={handleLogout} 
            className="w-full p-4 border border-rose-900 text-rose-900 mt-10 hover:bg-rose-900 hover:text-white transition-all"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="flex-grow">
        {message && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-white text-black text-[10px] font-black shadow-2xl">
            {message}
          </div>
        )}
        
        {activeTab === 'projects' ? (
          <ProjectManager 
            projects={projects} 
            onRefresh={loadData} 
            setMessage={setMessage} 
          />
        ) : (
          settings && (
            <SiteConfigForm 
              settings={settings} 
              onSave={dbService.updateSettings} 
              setMessage={setMessage} 
            />
          )
        )}
      </div>
    </div>
  );
};

export default Admin;