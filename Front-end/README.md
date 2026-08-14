# Controllo — Front-end (React)

Conversão do front-end original (HTML/JS puro + manipulação de DOM) para **React + Vite**.

## Estrutura
- `src/pages` — páginas (Login, Dashboard, Usuários, Salas, Criar/Editar/Visualizar Sala)
- `src/components` — componentes reutilizáveis (Navbar, Modais, Tabela, Cards, Paginação)
- `src/services` — chamadas à API (axios), mantidas como no projeto original
- `src/storage` — persistência do usuário logado em localStorage
- `src/config` — constantes de paginação

## Rodando localmente
```bash
npm install
npm run dev
```

A API é esperada em `http://localhost:8000` (mesma configuração do projeto original).

## Build de produção
```bash
npm run build
```
