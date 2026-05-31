import jwt from 'jsonwebtoken';

import usuarioRepository from "../repositories/usuarioRepository.js";
import bcrypt from 'bcrypt';
import { Usuario } from "../models/Usuario.js";

async function authMiddleware(req, res, next) {

    // se não tiver nenhum usuário do tipo 'administracao' no banco, permite o acesso para criar o primeiro administrador
    const admsExistentes = await usuarioRepository.selecionarAdministracao();
    console.log("Administradores existentes:", admsExistentes);
    if (admsExistentes.length === 0) {
        try {
            const { nome, cpf, tipo_usuario, senha, email } = req.body;
            const hash_senha = await bcrypt.hash(senha, 10);

            const usuario = Usuario.criar({ nome, cpf, tipo_usuario, email, hash_senha });
            const novoAdm = await usuarioRepository.criar(usuario);
            console.log("Primeiro administrador criado:", novoAdm);
            return res.status(201).json({ message: 'Primeiro administrador criado', usuario: novoAdm });
        } catch (error) {
            console.error("Erro ao criar o primeiro administrador:", error);
            return res.status(500).json({ message: 'Erro ao criar o primeiro administrador' });
        }
    }
    // caso contrário, o código continua normalmente, exigindo autenticação para as rotas protegidas

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Token não informado' });
    const token = authHeader.split(' ')[1];

    try {        
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next(); 
    } catch (error) {
        console.error("Erro na verificação:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
}

export default authMiddleware;