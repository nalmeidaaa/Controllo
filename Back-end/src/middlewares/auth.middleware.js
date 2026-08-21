import jwt from 'jsonwebtoken';
import usuarioRepository from "../repositories/usuarioRepository.js";

async function authMiddleware(req, res, next) {
    try {
        // Busca administradores no banco
        const admsExistentes = await usuarioRepository.selecionarAdministracao();
        

        // SE NÃO HOUVER NENHUM ADMIN (array vazio ou nulo)
        if (!admsExistentes || admsExistentes.length === 0) {
            req.usuario = { id: 0, tipo_usuario: 'administracao' };
            return next();
        }

        // SE JÁ EXISTIR ADMIN, exige Token JWT
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ erro: "Token não informado" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ erro: "Token não informado" });
        }

        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        return next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ erro: "Token inválido ou expirado" });
        }

        return res.status(500).json({ 
            erro: "Erro no servidor ao verificar autenticação", 
            detalhe: error.message 
        });
    }
}

export default authMiddleware;