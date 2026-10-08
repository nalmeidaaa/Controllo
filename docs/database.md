# 🗄️ Modelo de Dados

Este documento descreve o esquema **real** do banco `controllo` (MySQL 8, `utf8mb4_0900_ai_ci`), já com a **migração 001** (`Back-end/migrations/001_requisicoes_e_historicos.sql`) aplicada.

> A colação `_ai_ci` ignora acentos e maiúsculas ao comparar valores de ENUM, mas o banco **devolve sempre o valor com a grafia original** (por exemplo, `Concluído`). O código usa essa grafia exata.

---

## 🏢 Tabela: salas

### 📌 Descrição
Ambientes físicos onde os patrimônios ficam.

### 🧾 Atributos
- id_sala INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NOT NULL
- bloco INT NOT NULL
- caminho_imagem VARCHAR(255) NULL
- criado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
- atualizado_em TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

---

## 🖥️ Tabela: patrimonio

### 📌 Descrição
Equipamentos e bens cadastrados. O `status` é controlado pelo fluxo de requisições:
- `Pendente`: existe requisição de manutenção **em aberto** (Pendente ou Em andamento);
- `Ok`: sem requisição em aberto.

### 🧾 Atributos
- id_patrimonio INT AUTO_INCREMENT PRIMARY KEY
- nome VARCHAR(100) NULL
- status ENUM('Pendente', 'Ok') NOT NULL
- id_sala INT NOT NULL
- caminho_imagem VARCHAR(255) NULL
- numero_patrimonio VARCHAR(12) NOT NULL

### 🔗 Chave Estrangeira
- id_sala → salas(id_sala) `ON DELETE CASCADE`

---

## 👤 Tabela: usuarios

### 📌 Descrição
Usuários do sistema. Cada perfil tem uma tabela filha (`administracao`, `manutencao`, `geral`, `desativado`) com `id_usuario`.

### 🧾 Atributos
- id_usuario INT AUTO_INCREMENT PRIMARY KEY
- nome VARCHAR(100) NOT NULL
- cpf VARCHAR(14) NOT NULL UNIQUE
- tipo_usuario ENUM('Administração', 'Manutenção', 'Geral', 'Desativado') NOT NULL
- email VARCHAR(100) NULL UNIQUE
- hash_senha VARCHAR(255) NOT NULL
- caminho_imagem VARCHAR(255) NULL

### 🧩 Tabelas filhas
| Tabela | Colunas | Observação |
|---|---|---|
| administracao | id_administracao, id_usuario | FK → usuarios `ON DELETE CASCADE` |
| manutencao | id_manutencao, id_usuario | FK → usuarios `ON DELETE CASCADE` |
| geral | id_geral, id_usuario | FK → usuarios `ON DELETE CASCADE` |
| desativado | id_desativado, id_usuario, tipo_usuario_antigo ENUM('Administração','Manutenção','Geral') | sem FK (a migração 002, do back-end de usuários, adiciona) |

> O valor `Pendente` em `usuarios.tipo_usuario` e a tabela `pendente` (cadastro aguardando aprovação) são criados pela **migração 002**.

---

## 🛠️ Tabela: requisicoes_manutencao

### 📌 Descrição
Requisição de manutenção aberta por um usuário para **um patrimônio**. Só pode existir **uma requisição em aberto por patrimônio**.

### 🧾 Atributos
- id_requisicao INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NULL (a API exige de 10 a 200 caracteres)
- status_requisicao ENUM('Pendente', 'Em andamento', 'Concluído') NOT NULL
- prioridade ENUM('Alta', 'Media', 'Baixa') NOT NULL DEFAULT 'Media'
- abertura TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
- data_conclusao TIMESTAMP NULL
- atualizacao TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- id_patrimonio INT NOT NULL
- id_usuario_solicitante INT NULL (quem abriu)
- id_usuario_responsavel INT NULL (quem assumiu ou concluiu)

### 🔗 Chaves Estrangeiras
- id_patrimonio → patrimonio(id_patrimonio) `ON DELETE CASCADE`
- id_usuario_solicitante → usuarios(id_usuario) `ON DELETE SET NULL`
- id_usuario_responsavel → usuarios(id_usuario) `ON DELETE SET NULL`

### 📇 Índices
- (id_patrimonio, status_requisicao)
- (status_requisicao, abertura)

### ⚠️ Comportamentos importantes
- Excluir um **usuário** mantém a requisição e o histórico (os campos de usuário ficam `NULL`).
- Trocar o perfil ou desativar um usuário **não apaga** requisições (a FK antiga apontava para `geral` e apagava em cascata).
- Excluir um **patrimônio** (ou uma **sala**) apaga as requisições dele **e o histórico delas** (`CASCADE`). Se for necessário preservar o histórico de itens excluídos, será preciso guardar uma cópia do nome e da sala na requisição.

---

## 📜 Tabela: historicos_manutencao

### 📌 Descrição
Registro de **eventos** de cada requisição (linha do tempo). O administrador consulta tudo por aqui.

### 🧾 Atributos
- id_historico INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NULL (descrição do problema na abertura; observação da manutenção na finalização)
- id_requisicao INT NOT NULL
- acao ENUM('Abertura', 'Andamento', 'Finalizacao') NOT NULL
- id_usuario INT NULL (quem executou a ação)
- horario TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP

### 🔗 Chaves Estrangeiras
- id_requisicao → requisicoes_manutencao(id_requisicao) `ON DELETE CASCADE`
- id_usuario → usuarios(id_usuario) `ON DELETE SET NULL`

### 📇 Índices
- id_requisicao
- horario

---

## 🔄 Ciclo de vida de uma requisição

| Passo | Quem | requisicoes_manutencao | patrimonio.status | historicos_manutencao |
|---|---|---|---|---|
| Abrir | Geral, Manutenção ou Administração | `Pendente` | `Pendente` | `Abertura` |
| Assumir | Manutenção / Administração | `Em andamento` + responsável | continua `Pendente` | `Andamento` |
| Concluir | Manutenção / Administração | `Concluído` + data_conclusao | `Ok` | `Finalizacao` |

Cada passo altera as três tabelas **numa única transação**.

---

## 📦 Tabelas de ordem de serviço (fora do escopo desta entrega)

- **ordem_servico**: id_ordem, descricao VARCHAR(200), status_ordem ENUM('Pendente','Concluído'), abertura
- **itens_ordem**: id_itens_ordem, id_ordem → ordem_servico (CASCADE), id_patrimonio → patrimonio (CASCADE)
- **usuarios_ordem**: id_usuarios_ordem, id_ordem → ordem_servico (CASCADE), id_usuario → usuarios (CASCADE)
- **historicos_ordem**: id_historico, descricao, id_ordem → ordem_servico (CASCADE), fechamento
