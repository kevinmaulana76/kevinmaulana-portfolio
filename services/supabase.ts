
import { Project, SiteSettings } from '../types';

const STORAGE_KEY_PROJECTS = 'design_portfolio_projects_v3'; // Incremented version for migration
const STORAGE_KEY_SETTINGS = 'design_portfolio_settings_v2';

// Initial data for fresh installation
const initialSettings: SiteSettings = {
  id: '1',
  siteName: 'KEVIN MAULANA',
  designerName: 'Kevin Maulana',
  bio: 'Kevin Maulana is a visionary Graphic Designer specializing in high-impact social media aesthetics and minimalist poster art. He bridges the gap between commercial branding and experimental visual storytelling through bold typography and raw, emotive layouts.',
  heroImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
  heroImages: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop'
  ],
  contactEmail: 'contact@kevinmaulana.design',
  instagramUrl: 'https://instagram.com/kevinmaulana',
  behanceUrl: '#',
  dribbbleUrl: '#',
  socialLinks: [
    { id: '1', label: 'Instagram', url: 'https://instagram.com/kevinmaulana' },
    { id: '2', label: 'Behance', url: '#' },
    { id: '3', label: 'Dribbble', url: '#' }
  ],
  phone: '+62 812 4634 5166',
  location: 'JAKARTA, ID',
  capabilities: 'Adobe Photoshop\nAdobe Illustrator\nFigma / UI Design\nBrand Strategy',
  adminPassword: 'admin',
  hideAdminLink: false
};

const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Cyberpunk Festival 2024',
    category: 'Social Media',
    imageUrls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop'],
    description: 'A neon-infused social media promotion for an electronic music festival.',
    createdAt: Date.now() - 1000000
  },
  {
    id: '2',
    title: 'Minimalist Architecture',
    category: 'Branding',
    imageUrls: ['https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop'],
    description: 'Clean aesthetic for a luxury interior design agency.',
    createdAt: Date.now() - 2000000
  }
];

// Service object that can be easily swapped with Supabase Client SDK
export const dbService = {
  getProjects: async (): Promise<Project[]> => {
    const data = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!data) {
      // Basic migration check for old single imageUrl format
      const oldData = localStorage.getItem('design_portfolio_projects_v2');
      if (oldData) {
        const parsed = JSON.parse(oldData);
        const migrated = parsed.map((p: any) => ({
          ...p,
          imageUrls: p.imageUrl ? [p.imageUrl] : []
        }));
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(migrated));
        return migrated;
      }
      localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(initialProjects));
      return initialProjects;
    }
    return JSON.parse(data).sort((a: Project, b: Project) => b.createdAt - a.createdAt);
  },

  saveProject: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const projects = await dbService.getProjects();
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };
    projects.push(newProject);
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
    const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(initialSettings));
      return initialSettings;
    }
    return JSON.parse(data);
  },

  updateSettings: async (updates: Partial<SiteSettings>): Promise<void> => {
    const settings = await dbService.getSettings();
    const updated = { ...settings, ...updates };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    // Trigger storage event for cross-tab sync if needed
    window.dispatchEvent(new Event('storage'));
  }
};
