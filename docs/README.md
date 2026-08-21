# 📋 Documentação do Projeto — Controllo

> Sistema web de gerenciamento de patrimônio, manutenção e usuários institucionais.

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Requisitos Funcionais Implementados](#requisitos-funcionais-implementados)
4. [Configuração do Ambiente](#configuração-do-ambiente)
5. [Back-end](#back-end)
6. [Front-end](#front-end)
7. [Banco de Dados](#banco-de-dados)
8. [API — Referência de Endpoints](#api--referência-de-endpoints)
9. [Autenticação e Autorização](#autenticação-e-autorização)
10. [Design System](#design-system)

---

## Visão Geral

O **Controllo** é um sistema institucional de controle de patrimônio e ordens de serviço. Ele permite que administradores gerenciem usuários, patrimônios e requisições de manutenção, com controle de acesso por perfil (Administração, Manutenção e Geral).

O projeto é dividido em duas partes independentes:

- **Back-end**: API REST em Node.js + Express com autenticação JWT e banco de dados MySQL.
- **Front-end**: Aplicação SPA (Single Page Application) em JavaScript puro com Vite, consumindo a API via Axios.

---

## Arquitetura

```
Controllo/
├── Back-end/
│   └── src/
│       ├── configs/        # Conexão com o banco (Singleton)
│       ├── controllers/    # Lógica de cada recurso
│       ├── enums/          # Enumerações (tipos de usuário)
│       ├── middlewares/    # Autenticação JWT e autorização por perfil
│       ├── models/         # Classes de domínio com validação
│       ├── repositories/   # Acesso ao banco de dados (SQL)
│       ├── routes/         # Definição das rotas
│       ├── utils/          # Funções utilitárias
│       └── server.js       # Ponto de entrada do servidor
│
└── Front-end/
    └── src/
        ├── components/     # Componentes reutilizáveis de UI
        ├── config/         # Configurações (paginação, etc.)
        ├── pages/          # Páginas da aplicação
        ├── services/       # Camada de comunicação com a API
        ├── storage/        # Gerenciamento de sessão local
        ├── layout.js       # Montagem do layout (navbar + sidebar)
        ├── main.js         # Ponto de entrada e roteamento
        └── style.css       # Estilos globais
```

---

## Requisitos Funcionais Implementados

| ID      | Descrição |
|---------|-----------|
| RF-004  | O sistema permite que administradores realizem o **cadastro** de usuários |
| RF-005  | O sistema permite que administradores realizem a **edição** de usuários |
| RF-006  | O sistema permite que administradores realizem a **exclusão** de usuários |
| RF-007  | O sistema controla **níveis de acesso** conforme o perfil do usuário (Administração, Manutenção, Geral) |

---

## Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- MySQL 8+
- npm

### Back-end

```bash
# 1. Entrar na pasta
cd Back-end

# 2. Instalar dependências
npm install

# 3. Criar o arquivo .env com as variáveis abaixo:
```

**Arquivo `.env`:**

```env
SERVER_PORT=8000

DB_HOST=localhost
DB_DATABASE=controllo
DB_USER=root
DB_PASSWORD=1234
DB_PORT=3306

JWT_SECRET=segredo_super_secreto

# 4. Criar o banco de dados (ver seção Banco de Dados)

# 5. Iniciar o servidor
node src/server.js
```

O servidor ficará disponível em `http://localhost:8000`.

### Front-end

```bash
# 1. Entrar na pasta
cd Front-end

# 2. Instalar dependências
npm install

# 3. Iniciar em modo desenvolvimento
npm run dev
```

> A URL da API está configurada em `src/services/usuarios/usuario.api.js` como `http://localhost:8000/usuarios`. Altere se necessário.

---

## Back-end

### Tecnologias

| Pacote | Versão | Função |
|--------|--------|--------|
| express | ^5.2.1 | Framework HTTP |
| mysql2 | ^3.22.3 | Conexão com MySQL |
| bcrypt | ^6.0.0 | Hash de senhas |
| jsonwebtoken | ^9.0.3 | Geração e verificação de tokens JWT |
| dotenv | ^17.4.2 | Variáveis de ambiente |
| cors | ^2.8.6 | Política CORS |

### Estrutura de camadas

**`configs/Database.js`** — Conexão com MySQL usando o padrão **Singleton** com pool de conexões. Garante que apenas uma instância do pool seja criada durante o ciclo de vida da aplicação.

**`models/Usuario.js`** — Classe de domínio com getters/setters privados e validações embutidas (nome mínimo 3 chars, CPF válido, e-mail com regex, senha mínima 6 chars). Expõe dois factory methods: `Usuario.criar()` e `Usuario.editar()`.

**`repositories/usuarioRepository.js`** — Toda a lógica SQL está encapsulada aqui. Usa transações para operações que envolvem múltiplas tabelas (ex.: criar usuário insere também na tabela de perfil correspondente).

**`controllers/usuarioController.js`** — Recebe requisições HTTP, instancia o model, chama o repository e retorna a resposta JSON.

**`middlewares/auth.middleware.js`** — Verifica o token JWT no header `Authorization: Bearer <token>`. Caso não exista nenhum administrador no banco, permite a criação do primeiro sem autenticação (bootstrap).

**`middlewares/role.middleware.js`** — Middleware de autorização por perfil. Recebe um array de perfis permitidos e bloqueia com `403` caso o perfil do usuário autenticado não esteja na lista.

---

## Front-end

### Tecnologias

| Pacote | Função |
|--------|--------|
| Vite | Bundler e servidor de desenvolvimento |
| Axios | Cliente HTTP para consumo da API |
| Bootstrap (via CDN) | Grid e utilitários de layout |

### Roteamento

O Controllo não usa um framework de roteamento. A navegação é controlada em `main.js` pelo objeto `navegarPara`, que é passado via parâmetro entre componentes e páginas:

```js
const navegarPara = {
    dashboard: () => dashboardPage(app, navegarPara),
    usuarios: () => usuariosPage(app, navegarPara),
};
```

Se o usuário não estiver autenticado (`estaLogado()` retorna `false`), o `loginPage` é exibido. Caso contrário, o `dashboardPage` é carregado.

### Gerenciamento de sessão

O módulo `src/storage/usuario/dados.storage.js` abstrai o `localStorage` para persistir o token JWT e os dados do usuário logado. O Axios intercepta respostas `401` para deslogar automaticamente e redirecionar ao login.

### Páginas e componentes

| Arquivo | Descrição |
|---------|-----------|
| `pages/usuario/login.page.js` | Tela de login |
| `pages/usuario/usuarios.page.js` | Listagem e gerenciamento de usuários |
| `pages/dashboard/dashboard.page.js` | Página inicial pós-login |
| `components/usuario/cardLogin.component.js` | Card de formulário de login |
| `components/usuario/tabelaUsuarios.component.js` | Tabela com paginação de usuários |
| `components/usuario/modalUsuario.component.js` | Modal de criação/edição de usuário |
| `components/layout/navbar.component.js` | Barra de navegação superior |
| `components/dashboard/dashboard.component.js` | Componente do painel principal |
| `components/shared/coluna-bootstrap.component.js` | Coluna Bootstrap reutilizável |

### Configurações globais

Em `src/config/app.config.js`:

```js
export const ITENS_POR_PAGINA = 10;  // Registros por página na tabela
export const MAX_BOTOES = 5;          // Botões visíveis na paginação
```

---

## Banco de Dados

**Nome do banco:** `controllo`  
**SGBD:** MySQL 8+

### Script de criação

```sql
DROP DATABASE IF EXISTS controllo;
CREATE DATABASE controllo;
USE controllo;

CREATE TABLE usuarios (
    id_usuario   INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(100) NOT NULL,
    cpf          VARCHAR(14)  UNIQUE NOT NULL,
    tipo_usuario ENUM('Administração','Manutenção','Geral') NOT NULL,
    email        VARCHAR(100) UNIQUE,
    hash_senha   VARCHAR(255) NOT NULL
);

CREATE TABLE administracao (
    id_administracao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario       INT NOT NULL,
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE manutencao (
    id_manutencao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario    INT NOT NULL,
    CONSTRAINT fk_manutencao_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE geral (
    id_geral   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_geral_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE sala (
    id_sala   INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    bloco     INT NOT NULL
);

CREATE TABLE patrimonio (
    id_patrimonio     INT AUTO_INCREMENT PRIMARY KEY,
    nome              VARCHAR(100),
    status_requisicao ENUM('Pendente','Concluído') NOT NULL,
    id_sala           INT NOT NULL,
    CONSTRAINT fk_patrimonio_sala FOREIGN KEY (id_sala)
        REFERENCES sala(id_sala) ON DELETE CASCADE
);
```

### Modelo de dados — entidades principais

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários do sistema com perfil e credenciais |
| `administracao` | Espelho de usuários com perfil Administração |
| `manutencao` | Espelho de usuários com perfil Manutenção |
| `geral` | Espelho de usuários com perfil Geral |
| `sala` | Ambientes físicos onde patrimônios estão alocados |
| `patrimonio` | Equipamentos/bens cadastrados, vinculados a salas |
| `requisicoes_manutencao` | Solicitações de manutenção em patrimônios |
| `historicos_manutencao` | Histórico de ações em cada requisição |
| `ordem_servico` | Ordens de serviço abertas |
| `historicos_ordem` | Histórico das ordens de serviço |
| `usuarios_requisicao` | Relacionamento N:N entre usuários e requisições |
| `usuarios_ordem` | Relacionamento N:N entre usuários e ordens |
| `itens_ordem` | Relacionamento N:N entre patrimônios e ordens |

---

## API — Referência de Endpoints

**Base URL:** `http://localhost:8000`

Todas as rotas marcadas com 🔒 exigem o header:
```
Authorization: Bearer <token_jwt>
```

Todas as rotas marcadas com 👑 exigem perfil `administracao`.

---

### Autenticação

#### `POST /usuarios/login`

Autentica um usuário e retorna o token JWT.

**Body:**
```json
{
  "login": "admin@controllo.com",
  "senha": "123456"
}
```

> `login` pode ser e-mail ou CPF (com ou sem formatação).

**Resposta de sucesso `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros:**

| Status | Motivo |
|--------|--------|
| `400` | Login ou senha não informados |
| `401` | Usuário não encontrado ou senha inválida |
| `500` | Erro interno do servidor |

---

### Usuários

#### `GET /usuarios` 🔒 👑

Lista todos os usuários cadastrados.

**Resposta `200`:**
```json
{
  "result": [
    {
      "id_usuario": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "tipo_usuario": "Administração",
      "email": "joao@example.com",
      "hash_senha": "..."
    }
  ]
}
```

---

#### `POST /usuarios` 🔒 👑

Cria um novo usuário.

**Body:**
```json
{
  "nome": "Maria Souza",
  "cpf": "98765432100",
  "tipo_usuario": "Manutenção",
  "email": "maria@example.com",
  "senha": "minhasenha"
}
```

> `cpf` e `email` são opcionais individualmente, mas ao menos um deve ser informado.  
> `senha` é armazenada como hash bcrypt — nunca em texto plano.

**Resposta `200`:** resultado do `INSERT` MySQL.

---

#### `PUT /usuarios/:id` 🔒 👑

Atualiza dados de um usuário existente. Apenas os campos enviados são atualizados.

**Parâmetro de rota:** `id` — ID do usuário.

**Body (todos opcionais):**
```json
{
  "nome": "Novo Nome",
  "cpf": "12345678901",
  "tipo_usuario": "Geral",
  "email": "novo@email.com",
  "senha": "novasenha"
}
```

> Se `tipo_usuario` for alterado, o registro é removido da tabela antiga de perfil e inserido na nova automaticamente.

**Resposta `200`:** resultado do `UPDATE` MySQL.

---

#### `DELETE /usuarios/:id` 🔒 👑

Remove um usuário pelo ID.

**Parâmetro de rota:** `id` — ID do usuário.

**Resposta `200`:** resultado do `DELETE` MySQL.

---

#### `GET /usuarios/administracao` 🔒 👑

Lista todos os usuários com perfil Administração (com JOIN em `usuarios`).

---

#### `GET /usuarios/manutencao` 🔒 👑

Lista todos os usuários com perfil Manutenção.

---

#### `GET /usuarios/geral` 🔒 👑

Lista todos os usuários com perfil Geral.

---

## Autenticação e Autorização

### Fluxo de autenticação

1. O cliente envia `POST /usuarios/login` com `login` (e-mail ou CPF) e `senha`.
2. O back-end busca o usuário no banco, compara a senha com o hash bcrypt.
3. Se válido, gera um **JWT** com payload `{ id, tipo_usuario }` e expiração de **1 hora**.
4. O cliente armazena o token no `localStorage` e o envia em todas as requisições protegidas via header `Authorization: Bearer <token>`.

### Bootstrap do primeiro administrador

Se **não existir nenhum usuário** com `tipo_usuario = 'administracao'` no banco, o middleware `auth.middleware.js` intercepta qualquer requisição para `POST /usuarios` e cria o usuário diretamente, **sem exigir token**. Isso permite o setup inicial do sistema.

### Perfis de acesso

| Perfil | Valor no banco | Acesso |
|--------|---------------|--------|
| Administração | `Administração` | CRUD completo de usuários e demais recursos |
| Manutenção | `Manutenção` | Acesso a ordens de serviço e requisições (em desenvolvimento) |
| Geral | `Geral` | Abertura de requisições de manutenção (em desenvolvimento) |

> A verificação de perfil é feita pelo middleware `role.middleware.js` usando a função `normalizarTipoUsuario()`, que converte o valor para minúsculas sem acentos para comparação case-insensitive.

---

## Design System

### Paleta de Cores

| Nome | Hex | Uso |
|------|-----|-----|
| Primary | `#FFFFFF` | Fundo principal, cards |
| Secondary | `#41D1D6` | Destaque, botões primários, links ativos |
| Accent | `#006569` | Variações escuras, botões de ação |

### Tipografia

**Fonte:** Helvetica, sans-serif

| Nível | Tamanho | Peso |
|-------|---------|------|
| H1 | 32px | Bold |
| H2 | 24px | SemiBold |
| H3 | 20px | Medium |
| Body | 16px | Regular |
| Small | 14px | Regular |

### Espaçamento

Baseado em múltiplos de 8px:

| Token | Valor | Uso |
|-------|-------|-----|
| Micro | 4px | Espaçamentos mínimos |
| XS | 8px | Textos e labels |
| SM | 16px | Padrão entre elementos |
| MD | 24px | Padding interno dos cards |
| LG | 32px | Separação de seções |
| XL | 48px | Grandes áreas de respiro |

### Breakpoints (Responsivo)

| Dispositivo | Intervalo |
|-------------|-----------|
| Mobile | 320px – 767px |
| Tablet | 768px – 1023px |
| Desktop | 1024px+ |

### Componentes UI

**Botão** — Variações: `Primary`, `Secondary`, `Outline`. Estados: `Default`, `Hover`, `Disabled`.

**Card** — Container para agrupamento de informações. Padding padrão de 24px.

**Navbar** — Barra superior com logo, perfil do usuário e botão de logout.

**Sidebar** — Menu lateral com navegação entre páginas. Pode ser recolhida em desktop ou aberta como drawer em mobile.

---

## Observações de Desenvolvimento

- O front-end consome a API em `http://localhost:8000` — em produção, essa URL deve ser parametrizada.
- O arquivo `.env` não deve ser versionado em repositórios públicos; adicione-o ao `.gitignore`.
- A variável `JWT_SECRET` deve ser substituída por um valor forte e aleatório em ambiente de produção.
- Funcionalidades de **Aplicar Tarefas** e **Ver Registros** estão sinalizadas como "Em breve" na sidebar.
