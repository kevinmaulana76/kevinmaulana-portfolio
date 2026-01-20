export interface Project {
  id: string;
  title: string;
  category: string;
  imageUrls: string[];
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
  socialLinks: SocialLink[];
  instagramUrl: string;
  behanceUrl: string;
  dribbbleUrl?: string;
  phone?: string;
  location?: string;
  capabilities?: string;
  adminPassword?: string;
  recoveryToken?: string; // New: Secret for resetting password
  hideAdminLink?: boolean;
}

export type DesignCategory = 'Social Media' | 'Branding' | 'Illustration' | 'UI/UX' | 'Typography' | 'Motion' | 'Print';

export const DESIGN_CATEGORIES: DesignCategory[] = ['Social Media', 'Branding', 'Illustration', 'UI/UX', 'Typography', 'Motion', 'Print'];