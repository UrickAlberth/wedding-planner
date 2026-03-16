create table if not exists public.users (
  id int generated always as identity primary key,
  open_id text not null unique,
  name text,
  email text,
  login_method text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_signed_in timestamptz not null default now()
);

create table if not exists public.weddings (
  id int generated always as identity primary key,
  user_id int not null references public.users(id) on delete cascade,
  invite_code text not null unique,
  bride_name text not null,
  groom_name text not null,
  wedding_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_members (
  wedding_id int not null references public.weddings(id) on delete cascade,
  user_id int not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id),
  unique (user_id)
);

create table if not exists public.events (
  id int generated always as identity primary key,
  wedding_id int not null references public.weddings(id) on delete cascade,
  title text not null,
  date text not null,
  time text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id int generated always as identity primary key,
  wedding_id int not null references public.weddings(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guests (
  id int generated always as identity primary key,
  wedding_id int not null references public.weddings(id) on delete cascade,
  name text not null,
  side text not null check (side in ('noiva', 'noivo')),
  role text not null,
  confirmed boolean not null default false,
  present boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id int generated always as identity primary key,
  wedding_id int not null references public.weddings(id) on delete cascade,
  item text not null,
  total_value numeric(10,2) not null default 0,
  payment_method text not null,
  entry_value numeric(10,2) not null default 0,
  entry_installments int not null default 1,
  entry_start_date text not null,
  installments int not null default 1,
  payment_start_date text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at before update on public.users
for each row execute procedure public.set_updated_at();

drop trigger if exists weddings_set_updated_at on public.weddings;
create trigger weddings_set_updated_at before update on public.weddings
for each row execute procedure public.set_updated_at();

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
for each row execute procedure public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
for each row execute procedure public.set_updated_at();

drop trigger if exists guests_set_updated_at on public.guests;
create trigger guests_set_updated_at before update on public.guests
for each row execute procedure public.set_updated_at();

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at before update on public.expenses
for each row execute procedure public.set_updated_at();
