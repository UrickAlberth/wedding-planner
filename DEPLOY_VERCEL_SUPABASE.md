# Deploy Vercel + Firebase (Auth + Firestore)

## 1) Banco no Firestore

1. Crie (ou use) um projeto no Firebase.
2. Em Firestore Database, crie o banco em modo Native.
3. Em Authentication > Sign-in method, habilite Email/Password.
4. Em Authentication > Settings > Authorized domains, adicione localhost e seu dominio da Vercel.

## 2) Variaveis na Vercel

Configure no projeto da Vercel (Production/Preview):

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_MEASUREMENT_ID (opcional)
- FIREBASE_PROJECT_ID
- FIREBASE_CLIENT_EMAIL
- FIREBASE_PRIVATE_KEY
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

## 4) Firebase Admin (backend)

1. Em Project settings > Service accounts, gere uma chave privada e configure:
  - FIREBASE_PROJECT_ID
  - FIREBASE_CLIENT_EMAIL
  - FIREBASE_PRIVATE_KEY (com quebras de linha escapadas como \n)
2. Garanta que a conta de servico tenha permissao para Firestore.

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
