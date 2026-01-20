
export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrls: string[]; // Changed from imageUrl to imageUrls array
  description: string;
  createdAt: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  designerName: string;
  bio: string;
  heroImage: string;
  heroImages?: string[];
  contactEmail: string;
  socialLinks: SocialLink[]; // Dynamic social media links
  instagramUrl: string; // Keep for legacy/fallback or simple usage
  behanceUrl: string;
  dribbbleUrl?: string;
  phone?: string;
  location?: string;
  capabilities?: string;
  adminPassword?: string;
  hideAdminLink?: boolean;
}

export type DesignCategory = 'Social Media' | 'Branding' | 'Illustration' | 'UI/UX' | 'Typography';

export const DESIGN_CATEGORIES: DesignCategory[] = ['Social Media', 'Branding', 'Illustration', 'UI/UX', 'Typography'];
