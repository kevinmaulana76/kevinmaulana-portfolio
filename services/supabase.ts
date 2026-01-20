
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Project, SiteSettings } from '../types.ts';

let cachedClient: SupabaseClient | null = null;

const getClient = (): SupabaseClient | null => {
  if (cachedClient) return cachedClient;

  const env = (window as any).process?.env || {};
  const url = env.SUPABASE_URL || '';
  const key = env.SUPABASE_ANON_KEY || '';

  if (url && key) {
    cachedClient = createClient(url, key);
    return cachedClient;
  }
  return null;
};

export const dbService = {
  checkHealth: async (): Promise<{ db: 'online' | 'offline' | 'unconfigured', ai: 'ready' | 'missing_key' }> => {
    // Force a re-check of environment variables for AI key as well
    const env = (window as any).process?.env || {};
    const aiKey = env.API_KEY || '';
    const aiStatus = aiKey ? 'ready' : 'missing_key';

    const supabase = getClient();
    if (!supabase) return { db: 'unconfigured', ai: aiStatus };

    try {
      const { error } = await supabase.from('site_settings').select('id').limit(1);
      if (error) throw error;
      return { db: 'online', ai: aiStatus };
    } catch (e) {
      console.error("Health Check Failed:", e);
      return { db: 'offline', ai: aiStatus };
    }
  },

  getProjects: async (): Promise<Project[]> => {
    const supabase = getClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return [];
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
    const supabase = getClient();
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
    const supabase = getClient();
    if (!supabase) throw new Error("Database not connected");
    const payload: any = {};
    if (updates.title) payload.title = updates.title;
    if (updates.category) payload.category = updates.category;
    if (updates.imageUrls) payload.image_urls = updates.imageUrls;
    if (updates.description) payload.description = updates.description;

    const { error } = await supabase.from('projects').update(payload).eq('id', id);
    if (error) throw error;
  },

  deleteProject: async (id: string): Promise<void> => {
    const supabase = getClient();
    if (!supabase) throw new Error("Database not connected");
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  },

  getSettings: async (): Promise<SiteSettings> => {
    const supabase = getClient();
    if (!supabase) {
      return {
        id: 'fallback',
        siteName: 'KEVIN MAULANA',
        designerName: 'Kevin Maulana',
        bio: 'Portfolio configuration pending...',
        heroSubtext: 'PLEASE CONFIGURE SUPABASE URL AND KEY IN ENVIRONMENT VARIABLES.',
        heroImage: '',
        contactEmail: 'hello@example.com',
        socialLinks: [],
        instagramUrl: '',
        behanceUrl: '',
        capabilities: 'Designer',
        adminPassword: 'admin',
        recoveryToken: 'RECOVERY',
        hideAdminLink: false
      } as SiteSettings;
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      // Fix: Return a complete SiteSettings object to avoid casting errors
      return { 
        id: 'error-fallback',
        siteName: 'PORTFOLIO', 
        designerName: 'Designer', 
        bio: '',
        heroImage: '',
        contactEmail: '',
        socialLinks: [],
        instagramUrl: '',
        behanceUrl: '',
        hideAdminLink: false 
      } as SiteSettings;
    }

    // Fix: Added missing instagramUrl, behanceUrl and mapped recoveryToken correctly
    return {
      id: data.id,
      siteName: data.site_name,
      designerName: data.designer_name,
      bio: data.bio,
      heroSubtext: data.hero_subtext,
      heroImage: data.hero_image,
      heroImages: data.hero_images || [],
      contactEmail: data.contact_email,
      socialLinks: data.social_links || [],
      instagramUrl: data.instagram_url || '',
      behanceUrl: data.behance_url || '',
      phone: data.phone,
      location: data.location,
      capabilities: data.capabilities,
      adminPassword: data.admin_password,
      recoveryToken: data.recovery_token,
      hideAdminLink: data.hide_admin_link
    } as SiteSettings;
  },

  updateSettings: async (updates: Partial<SiteSettings>): Promise<void> => {
    const supabase = getClient();
    if (!supabase) throw new Error("Database not connected");
    const settings = await dbService.getSettings();
    const payload: any = {};
    
    if (updates.siteName !== undefined) payload.site_name = updates.siteName;
    if (updates.designerName !== undefined) payload.designer_name = updates.designerName;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.heroSubtext !== undefined) payload.hero_subtext = updates.heroSubtext;
    if (updates.contactEmail !== undefined) payload.contact_email = updates.contactEmail;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.capabilities !== undefined) payload.capabilities = updates.capabilities;
    if (updates.socialLinks !== undefined) payload.social_links = updates.socialLinks;
    // Fix: Added instagramUrl and behanceUrl to update payload
    if (updates.instagramUrl !== undefined) payload.instagram_url = updates.instagramUrl;
    if (updates.behanceUrl !== undefined) payload.behance_url = updates.behanceUrl;
    if (updates.adminPassword !== undefined) payload.admin_password = updates.adminPassword;
    if (updates.recoveryToken !== undefined) payload.recovery_token = updates.recoveryToken;
    if (updates.hideAdminLink !== undefined) payload.hide_admin_link = updates.hideAdminLink;
    if (updates.heroImages !== undefined) payload.hero_images = updates.heroImages;
    if (updates.heroImage !== undefined) payload.hero_image = updates.heroImage;

    const { error } = await supabase.from('site_settings').update(payload).eq('id', settings.id);
    if (error) throw error;
    window.dispatchEvent(new Event('storage'));
  }
};
