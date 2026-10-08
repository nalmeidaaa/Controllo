# 📑 Contrato da API — Requisições de manutenção

Base: `http://<servidor>:<porta>` · Autenticação: `Authorization: Bearer <token>` em todas as rotas.
Sucesso: `{ result, ... }` ou `{ message, result }`. Erro: `{ message, ...extras }` (exceto 401 e 403 de perfil, que vêm como `{ erro }`).

## Valores exatos
- `status_requisicao`: `Pendente`, `Em andamento`, `Concluído`
- `prioridade`: `Alta`, `Media`, `Baixa` (a API aceita também `média`, `ALTA` etc. e devolve o valor exato)
- `acao` (histórico): `Abertura`, `Andamento`, `Finalizacao`
- `patrimonio.status`: `Pendente`, `Ok`

## Objeto requisição
```
{
  id_requisicao, descricao, status_requisicao, prioridade,
  abertura, data_conclusao, atualizacao,
  patrimonio: { id_patrimonio, nome, numero_patrimonio, caminho_imagem, status },
  sala: { id_sala, descricao, bloco },
  solicitante: { id_usuario, nome } | null,
  responsavel: { id_usuario, nome } | null
}
```
Nas rotas de detalhe vem também `historico: [ { id_historico, acao, descricao, horario, usuario: { id_usuario, nome } | null } ]` em ordem cronológica.

## Ordenação das listas (feita no servidor)
1. Em aberto (`Pendente` e `Em andamento`) primeiro, da **abertura mais recente** para a mais antiga.
2. `Concluído` no final, da **conclusão mais recente** para a mais antiga.

## Rotas

| Método e rota | Perfis | Entrada | Saída / erros |
|---|---|---|---|
| `POST /requisicoes` | geral, manutencao, administracao | JSON: `id_patrimonio`, `descricao` (10–200), `prioridade?` (padrão `Media`) | **201** `{ message, result: requisição com historico }` · 400 validação · 404 patrimônio · **409** `{ message, id_requisicao }` já existe requisição em aberto · 403 sem administrador no sistema |
| `GET /requisicoes/minhas` | todos | — | 200 `{ result: [requisição] }` ordenado |
| `GET /requisicoes/atualizacoes` | todos | — | 200 `{ result: [ { id_historico, acao, descricao, horario, requisicao } ] }` — até 3 eventos dos últimos 7 dias das **próprias** requisições, do mais novo para o mais antigo |
| `GET /requisicoes/patrimonio/:id_patrimonio/aberta` | todos | — | 200 `{ result: { ...requisição, propria: boolean } }` · 404 se não houver aberta |
| `GET /requisicoes` | manutencao, administracao | query: `pagina` (1), `limite` (10, máx. 50), `status`, `prioridade`, `id_sala` | 200 `{ result: [requisição], total, pagina, limite }` ordenado · 400 filtro inválido |
| `GET /requisicoes/:id` | todos (geral só a própria) | — | 200 `{ result: requisição com historico }` · 404 (inclusive requisição de outro usuário, para o perfil geral) |
| `PUT /requisicoes/:id/assumir` | manutencao, administracao | — | 200 `{ message, result }` · 404 · **409** já em andamento ou concluída |
| `PUT /requisicoes/:id/concluir` | manutencao, administracao | JSON: `descricao` (observação, 5–200) | 200 `{ message, result }` · 400 · 404 · **409** já concluída |

### Observações
- O solicitante vem **sempre do token**, nunca do corpo.
- Concluir é permitido a partir de `Pendente` ou `Em andamento`.
- `propria` em `/aberta`: indica se a requisição em aberto foi aberta por quem consulta. Para o perfil **geral**, `GET /requisicoes/:id` só funciona quando `propria = true`; se for `false`, o app deve apenas avisar que o patrimônio já tem requisição em aberto (usando `descricao`, `status_requisicao` e `abertura` já devolvidos por `/aberta`).
- O status do patrimônio **só muda pelo fluxo**: `PUT /patrimonios/:id` e a edição de sala preservam `Pendente` enquanto houver requisição em aberto.
- Erros de autenticação: **401** `{ erro }` (sem token, inválido ou expirado) · **403** `{ erro: "Acesso negado" }` (perfil sem permissão).
