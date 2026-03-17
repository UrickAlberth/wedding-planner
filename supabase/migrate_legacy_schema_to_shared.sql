-- Migrates legacy single-wedding schema to the shared schema used by this app.
-- Safe to run multiple times.

begin;

-- 1) Ensure core tables exist (current app model)
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

-- 2) Create/update a migration user
insert into public.users (open_id, name, role)
values ('legacy-migration-user', 'Legacy Migration', 'admin')
on conflict (open_id) do nothing;

-- 3) Ensure at least one wedding exists (using wedding_settings when available)
do $$
begin
  if not exists (select 1 from public.weddings) then
    if exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = 'wedding_settings'
    ) then
      insert into public.weddings (user_id, invite_code, bride_name, groom_name, wedding_date)
      select
        u.id,
        upper(substr(md5((u.id::text || now()::text)), 1, 10)),
        'Noiva',
        'Noivo',
        coalesce(ws.wedding_date::timestamptz, now())
      from public.users u
      left join lateral (
        select wedding_date from public.wedding_settings order by id asc limit 1
      ) ws on true
      where u.open_id = 'legacy-migration-user'
      limit 1;
    else
      insert into public.weddings (user_id, invite_code, bride_name, groom_name, wedding_date)
      select
        u.id,
        upper(substr(md5((u.id::text || now()::text)), 1, 10)),
        'Noiva',
        'Noivo',
        now()
      from public.users u
      where u.open_id = 'legacy-migration-user'
      limit 1;
    end if;
  end if;
end $$;

insert into public.wedding_members (wedding_id, user_id, role)
select w.id, w.user_id, 'owner'
from public.weddings w
left join public.wedding_members wm
  on wm.wedding_id = w.id and wm.user_id = w.user_id
where wm.wedding_id is null;

-- 4) Tasks: legacy `done` -> current `completed`, add tenancy + updated_at
alter table if exists public.tasks
  add column if not exists wedding_id int,
  add column if not exists completed boolean,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'tasks'
      and column_name = 'done'
  ) then
    execute 'update public.tasks set completed = coalesce(completed, done) where completed is null';
  end if;
end $$;

update public.tasks
set completed = false
where completed is null;

update public.tasks
set wedding_id = (select id from public.weddings order by id asc limit 1)
where wedding_id is null;

alter table if exists public.tasks
  alter column completed set not null,
  alter column completed set default false,
  alter column wedding_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_wedding_id_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_wedding_id_fkey
      foreign key (wedding_id) references public.weddings(id) on delete cascade;
  end if;
end $$;

-- 5) Guests: legacy columns -> current columns + tenancy + updated_at
alter table if exists public.guests
  add column if not exists wedding_id int,
  add column if not exists side text,
  add column if not exists role text,
  add column if not exists confirmed boolean,
  add column if not exists present boolean,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'owner_side'
  ) then
    execute 'update public.guests set side = coalesce(side, owner_side) where side is null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'guest_role'
  ) then
    execute 'update public.guests set role = coalesce(role, guest_role) where role is null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'guests'
      and column_name = 'confirmed_presence'
  ) then
    execute 'update public.guests set confirmed = coalesce(confirmed, confirmed_presence) where confirmed is null';
  end if;
end $$;

update public.guests
set side = 'noiva'
where side is null;

update public.guests
set role = 'convidado'
where role is null;

update public.guests
set confirmed = false
where confirmed is null;

update public.guests
set present = false
where present is null;

update public.guests
set wedding_id = (select id from public.weddings order by id asc limit 1)
where wedding_id is null;

alter table if exists public.guests
  alter column side set not null,
  alter column role set not null,
  alter column confirmed set not null,
  alter column confirmed set default false,
  alter column present set not null,
  alter column present set default false,
  alter column wedding_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'guests_side_check'
      and conrelid = 'public.guests'::regclass
  ) then
    alter table public.guests
      add constraint guests_side_check check (side in ('noiva', 'noivo'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'guests_wedding_id_fkey'
      and conrelid = 'public.guests'::regclass
  ) then
    alter table public.guests
      add constraint guests_wedding_id_fkey
      foreign key (wedding_id) references public.weddings(id) on delete cascade;
  end if;
end $$;

-- 6) Expenses: legacy columns -> current columns + tenancy + schedule fields
alter table if exists public.expenses
  add column if not exists wedding_id int,
  add column if not exists total_value numeric(10,2),
  add column if not exists entry_value numeric(10,2),
  add column if not exists entry_installments int,
  add column if not exists entry_start_date text,
  add column if not exists payment_start_date text,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'expenses'
      and column_name = 'value'
  ) then
    execute 'update public.expenses set total_value = coalesce(total_value, value) where total_value is null';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'expenses'
      and column_name = 'down_payment'
  ) then
    execute 'update public.expenses set entry_value = coalesce(entry_value, down_payment) where entry_value is null';
  end if;
end $$;

update public.expenses
set total_value = 0
where total_value is null;

update public.expenses
set entry_value = 0
where entry_value is null;

update public.expenses
set entry_installments = 1
where entry_installments is null;

update public.expenses
set entry_start_date = coalesce(to_char(created_at::date, 'YYYY-MM-DD'), to_char(now()::date, 'YYYY-MM-DD'))
where entry_start_date is null;

update public.expenses
set payment_start_date = coalesce(to_char(created_at::date, 'YYYY-MM-DD'), to_char(now()::date, 'YYYY-MM-DD'))
where payment_start_date is null;

update public.expenses
set wedding_id = (select id from public.weddings order by id asc limit 1)
where wedding_id is null;

alter table if exists public.expenses
  alter column total_value set not null,
  alter column total_value set default 0,
  alter column entry_value set not null,
  alter column entry_value set default 0,
  alter column payment_method set default 'pix',
  alter column entry_installments set not null,
  alter column entry_installments set default 1,
  alter column installments set default 1,
  alter column entry_start_date set not null,
  alter column payment_start_date set not null,
  alter column wedding_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'expenses_total_value_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_total_value_check check (total_value >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'expenses_entry_value_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_entry_value_check check (entry_value >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'expenses_installments_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_installments_check check (installments >= 1);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'expenses_entry_installments_check'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_entry_installments_check check (entry_installments >= 1);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'expenses_wedding_id_fkey'
      and conrelid = 'public.expenses'::regclass
  ) then
    alter table public.expenses
      add constraint expenses_wedding_id_fkey
      foreign key (wedding_id) references public.weddings(id) on delete cascade;
  end if;
end $$;

-- 7) Migrate agenda_items to events (if legacy table exists)
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'agenda_items'
  ) then
    execute $sql$
      insert into public.events (wedding_id, title, date, time, description, created_at, updated_at)
      select
        (select id from public.weddings order by id asc limit 1) as wedding_id,
        ai.title,
        to_char(ai.event_date, 'YYYY-MM-DD') as date,
        '00:00' as time,
        null as description,
        ai.created_at,
        now() as updated_at
      from public.agenda_items ai
      where not exists (
        select 1
        from public.events e
        where e.title = ai.title
          and e.date = to_char(ai.event_date, 'YYYY-MM-DD')
          and e.wedding_id = (select id from public.weddings order by id asc limit 1)
      );
    $sql$;
  end if;
end $$;

-- 8) Updated-at trigger
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

commit;
