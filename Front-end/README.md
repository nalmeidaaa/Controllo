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

## Animações (GSAP)
Dependências: `gsap` e `@gsap/react` (rode `npm install`).

- `src/animations/gsap.js` — registro do GSAP, `useGSAP` e checagem de `prefers-reduced-motion`
- `src/animations/AutoAnimador.jsx` — observa o DOM e anima tudo que entra na tela (cards, tabelas, listas, modais, gaveta de perfil, alertas). Para incluir algo novo, adicione uma regra em `REGRAS`; para excluir uma área, use `data-sem-auto`
- `src/animations/interacoes.js` — tilt 3D e brilho nos cards, efeito de pressionar e pulso de clique nos botões
- `src/animations/NumeroAnimado.jsx` — contador animado (`<NumeroAnimado valor={n} />`)
- `src/animations/animations.css` — ajustes para o CSS não brigar com o GSAP (classe `.g-anim` desliga transições durante a animação)

Quem tem "reduzir movimento" ativo no sistema não vê as animações.
