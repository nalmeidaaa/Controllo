import { Router } from "express";
import historicoController from "../controllers/historicoController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { autorizar } from "../middlewares/role.middleware.js";

const historicoRoutes = Router();

// Histórico de manutenção: somente administração

// Todos os eventos, com filtros e paginação
historicoRoutes.get('/', authMiddleware, autorizar(['administracao']), historicoController.listar);

// Linha do tempo de uma requisição
historicoRoutes.get('/requisicao/:id_requisicao', authMiddleware, autorizar(['administracao']), historicoController.listarPorRequisicao);

export default historicoRoutes;
