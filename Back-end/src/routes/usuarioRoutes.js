import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware  from "../middlewares/auth.middleware.js";
import { autorizar } from "../middlewares/role.middleware.js";
const usuarioRoutes = Router();


usuarioRoutes.post('/', authMiddleware, autorizar(['administracao']), usuarioController.criar);
usuarioRoutes.put('/:id', authMiddleware, autorizar(['administracao']), usuarioController.editar);
usuarioRoutes.delete('/:id', authMiddleware, autorizar(['administracao']), usuarioController.deletar);
usuarioRoutes.get('/', authMiddleware, autorizar(['administracao']), usuarioController.selecionar);

//Listar os usuários de cada tipo (administracao, manutencao e geral)
usuarioRoutes.get('/administracao', authMiddleware, autorizar(['administracao']), usuarioController.selecionarAdministracao);
usuarioRoutes.get('/manutencao', authMiddleware, autorizar(['administracao']), usuarioController.selecionarManutencao);
usuarioRoutes.get('/geral', authMiddleware, autorizar(['administracao']), usuarioController.selecionarGeral);

usuarioRoutes.post('/login', usuarioController.login);

export default usuarioRoutes;