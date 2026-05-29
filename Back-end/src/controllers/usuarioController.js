import bcrypt from "bcrypt"; // Importa bcrypt para hash de senhas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken para criação e verificação de tokens JWT
import { Usuario } from "../models/Usuario.js";
import usuarioRepository from "../repositories/usuarioRepository.js";
import usuarioRoutes from "../routes/usuarioRoutes.js";

const usuarioController = {
    criar: async (req, res) => {
        try {
            const { nome, cpf, tipo_usuario, email, senha } = req.body;
            const hash_senha = await bcrypt.hash(senha, 10);
            const usuario = Usuario.criar({ nome, cpf, tipo_usuario, email, hash_senha });
            const result = await usuarioRepository.criar(usuario);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    selecionar: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionar();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    editar: async (req, res) => {

        try {

            const id = req.params.id;

            const {
                nome,
                cpf,
                tipo_usuario,
                email,
                senha
            } = req.body;

            let hash_senha = null;

            // GERA HASH SOMENTE SE INFORMAR SENHA
            if (senha) {
                hash_senha =
                    await bcrypt.hash(senha, 10);

            }

            const usuario = Usuario.editar({
                nome,
                cpf,
                tipo_usuario,
                email,
                hash_senha
            }, id);

            const result =
                await usuarioRepository.editar(
                    id,
                    usuario
                );

            res.status(200).json({ result });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                MessageChannel: 'Ocorreu um erro no servidor',
                errorMessage: error.message
            });

        }

    },
    deletar: async (req, res) => {
        try {
            const id = req.params.id;
            const result = await usuarioRepository.deletar(id);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    // Selecionar uma tabela de usuário específico (cliente, geral ou administrador) com base no tipo_usuario
    selecionarAdministracao: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionarAdministracao();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    selecionarManutencao: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionarManutencao();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    selecionarGeral: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionarGeral();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    login: async (req, res) => {
        try {
            const { login, senha } = req.body;

            if (!login || !senha) {
                return res.status(400).json({
                    erro: "Login e senha são obrigatórios"
                });
            }

            let usuario;

            // verifica se é email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(login)) {
                usuario = await usuarioRepository.buscarPorEmail(login);
            } else {
                const cpfLimpo = login.replace(/\D/g, "");
                usuario = await usuarioRepository.buscarPorCpf(cpfLimpo);
            }

            if (!usuario) {
                return res.status(401).json({
                    erro: "Usuário não encontrado"
                });
            }

            // valida senha
            const senhaValida = await bcrypt.compare(
                senha,
                usuario.hash_senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    erro: "Senha inválida"
                });
            }

            // gera token JWT
            const token = jwt.sign(
                {
                    id: usuario.id_usuario,
                    tipo_usuario: usuario.tipo_usuario
                },
                process.env.JWT_SECRET, // <--- AGORA ESTÁ IGUAL AO MIDDLEWARE
                { expiresIn: "1h" }
            );

            return res.json({
                token
            });

        } catch (error) {
            console.error(error);

            return res.status(500).json({
                erro: "Erro no servidor"
            });
        }
    }

}

export default usuarioController;