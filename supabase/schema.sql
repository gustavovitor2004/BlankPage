-- Habilitar extensão para UUIDs
create extension if not exists "pgcrypto";

-- =====================
-- Tabela: stories
-- =====================
create table public.stories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Sem título',
  description text,
  cover_image_url text,
  background_image_url text,
  background_opacity float default 0.5,
  background_blur float default 4,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- Tabela: chapters
-- =====================
create table public.chapters (
  id uuid default gen_random_uuid() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Novo Capítulo',
  content jsonb default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  content_text text default '',
  order_index integer default 0 not null,
  background_image_url text,
  background_opacity float default 0.5,
  background_blur float default 4,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- Tabela: user_settings
-- =====================
create table public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  theme text default 'light' not null,
  editor_font text default 'Lora' not null,
  editor_font_size integer default 18 not null,
  editor_line_height float default 1.8 not null,
  editor_paragraph_spacing integer default 16 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================
-- Row Level Security
-- =====================
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.user_settings enable row level security;

create policy "Usuários gerenciam suas próprias histórias" on public.stories
  for all using (auth.uid() = user_id);

create policy "Usuários gerenciam seus próprios capítulos" on public.chapters
  for all using (auth.uid() = user_id);

create policy "Usuários gerenciam suas próprias configurações" on public.user_settings
  for all using (auth.uid() = user_id);

-- =====================
-- Função: atualizar updated_at
-- =====================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stories_updated_at before update on public.stories
  for each row execute procedure public.handle_updated_at();

create trigger chapters_updated_at before update on public.chapters
  for each row execute procedure public.handle_updated_at();

create trigger user_settings_updated_at before update on public.user_settings
  for each row execute procedure public.handle_updated_at();

-- =====================
-- Storage: bucket para imagens de fundo
-- =====================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'backgrounds',
  'backgrounds',
  true,
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Políticas de storage
create policy "Upload de backgrounds" on storage.objects
  for insert with check (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Leitura pública de backgrounds" on storage.objects
  for select using (bucket_id = 'backgrounds');

create policy "Deleção de backgrounds próprios" on storage.objects
  for delete using (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Atualização de backgrounds próprios" on storage.objects
  for update using (
    bucket_id = 'backgrounds'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
