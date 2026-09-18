import { Router } from "express";

import requisicaoController from "../controllers/requisicaoController.js";

import authMiddleware from "../middlewares/auth.middleware.js";

import { autorizar } from "../middlewares/role.middleware.js";

const requisicaoRoutes = Router();

requisicaoRoutes.get(
    "/historico",
    authMiddleware,
    autorizar(["administracao", "manutencao", "geral"]),
    requisicaoController.listarHistorico
);

export default requisicaoRoutes;