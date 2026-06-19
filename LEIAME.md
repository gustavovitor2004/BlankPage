# Escrever — Site de escrita criativa

Site minimalista e elegante para escrever histórias e livros.

## Stack

- **Next.js 15** (App Router)
- **Supabase** — Postgres + Auth + Storage
- **Tiptap** — editor de texto rico
- **Tailwind CSS**
- Deploy: **Vercel**

## Configuração inicial

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. No SQL Editor, execute o conteúdo de `supabase/schema.sql`
3. Anote a **Project URL** e a **anon key** (em Settings → API)

### 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (copie de `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Deploy na Vercel

1. Faça push do projeto para um repositório GitHub
2. Importe o repositório na [Vercel](https://vercel.com)
3. Em **Environment Variables**, adicione as mesmas variáveis do `.env.local`
4. Clique em **Deploy**

### 4. Desenvolvimento local

```bash
npm install
npm run dev
```

Acesse em `http://localhost:3000`

## Funcionalidades

- **Biblioteca** — galeria de todas as histórias com capas
- **Capítulos** — organização por capítulos com contagem de palavras
- **Editor rico** — fontes literárias, formatação completa, salvamento automático
- **Autocomplete `@`** — digitar `@` sugere nomes já usados na história
- **Imagens de fundo** — upload com controle de opacidade e desfoque
- **Tema claro/escuro** — alternância com persistência local
- **Modo leitura** — exibição em páginas duplas como livro aberto
- **Exportar** — download em formato Markdown (.md)

## Fontes disponíveis no editor

- Lora
- Cormorant Garamond
- Playfair Display
- EB Garamond
- Crimson Text
- Source Serif 4
