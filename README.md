# Apresentação — Bluetooth e BLE

## Sobre a Apresentação

- **Bluetooth Clássico:** Tecnologia WPAN operando em 2,4 GHz focada em transferência contínua de dados em alta velocidade e streaming (voz, áudio estéreo, sincronização de arquivos).

- **BLE (Bluetooth Low Energy):** Tecnologia lançada a partir do Bluetooth 4.0 (2010), focada em baixíssimo consumo de energia, envio de pequenas quantidades de dados em rajadas curtas e autonomia de bateria por meses/anos.

- **Topologias & Arquitetura:** Conceitos de Piconet (Master + Slaves), Scatternet (interconexão de Piconets) e arquitetura GATT (Perfis, Serviços e Características).

- **IIoT (Internet Industrial das Coisas):** Comparativo do uso prático industrial de cada padrão.

---

## Questões Abordadas

### Questão 01 - Como Funciona o Bluetooth?

**Gabarito Correto:** Bluetooth funciona por ondas de rádio de curto alcance, permitindo a troca de dados sem cabos ou internet.

**Justificativa:** O Bluetooth é um protocolo de rede de área pessoal sem fio (WPAN) que transmite pacotes de dados por rádio na frequência ISM de 2,4 GHz a curtas distâncias, dispensando cabos físicos ou sinal de internet.

---

### Questão 02 - O que é o Bluetooth Low Energy (BLE)?

**Gabarito Correto:** BLE é uma versão do Bluetooth que consome menos energia, ideal para dispositivos que precisam funcionar por mais tempo.

**Justificativa:** O BLE foi projetado para economizar ao máximo a energia da bateria, permanecendo a maior parte do tempo em modo de espera (*sleep mode*) e ativando o rádio apenas para enviar rajadas curtas de informações.

---

### Questão 03 - Qual é um exemplo de aplicação BLE no IIoT?

**Gabarito Correto:** Detecção de quedas, imobilidade ou invasão de zonas de risco.

**Justificativa:** A segurança dos trabalhadores na Indústria 4.0 é monitorada via *wearables* (crachás/pulseiras com BLE) operados a bateria, que enviam pequenos alertas contínuos sobre postura, imobilidade ou entrada em áreas perigosas.

---

### Questão 04 - Qual é um exemplo de aplicação Bluetooth no IIoT?

**Gabarito Correto:** Comunicação hands-free e limpa entre operadores e salas de controle.

**Justificativa:** Áudio bidirecional contínuo exige transmissão ininterrupta de dados (*stream*), o que é suportado pelo Bluetooth Clássico via perfis como HFP (Hands-Free Profile) e A2DP com tecnologia de cancelamento ativo de ruído (ANC).

---

### Questão 05 - Qual é um exemplo prático de BLE?

**Gabarito Correto:** Tags de localização (AirTag).

**Justificativa:** Dispositivos de rastreamento do tipo AirTag enviam pequenos anúncios de rádio (*advertising packets*) em intervalos regulares e precisam durar mais de um ano com uma única bateria botão, sendo o exemplo perfeito do ecossistema BLE. Caixas de som e fones exigem áudio contínuo do Bluetooth Clássico.

---

### Questão 06 - Qual é o principal foco do Bluetooth?

**Gabarito Correto:** Transferência contínua de dados em alta velocidade.

**Justificativa:** O padrão Bluetooth tradicional (Clássico) foi concebido para fluxos constantes e intensos de informação (como transmissões de áudio e arquivos), priorizando maior taxa de transferência em detrimento da economia de energia.

---

### Questão 07 - Qual é uma diferença de BLE em relação ao Bluetooth clássico?

**Gabarito Correto:** Baixíssimo consumo de energia.

**Justificativa:** A principal inovação do BLE sobre a versão clássica é a sua arquitetura otimizada para operação com bateria ultralimitada, mantendo o consumo de energia em níveis baixíssimos.

---

### Questão 08 - O que acontece quando duas piconets se conectam?

**Gabarito Correto:** Quando duas ou mais piconets se interligam, formam uma rede chamada scatternet.

**Justificativa:** A junção de duas ou mais redes Piconet através de nós/dispositivos compartilhados (que atuam como master em uma e slave em outra) forma uma estrutura topológica chamada Scatternet.

---

### Questão 09 - Qual a diferença entre Bluetooth e Bluetooth Low Energy (BLE)?

**Gabarito Correto:** Bluetooth consome mais energia, enquanto o BLE consome menos energia e economiza bateria.

**Justificativa:** A grande distinção funcional do Bluetooth original para o BLE reside no perfil de potência: o Bluetooth Clássico opera com conexão constante e maior consumo, enquanto o BLE é um padrão leve para transmissão esporádica e grande economia de bateria.

---

### Questão 10 - Qual arquitetura organiza a comunicação entre dispositivos?

**Gabarito Correto:** GATT.

**Justificativa:** O GATT (Generic Attribute Profile) especifica como os dados são organizados e trocados entre dispositivos em uma conexão BLE, dividindo as informações em Perfis, Serviços, Características e Descritores.

---

### Questão 11 - O que é PICONET?

**Gabarito Correto:** Rede com um dispositivo principal com número limitado de dispositivos.

**Justificativa:** A Piconet é uma rede sem fio formada por exatamente um dispositivo mestre (Master) e até 7 dispositivos secundários/escravos (Slaves) ativos simultaneamente.

---

### Questão 12 - Qual a diferença entre a aplicação Bluetooth na IIoT e a aplicação BLE na IIoT?

**Gabarito Correto:** O Bluetooth é usado em comunicação e transferência de dados, enquanto o BLE é ideal para sensores, beacons e dispositivos que economizam energia.

**Justificativa:** No setor industrial (IIoT):

- **Bluetooth Clássico:** Usado onde há alta exigência de fluxo contínuo de dados ou voz (headsets, comunicação serial, upload de firmware e logs).
- **BLE:** Ideal para rastreamento de ativos (beacons), sensores autônomos a bateria (temperatura e vibração).

---

### Questão 13 - Qual é a função do Perfil SPP no chão de fábrica?

**Gabarito Correto:** Substituir cabos seriais para conexões sem fio em atualizações de firmware e downloads de logs.

**Justificativa:** O perfil SPP (Serial Port Profile) permite emular uma conexão serial, como RS-232/RS-485, por meio do Bluetooth. No ambiente industrial, pode ser utilizado para conectar computadores de manutenção a CLPs, inversores de frequência e outros equipamentos, facilitando a atualização de firmware e a coleta de logs sem a necessidade de cabos físicos.

---

### Questão 14 - Na manutenção preditiva com BLE, como são transmitidos os dados de medição de vibração e temperatura dos sensores a bateria?

**Gabarito Correto:** Em rajadas curtas de dados.

**Justificativa:** Sensores industriais de temperatura e vibração podem utilizar BLE para realizar medições e transmitir pequenas quantidades de dados em intervalos espaçados. Como o rádio permanece a maior parte do tempo em baixo consumo, essa característica permite que os sensores funcionem durante longos períodos utilizando baterias.

---

### Questão 15 - Em qual desses casos o uso da Scatternet é mais adequado?

**Gabarito Correto:** Em uma linha de produção onde há 12 máquinas que devem ser conectadas via Bluetooth.

**Justificativa:** Uma Piconet possui um limite de dispositivos ativos conectados a um dispositivo principal. Quando é necessário conectar uma quantidade maior de dispositivos, como 12 máquinas em uma linha de produção, pode-se utilizar uma Scatternet, formada pela interligação de duas ou mais Piconets.