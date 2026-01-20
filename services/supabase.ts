import { createClient } from '@supabase/supabase-js';
import { Project, SiteSettings } from '../types.ts';

const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

// Inisialisasi client hanya jika konfigurasi tersedia
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase Configuration Missing: Database features will be disabled until SUPABASE_URL and SUPABASE_ANON_KEY are provided in environment variables.");
}

export const dbService = {
  getProjects: async (): Promise<Project[]> => {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase Projects Error:", error);
      return [];
    }
    
    return data.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      imageUrls: p.image_urls,
      description: p.description,
      createdAt: new Date(p.created_at).getTime()
    }));
  },

  saveProject: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<any> => {
    if (!supabase) throw new Error("Database not connected");
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: project.title,
        category: project.category,
        image_urls: project.imageUrls,
        description: project.description
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
    if (!supabase) throw new Error("Database not connected");
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.category) payload.category = updates.category;
    if (updates.imageUrls) payload.image_urls = updates.imageUrls;
    if (updates.description) payload.description = updates.description;

    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteProject: async (id: string): Promise<void> => {
    if (!supabase) throw new Error("Database not connected");
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getSettings: async (): Promise<SiteSettings> => {
    if (!supabase) {
      // Fallback data jika database belum siap
      return {
        id: 'fallback',
        siteName: 'KEVIN MAULANA',
        designerName: 'Kevin Maulana',
        bio: 'Portfolio configuration pending...',
        contactEmail: 'hello@example.com',
        socialLinks: [],
        instagramUrl: '',
        behanceUrl: '',
        capabilities: 'Designer',
        adminPassword: 'admin',
        recoveryToken: 'RECOVERY'
      } as SiteSettings;
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error("Supabase Settings Error:", error);
      return {} as SiteSettings;
    }

    return {
      id: data.id,
      siteName: data.site_name,
      designerName: data.designer_name,
      bio: data.bio,
      heroImage: data.hero_image,
      heroImages: data.hero_images,
      contactEmail: data.contact_email,
      socialLinks: data.social_links,
      phone: data.phone,
      location: data.location,
      capabilities: data.capabilities,
      adminPassword: data.admin_password,
      recoveryToken: data.recovery_token
    } as SiteSettings;
  },

  updateSettings: async (updates: Partial<SiteSettings>): Promise<void> => {
    if (!supabase) throw new Error("Database not connected");
    const settings = await dbService.getSettings();
    const payload: any = {};
    
    if (updates.siteName !== undefined) payload.site_name = updates.siteName;
    if (updates.designerName !== undefined) payload.designer_name = updates.designerName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.contactEmail !== undefined) payload.contact_email = updates.contactEmail;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.capabilities !== undefined) payload.capabilities = updates.capabilities;
    if (updates.socialLinks !== undefined) payload.social_links = updates.socialLinks;
    if (updates.adminPassword !== undefined) payload.admin_password = updates.adminPassword;

    const { error } = await supabase
      .from('site_settings')
      .update(payload)
      .eq('id', settings.id);
    
    if (error) throw error;
    window.dispatchEvent(new Event('storage'));
  }
};