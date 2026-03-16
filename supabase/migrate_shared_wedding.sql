alter table public.weddings
  add column if not exists invite_code text;

update public.weddings
set invite_code = upper(substr(md5(id::text || now()::text), 1, 10))
where invite_code is null;

alter table public.weddings
  alter column invite_code set not null;

create unique index if not exists weddings_invite_code_key
  on public.weddings (invite_code);

create table if not exists public.wedding_members (
  wedding_id int not null references public.weddings(id) on delete cascade,
  user_id int not null references public.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (wedding_id, user_id),
  unique (user_id)
);

insert into public.wedding_members (wedding_id, user_id, role)
select w.id, w.user_id, 'owner'
from public.weddings w
left join public.wedding_members wm
  on wm.wedding_id = w.id and wm.user_id = w.user_id
where wm.wedding_id is null;
