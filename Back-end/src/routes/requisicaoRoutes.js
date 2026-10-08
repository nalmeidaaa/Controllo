import { Router } from "express";
import requisicaoController from "../controllers/requisicaoController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { autorizar } from "../middlewares/role.middleware.js";

const requisicaoRoutes = Router();

const todosOsPerfis = ['administracao', 'manutencao', 'geral'];
const equipeTecnica = ['administracao', 'manutencao'];

// ATENÇÃO: rotas fixas ANTES de '/:id'

// Abrir requisição de manutenção
requisicaoRoutes.post('/', authMiddleware, autorizar(todosOsPerfis), requisicaoController.criar);

// Requisições abertas pelo próprio usuário (já ordenadas)
requisicaoRoutes.get('/minhas', authMiddleware, autorizar(todosOsPerfis), requisicaoController.minhas);

// Mural: últimas atualizações das próprias requisições
requisicaoRoutes.get('/atualizacoes', authMiddleware, autorizar(todosOsPerfis), requisicaoController.atualizacoes);

// Requisição em aberto de um patrimônio
requisicaoRoutes.get('/patrimonio/:id_patrimonio/aberta', authMiddleware, autorizar(todosOsPerfis), requisicaoController.abertaPorPatrimonio);

// Todas as requisições (manutenção e administração), com filtros e paginação
requisicaoRoutes.get('/', authMiddleware, autorizar(equipeTecnica), requisicaoController.listar);

// Detalhe com linha do tempo
requisicaoRoutes.get('/:id', authMiddleware, autorizar(todosOsPerfis), requisicaoController.selecionarPorId);

// Manutenção assume a requisição
requisicaoRoutes.put('/:id/assumir', authMiddleware, autorizar(equipeTecnica), requisicaoController.assumir);

// Manutenção conclui a requisição
requisicaoRoutes.put('/:id/concluir', authMiddleware, autorizar(equipeTecnica), requisicaoController.concluir);

export default requisicaoRoutes;
