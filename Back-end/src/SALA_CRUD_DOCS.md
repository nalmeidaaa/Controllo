# 📋 Documentação - CRUD de Salas com Upload de Imagem

## Visão Geral

O módulo de Salas foi completamente implementado com suporte a **upload de imagens**. Permite criar, listar, editar e deletar salas com suas respectivas fotos.

---

## Estrutura de Arquivos

```
src/
├── models/
│   └── Sala.js                    # Modelo com validação
├── repositories/
│   └── salaRepository.js          # Operações no banco de dados
├── controllers/
│   └── salaController.js          # Lógica de negócio
├── routes/
│   ├── salaRoutes.js              # Rotas de sala
│   └── routes.js                  # Agregador de rotas (ATUALIZADO)
├── middlewares/
│   └── upload.middleware.js       # Configuração do Multer
├── configs/
│   └── upload.multer.js           # Estratégia de upload
└── server.js                       # Servidor (ATUALIZADO)
```

---

## Modelo - `Sala.js`

Campos privados validados:
- **id**: Identificador único (não pode ser alterado após criação)
- **descricao**: String, mínimo 2 caracteres
- **bloco**: Número inteiro positivo
- **caminhoImagem**: Caminho relativo da imagem (ex: `/imagens/abc123-photo.jpg`)

Factory methods:
```javascript
Sala.criar(descricao, bloco, caminhoImagem)
Sala.editar(id, descricao, bloco, caminhoImagem)
```

---

## Repository - `salaRepository.js`

| Método | Descrição |
|--------|-----------|
| `criar(sala)` | Insere uma nova sala no BD |
| `selecionar()` | Lista todas as salas ordenadas por bloco e descrição |
| `selecionarPorId(id)` | Busca uma sala pelo ID |
| `selecionarPorBloco(bloco)` | Lista salas de um bloco específico |
| `editar(id, sala)` | Atualiza dados (dinâmico) |
| `deletar(id)` | Remove uma sala |

---

## Controller - `salaController.js`

### `criar(req, res)`
- **Acesso**: Admin apenas
- **Validação**: descricao e bloco obrigatórios
- **Upload**: Campo `imagem` (opcional)
- **Status**: 201 Created
- **Response**: ID da sala criada + dados

### `selecionar(req, res)`
- **Acesso**: Admin, Manutenção, Geral
- **Status**: 200 OK
- **Response**: Array de salas

### `selecionarPorId(req, res)`
- **Acesso**: Admin, Manutenção, Geral
- **Parâmetro**: `:id` (URL)
- **Status**: 200 OK ou 404 Not Found

### `selecionarPorBloco(req, res)`
- **Acesso**: Admin, Manutenção, Geral
- **Parâmetro**: `:bloco` (URL)
- **Status**: 200 OK
- **Response**: Array de salas do bloco

### `editar(req, res)`
- **Acesso**: Admin apenas
- **Parâmetro**: `:id` (URL)
- **Campos opcionais**: descricao, bloco
- **Upload**: Campo `imagem` (opcional)
- **Funcionalidades especiais**:
  - Se nova imagem é enviada, a antiga é deletada automaticamente
  - Campos não enviados não são alterados
  - Mantém imagem antiga se nenhuma nova é enviada

### `deletar(req, res)`
- **Acesso**: Admin apenas
- **Parâmetro**: `:id` (URL)
- **Status**: 200 OK
- **Funcionalidade especial**: Deleta também a imagem do servidor

---

## Endpoints da API

### Base URL
```
http://localhost:8000/salas
```

### 1️⃣ Criar Sala com Imagem
```http
POST /salas
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- descricao (text): "Laboratório de Informática"
- bloco (number): 1
- imagem (file): sala.jpg [OPCIONAL]
```

**Response (201):**
```json
{
  "mensagem": "Sala criada com sucesso",
  "result": {
    "id_sala": 5,
    "descricao": "Laboratório de Informática",
    "bloco": 1,
    "caminho_imagem": "/imagens/abc123xyz-sala.jpg"
  }
}
```

---

### 2️⃣ Listar Todas as Salas
```http
GET /salas
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "result": [
    {
      "id_sala": 1,
      "descricao": "Sala 101",
      "bloco": 1,
      "caminho_imagem": "/imagens/hash1-foto.jpg"
    },
    {
      "id_sala": 2,
      "descricao": "Sala 201",
      "bloco": 2,
      "caminho_imagem": null
    }
  ]
}
```

---

### 3️⃣ Buscar Sala por ID
```http
GET /salas/1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "result": {
    "id_sala": 1,
    "descricao": "Sala 101",
    "bloco": 1,
    "caminho_imagem": "/imagens/hash1-foto.jpg"
  }
}
```

**Response (404):**
```json
{
  "erro": "Sala não encontrada."
}
```

---

