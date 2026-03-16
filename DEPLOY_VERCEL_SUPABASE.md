# Deploy Vercel + Supabase

## 1) Banco no Supabase

1. Crie um projeto no Supabase.
2. Abra SQL Editor e rode o conteúdo de supabase/schema.sql.
3. Se o banco ja existe com schema legado (agenda_items, tasks.done, guests.owner_side etc), rode tambem supabase/migrate_legacy_schema_to_shared.sql.
4. Em Project Settings > API, copie:
   - Project URL
   - service_role key

## 2) Variaveis na Vercel

Configure no projeto da Vercel (Production/Preview):

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- OWNER_OPEN_ID
- BUILT_IN_FORGE_API_URL (se usar)
- BUILT_IN_FORGE_API_KEY (se usar)

## 3) Build e rotas

Este repositorio ja possui configuracao de Vercel em vercel.json:

- Frontend: build do Vite em dist/public
- API: funcao serverless em api/index.ts
- Rewrites:
  - /api/* -> /api
  - /* -> /index.html

## 4) Supabase Auth

1. No painel Supabase, habilite o provider Email.
2. Em Authentication > URL Configuration, adicione a URL de producao no Site URL.
3. Em Authentication > URL Configuration, adicione Preview URLs da Vercel se desejar testar previews.

## 5) Publicacao

1. Conecte o repositorio na Vercel.
2. Framework: Other.
3. Install command: pnpm install --no-frozen-lockfile.
4. Build command: pnpm build.
5. Output directory: dist/public.
6. Deploy.

## 6) Testes rapidos apos deploy

- GET /api/health deve retornar {"ok":true}
- Login deve funcionar em /login
- Dashboard deve listar/criar dados (tasks, guests, expenses, events)

## 7) Colaboracao noivo e noiva

1. Conta A faz login, entra no painel e copia o codigo em "Colaboracao do casal".
2. Conta B faz login com outro email e usa o mesmo codigo para entrar no mesmo planejamento.
3. Ambas as contas devem ver os mesmos eventos, tarefas, convidados e gastos.
