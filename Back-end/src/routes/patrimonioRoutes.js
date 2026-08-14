import { Router } from "express";
import patrimonioController from "../controllers/patrimonioController.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { autorizar } from "../middlewares/role.middleware.js";
import upload from '../middlewares/upload.middleware.js'; // Importação do middleware de upload

const patrimonioRoutes = Router();

// Criar patrimônio com upload de imagem
patrimonioRoutes.post(
    '/',
    authMiddleware,
    autorizar(['administracao']),
    upload.single('imagem'), // Intercepta o arquivo "imagem" antes de mandar pro controller
    patrimonioController.criar
);

// Editar patrimônio com upload de imagem opcional
patrimonioRoutes.put(
    '/:id',
    authMiddleware,
    autorizar(['administracao']),
    upload.single('imagem'), // Intercepta o arquivo "imagem" antes de mandar pro controller
    patrimonioController.editar
);

// Listar todos os patrimônios
patrimonioRoutes.get(
    '/',
    authMiddleware,
    autorizar(['administracao', 'manutencao', 'geral']),
    patrimonioController.selecionar);

// Buscar patrimônio por ID
patrimonioRoutes.get('/:id', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), patrimonioController.selecionarPorId);

// Listar patrimônios por sala
patrimonioRoutes.get('/sala/:id_sala', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), patrimonioController.selecionarPorSala);

// Listar patrimônios por bloco
patrimonioRoutes.get('/bloco/:bloco', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), patrimonioController.selecionarPorBloco);

// Deletar patrimônio
patrimonioRoutes.delete('/:id', authMiddleware, autorizar(['administracao']), patrimonioController.deletar);

export default patrimonioRoutes;