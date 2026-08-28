import { Router } from 'express';
import salaController from '../controllers/salaController.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { autorizar } from '../middlewares/role.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const salaRoutes = Router();

// Criar sala com múltiplos uploads (imagem da sala + fotos individuais dos patrimônios)
salaRoutes.post('/', authMiddleware, autorizar(['administracao']), upload.single('imagem'), salaController.criar);

// Listar todas as salas (Lógica normal legada - Mantida)
salaRoutes.get('/', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), salaController.selecionar);

// Listar salas com seus respectivos arrays de patrimônios populados
salaRoutes.get(
    '/com-patrimonios', 
    authMiddleware, 
    autorizar(['administracao', 'manutencao', 'geral']), 
    salaController.listarSalaEPatrimonios
);

// Listar salas com seus respectivos arrays de patrimônios populados com ID
salaRoutes.get(
    '/com-patrimonios/:id', 
    authMiddleware, 
    autorizar(['administracao', 'manutencao', 'geral']), 
    salaController.listarSalaEPatrimonios
);

// Buscar sala por ID (Normal)
salaRoutes.get('/:id', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), salaController.selecionarPorId);

// Listar salas por bloco
salaRoutes.get('/bloco/:bloco', authMiddleware, autorizar(['administracao', 'manutencao', 'geral']), salaController.selecionarPorBloco);

// Editar sala e sincronizar patrimônios (aceitando novas fotos para qualquer um deles)
salaRoutes.put('/:id', authMiddleware, autorizar(['administracao']), upload.single('imagem'), salaController.editar);

// Deletar sala e patrimônios atrelados (Limpa arquivos do HD e tabelas)
salaRoutes.delete('/:id', authMiddleware, autorizar(['administracao']), salaController.deletar);

export default salaRoutes;