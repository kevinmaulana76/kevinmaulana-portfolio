import { Project, SiteSettings } from '../types.ts';

// Note: To use real Supabase, you would typically import { createClient } from '@supabase/supabase-js'
// But for this environment, we'll implement a robust persistent layer that mimics it 
// and can be easily swapped for a real client.

const STORAGE_KEY_PROJECTS = 'kevin_portfolio_projects_v1';
const STORAGE_KEY_SETTINGS = 'kevin_portfolio_settings_v1';

const initialSettings: SiteSettings = {
  id: '1',
  siteName: 'KEVIN MAULANA',
  designerName: 'Kevin Maulana',
  bio: 'Specializing in high-impact social media aesthetics and minimalist poster art. Kevin bridges the gap between commercial branding and experimental visual storytelling.',
  heroImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  heroImages: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop'
  ],
  contactEmail: 'hello@kevinmaulana.com',
  instagramUrl: 'https://instagram.com/kevinmaulana',
  behanceUrl: '#',
  socialLinks: [
    { id: '1', label: 'Instagram', url: 'https://instagram.com/kevinmaulana' },
    { id: '2', label: 'Behance', url: '#' },
    { id: '3', label: 'Dribbble', url: '#' }
  ],
  phone: '+62 812 3456 7890',
  location: 'Jakarta, Indonesia',
  capabilities: 'Social Media Design\nPoster Art\nTypography\nBrand Identity',
  adminPassword: 'admin',
  recoveryToken: 'KEVIN_2024_RECOVERY',
  hideAdminLink: false
};

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Future Rhythms',
    category: 'Social Media',
    imageUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'],
    description: 'Exploration of neo-brutalist typography for electronic music event series.',
    createdAt: Date.now() - 1000
  },
  {
    id: '2',
    title: 'Visual Noise',
    category: 'Typography',
    imageUrls: ['https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop'],
    description: 'Experimental typographic layout focusing on negative space and texture.',
    createdAt: Date.now() - 2000
  }
];

export const dbService = {
  getProjects: async (): Promise<Project[]> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initialProjects));
        return initialProjects;
      }
      return JSON.parse(data).sort((a: Project, b: Project) => b.createdAt - a.createdAt);
    } catch (e) {
      console.error("DB Error:", e);
      return initialProjects;
    }
  },

  saveProject: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const projects = await dbService.getProjects();
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    projects.unshift(newProject);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    return newProject;
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
    const projects = await dbService.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates };
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    }
  },

  deleteProject: async (id: string): Promise<void> => {
    const projects = await dbService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
  },

  getSettings: async (): Promise<SiteSettings> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(initialSettings));
        return initialSettings;
      }
      return JSON.parse(data);
    } catch (e) {
      return initialSettings;
    }
  },

  updateSettings: async (updates: Partial<SiteSettings>): Promise<void> => {
    const settings = await dbService.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};