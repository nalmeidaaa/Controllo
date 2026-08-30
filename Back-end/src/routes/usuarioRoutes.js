import { Router } from "express";
import usuarioController from "../controllers/usuarioController.js";
import authMiddleware  from "../middlewares/auth.middleware.js";
import { autorizar } from "../middlewares/role.middleware.js";
import upload from '../middlewares/upload.middleware.js'; // Importação do middleware de upload

const usuarioRoutes = Router();

// Rota para verificar se tem algum admin cadastrado, isto é, se é o primeiro setup do sistema
usuarioRoutes.get(
    '/setup',
    usuarioController.verificarSetup
);

// Criar usuário com upload de foto de perfil
usuarioRoutes.post(
    '/', 
    authMiddleware, 
    autorizar(['administracao']), 
    upload.single('imagem'), // Intercepta o arquivo multipart antes do controller
    usuarioController.criar
);

// Editar usuário com upload de foto opcional
usuarioRoutes.put(
    '/:id', 
    authMiddleware, 
    autorizar(['administracao']), 
    upload.single('imagem'), // Intercepta o arquivo multipart antes do controller
    usuarioController.editar
);

// Deletar usuário
usuarioRoutes.delete('/:id', authMiddleware, autorizar(['administracao']), usuarioController.deletar);

// Listar todos os usuários
usuarioRoutes.get('/', authMiddleware, autorizar(['administracao']), usuarioController.selecionar);

// Listar os usuários de cada tipo (administracao, manutencao e geral)
usuarioRoutes.get('/administracao', authMiddleware, autorizar(['administracao']), usuarioController.selecionarAdministracao);
usuarioRoutes.get('/manutencao', authMiddleware, autorizar(['administracao']), usuarioController.selecionarManutencao);
usuarioRoutes.get('/geral', authMiddleware, autorizar(['administracao']), usuarioController.selecionarGeral);

// Autenticação
usuarioRoutes.post('/login', usuarioController.login);

export default usuarioRoutes;