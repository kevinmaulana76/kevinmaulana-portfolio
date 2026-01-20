-- 1. Ensure Tables Exist
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  image_urls text[] not null default '{}',
  description text,
  created_at timestamp with time zone default now()
);

create table if not exists site_settings (
  id uuid default gen_random_uuid() primary key,
  site_name text default 'KEVIN MAULANA',
  designer_name text default 'Kevin Maulana',
  bio text default 'Graphic Designer focused on Social Media posters and high-impact visual communication.',
  hero_subtext text default 'HELLO I AM KEVIN MAULANA. DESIGNER FOCUSED ON VISUAL IMPACT.',
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

-- 2. Handle Schema Evolution (Add columns if they were missing from older versions)
do $$ 
begin
  if not exists (select from information_schema.columns where table_name='site_settings' and column_name='hero_subtext') then
    alter table site_settings add column hero_subtext text default 'HELLO I AM KEVIN MAULANA. DESIGNER FOCUSED ON VISUAL IMPACT.';
  end if;

  if not exists (select from information_schema.columns where table_name='site_settings' and column_name='hero_images') then
    alter table site_settings add column hero_images text[] default '{}';
  end if;

  if not exists (select from information_schema.columns where table_name='site_settings' and column_name='hide_admin_link') then
    alter table site_settings add column hide_admin_link boolean default false;
  end if;
end $$;

-- 3. Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table site_settings enable row level security;

-- 4. Create Policies Safely (Using DO blocks to avoid "already exists" errors)
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'projects' and policyname = 'Public Access Projects'
  ) then
    create policy "Public Access Projects" on projects for all using (true);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'site_settings' and policyname = 'Public Access Settings'
  ) then
    create policy "Public Access Settings" on site_settings for all using (true);
  end if;
end $$;

-- 5. Insert Initial Configuration (Only if table is empty)
insert into site_settings (
  site_name, 
  designer_name, 
  bio, 
  hero_subtext,
  contact_email, 
  social_links, 
  admin_password, 
  recovery_token,
  hero_images
)
select 
  'KEVIN MAULANA', 
  'Kevin Maulana', 
  'Graphic Designer focused on Social Media posters.', 
  'HELLO I AM KEVIN MAULANA. DESIGNER FOCUSED ON VISUAL IMPACT.',
  'hello@example.com', 
  '[{"id": "initial-1", "label": "Instagram", "url": "https://instagram.com"}]'::jsonb, 
  'admin', 
  'REC-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  '{}'
where not exists (select 1 from site_settings);