### 4️⃣ Listar Salas por Bloco
```http
GET /salas/bloco/1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "result": [
    {
      "id_sala": 1,
      "descricao": "Sala 101",
      "bloco": 1,
      "caminho_imagem": "/imagens/hash1-foto.jpg"
    }
  ]
}
```

---

### 5️⃣ Editar Sala (com ou sem nova imagem)
```http
PUT /salas/1
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- descricao (text): "Sala 101 - Atualizado" [OPCIONAL]
- bloco (number): 2 [OPCIONAL]
- imagem (file): nova-foto.jpg [OPCIONAL]
```

**Comportamentos:**
- Se `descricao` não é enviada, mantém a antiga
- Se `bloco` não é enviada, mantém o antigo
- Se nova `imagem` é enviada, deleta a antiga e usa a nova
- Se `imagem` não é enviada, mantém a imagem anterior

**Response (200):**
```json
{
  "mensagem": "Sala atualizada com sucesso",
  "result": {
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 0,
    "info": "",
    "serverStatus": 2,
    "warningStatus": 0
  }
}
```

---

### 6️⃣ Deletar Sala
```http
DELETE /salas/1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "mensagem": "Sala deletada com sucesso",
  "result": {
    "fieldCount": 0,
    "affectedRows": 1,
    "insertId": 0,
    "info": "",
    "serverStatus": 34,
    "warningStatus": 0
  }
}
```

**Funcionalidade**: Deleta também a imagem do servidor automaticamente.

---

## Gerenciamento de Imagens

### Configuração de Upload
- **Pasta**: `uploads/imagens/`
- **Tipos permitidos**: `.png`, `.jpeg`, `.jpg`
- **Tamanho máximo**: 10 MB
- **Nomeação**: `{hash-aleatório}-{nome-original}`

### Fluxo de Imagens

#### Criação
```
Upload → Salvo em /uploads/imagens/ → Caminho registrado no BD
```

#### Edição com Nova Imagem
```
Upload → Imagem Antiga deletada → Nova imagem salva → BD atualizado
```

#### Edição sem Imagem
```
Imagem anterior mantida → BD não alterado
```

#### Deleção de Sala
```
Sala deletada do BD → Arquivo de imagem deletado do servidor
```

### Acessar Imagem via HTTP
```
GET http://localhost:8000/imagens/abc123xyz-sala.jpg
```

---

## Autenticação e Autorização

### Requisitos de Acesso

| Operação | Admin | Manutenção | Geral |
|----------|-------|------------|-------|
| Criar    | ✅    | ❌         | ❌    |
| Ler      | ✅    | ✅         | ✅    |
| Editar   | ✅    | ❌         | ❌    |
| Deletar  | ✅    | ❌         | ❌    |

**Todos os endpoints exigem token JWT válido** no header:
```
Authorization: Bearer {token}
```

---

## Tratamento de Erros

### 400 Bad Request
```json
{
  "erro": "Descrição e bloco são obrigatórios."
}
```

### 401 Unauthorized
Token ausente ou inválido.

### 403 Forbidden
Usuário não tem permissão (não é Admin).

### 404 Not Found
```json
{
  "erro": "Sala não encontrada."
}
```

### 500 Internal Server Error
```json
{
  "mensagem": "Ocorreu um erro no servidor",
  "errorMessage": "Detalhes do erro..."
}
```

---

## Schema do Banco de Dados

```sql
CREATE TABLE salas (
    id_sala INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    bloco INT NOT NULL,
    caminho_imagem VARCHAR(255) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Exemplo de Fluxo Completo

### 1. Login e obter token
```bash
curl -X POST http://localhost:8000/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"login": "admin@example.com", "senha": "senha123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Criar sala com imagem
```bash
curl -X POST http://localhost:8000/salas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "descricao=Sala 101" \
  -F "bloco=1" \
  -F "imagem=@/caminho/para/foto.jpg"
```

### 3. Listar salas
```bash
curl -X GET http://localhost:8000/salas \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 4. Editar sala e adicionar/alterar imagem
```bash
curl -X PUT http://localhost:8000/salas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "descricao=Sala 101 Atualizada" \
  -F "imagem=@/caminho/para/nova-foto.jpg"
```

### 5. Deletar sala
```bash
curl -X DELETE http://localhost:8000/salas/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Dicas de Implementação

### Frontend (FormData para Upload)
```javascript
const formData = new FormData();
formData.append('descricao', 'Sala 101');
formData.append('bloco', 1);
formData.append('imagem', fileInput.files[0]);

const response = await fetch('http://localhost:8000/salas', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Exibir Imagem no HTML
```html
<img src="http://localhost:8000/imagens/abc123xyz-sala.jpg" alt="Sala">
```

---

## Status da Implementação

✅ **Criar** - Completo com upload  
✅ **Ler (todos)** - Completo  
✅ **Ler (por ID)** - Completo  
✅ **Ler (por Bloco)** - Completo  
✅ **Editar** - Completo com gerenciamento de imagem  
✅ **Deletar** - Completo com deleção de imagem  

---
