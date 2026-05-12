# 🗄️ Modelo de Dados

Este documento apresenta o modelo de dados do sistema, com foco nas entidades e seus relacionamentos.

---

## 🏢 Entidade: sala

<img src="./assets/Sala.png" width="300">

### 📌 Descrição
Representa os ambientes físicos onde os patrimônios estão localizados.

### 🧾 Atributos
- id_sala INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NOT NULL
- bloco INT NOT NULL

---

## 🖥️ Entidade: patrimonio

<img src="./assets/Patrimonio.png" width="300">

### 📌 Descrição
Representa os equipamentos ou bens cadastrados no sistema.

### 🧾 Atributos
- id_patrimonio INT AUTO_INCREMENT PRIMARY KEY
- nome VARCHAR(100) NOT NULL
- status_requisicao ENUM('Pendente', 'Concluido') NOT NULL
- id_sala INT NOT NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_sala) REFERENCES sala(id_sala)

---

## 👤 Entidade: usuario

<img src="./assets/Usuários.png" width="300">

### 📌 Descrição
Representa os usuários do sistema.

### 🧾 Atributos
- id_usuario INT AUTO_INCREMENT PRIMARY KEY
- nome VARCHAR(100) NOT NULL
- cpf VARCHAR(11) UNIQUE NOT NULL
- tipo_usuario ENUM('Administracao', 'Manutencao', 'Geral') NOT NULL
- email VARCHAR(100)
- hash_senha VARCHAR(255) NOT NULL

---

## 🛠️ Entidade: requisicoes_manutencao

<img src="./assets/requisição de manutenção.png" width="300">

### 📌 Descrição
Representa solicitações de manutenção realizadas para patrimônios.

### 🧾 Atributos
- id_requisicao INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200)
- status_requisicao ENUM('Pendente', 'Concluido') NOT NULL
- prioridade ENUM('Alta', 'Media', 'Baixa') NOT NULL
- abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- id_patrimonio INT NOT NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_patrimonio) REFERENCES patrimonio(id_patrimonio)

---

## 📜 Entidade: historicos_manutencao

<img src="./assets/Histórico de manutenção.png" width="300">

### 📌 Descrição
Armazena o histórico das manutenções realizadas em uma requisição.

### 🧾 Atributos
- id_historico INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200)
- id_requisicao INT NOT NULL
- fechamento TIMESTAMP NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_requisicao) REFERENCES requisicoes_manutencao(id_requisicao)

---

## 👨‍💼 Entidade: administracao

<img src="./assets/Manutenção e ADM.png" width="300">

### 📌 Descrição
Representa os usuários administradores do sistema.

### 🧾 Atributos
- id_administracao INT AUTO_INCREMENT PRIMARY KEY
- id_usuario INT NOT NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)

---

## 🔧 Entidade: manutencao

### 📌 Descrição
Representa os usuários responsáveis pelas manutenções do sistema.

### 🧾 Atributos
- id_manutencao INT AUTO_INCREMENT PRIMARY KEY
- id_usuario INT NOT NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)

---

## 👤 Entidade: geral

### 📌 Descrição
Representa os usuários gerais do sistema.

### 🧾 Atributos
- id_geral INT AUTO_INCREMENT PRIMARY KEY
- id_usuario INT NOT NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)

---

## 📋 Entidade: ordem_servico

<img src="./assets/Ordem de Serviço.png" width="300">

### 📌 Descrição
Representa ordens de serviço abertas para manutenção.

### 🧾 Atributos
- id_ordem INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NOT NULL
- status_ordem ENUM('Pendente', 'Concluido') NOT NULL
- abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 📚 Entidade: historicos_ordem

<img src="./assets/Histórico de ordem.png" width="300">

### 📌 Descrição
Armazena o histórico das ordens de serviço.

### 🧾 Atributos
- id_historico INT AUTO_INCREMENT PRIMARY KEY
- descricao VARCHAR(200) NOT NULL
- id_ordem INT NOT NULL
- fechamento TIMESTAMP NULL

### 🔗 Chave Estrangeira
- FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)

---

## 🔗 Entidade: usuarios_ordem

<img src="./assets/usuários de ordem.png" width="300">

### 📌 Descrição
Tabela responsável pelo relacionamento entre usuários e ordens de serviço.

### 🧾 Atributos
- id_usuarios_ordem INT AUTO_INCREMENT PRIMARY KEY
- id_ordem INT NOT NULL
- id_usuario INT NOT NULL

### 🔗 Chaves Estrangeiras
- FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)
- FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)

---

## 📦 Entidade: itens_ordem

<img src="./assets/Itens de ordem.png" width="300">

### 📌 Descrição
Relaciona patrimônios às ordens de serviço.

### 🧾 Atributos
- id_itens_ordem INT AUTO_INCREMENT PRIMARY KEY
- id_ordem INT NOT NULL
- id_patrimonio INT NOT NULL

### 🔗 Chaves Estrangeiras
- FOREIGN KEY (id_ordem) REFERENCES ordem_servico(id_ordem)
- FOREIGN KEY (id_patrimonio) REFERENCES patrimonio(id_patrimonio)

---

## 🔗 Relacionamento das tabelas

<img src="./assets/controllo.drawio.png">

### 📌 Descrição
O sistema possui relacionamentos entre salas, patrimônios, usuários, requisições e ordens de serviço.

### 🧾 Principais Relacionamentos
- Uma sala pode possuir vários patrimônios.
- Um patrimônio pode possuir várias requisições de manutenção.
- Uma requisição pode possuir vários históricos de manutenção.
- Uma ordem de serviço pode possuir vários históricos.
- Usuários podem participar de várias requisições.
- Usuários podem participar de várias ordens de serviço.
- Uma ordem de serviço pode conter vários patrimônios.