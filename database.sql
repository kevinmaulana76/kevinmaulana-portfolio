-- 1. Create Projects Table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  image_urls text[] not null default '{}',
  description text,
  created_at timestamp with time zone default now()
);

-- 2. Create Site Settings Table
create table if not exists site_settings (
  id uuid default gen_random_uuid() primary key,
  site_name text default 'KEVIN MAULANA',
  designer_name text default 'Kevin Maulana',
  bio text default 'Graphic Designer focused on Social Media posters and high-impact visual communication.',
  hero_image text,
  hero_images text[] default '{}',
  contact_email text default 'hello@example.com',
  phone text default '+62 812 3456 7890',
  location text default 'Jakarta, Indonesia',
  capabilities text default 'Poster Design\nSocial Media Branding\nTypography\nVisual Identity',
  social_links jsonb default '[]',
  admin_password text default 'admin',
  recovery_token text default 'RECOVERY-123456',
  hide_admin_link boolean default false,
  updated_at timestamp with time zone default now()
);

-- 3. Enable Row Level Security (RLS)
-- Note: For a simple portfolio where you manage auth via a password check in the UI, 
-- we allow public (anon) access to everything. For production, consider Supabase Auth.
alter table projects enable row level security;
alter table site_settings enable row level security;

-- 4. Create Policies
create policy "Public Access Projects" on projects for all using (true);
create policy "Public Access Settings" on site_settings for all using (true);

-- 5. Insert Initial Configuration (only if table is empty)
insert into site_settings (
  site_name, 
  designer_name, 
  bio, 
  contact_email, 
  social_links, 
  admin_password, 
  recovery_token
)
select 
  'KEVIN MAULANA', 
  'Kevin Maulana', 
  'Graphic Designer focused on Social Media posters.', 
  'hello@example.com', 
  '[{"id": "initial-1", "label": "Instagram", "url": "https://instagram.com"}]'::jsonb, 
  'admin', 
  'REC-' || upper(substring(gen_random_uuid()::text, 1, 8))
where not exists (select 1 from site_settings);
