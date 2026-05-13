-- Mensajes de contacto enviados desde el formulario público.
-- Insert público (sin auth), lectura solo por admin.

create type contact_message_status as enum ('nuevo', 'leido', 'respondido');

create table public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text,
  subject text not null,
  message text not null check (char_length(message) between 10 and 4000),
  status contact_message_status not null default 'nuevo',
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index idx_contact_brand on public.contact_messages(brand_id);
create index idx_contact_status on public.contact_messages(status);
create index idx_contact_created on public.contact_messages(created_at desc);

alter table public.contact_messages enable row level security;

-- Cualquiera puede enviar una consulta (incluso anónimos).
create policy "contact_anyone_insert" on public.contact_messages
  for insert with check (true);

-- Solo admin puede leer/modificar/borrar.
create policy "contact_admin_all" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());
