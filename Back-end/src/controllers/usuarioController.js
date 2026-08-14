import bcrypt from "bcrypt"; // Importa bcrypt para hash de senhas
import jwt from "jsonwebtoken"; // Importa jsonwebtoken para criação e verificação de tokens JWT
import { Usuario } from "../models/Usuario.js";
import usuarioRepository from "../repositories/usuarioRepository.js";
import fs from "fs"; // Importação correta em ES Modules para manipulação de arquivos
import path from "path"; // Importação correta em ES Modules para caminhos de arquivos

const usuarioController = {
   criar: async (req, res) => {
        try {
            let { nome, cpf, tipo_usuario, email, senha } = req.body;

            // Regra de segurança: Se não existir nenhum administrador, força o tipo para 'administracao'
            const admsExistentes = await usuarioRepository.selecionarAdministracao();
            if (admsExistentes.length === 0) {
                tipo_usuario = 'administracao';
            }

            const hash_senha = await bcrypt.hash(senha, 10);

            // Monta o caminho da imagem se foi feito upload
            let caminhoImagem = null;
            if (req.file) {
                caminhoImagem = `/imagens/${req.file.filename}`;
            }

            const usuario = Usuario.criar({ 
                nome, 
                cpf, 
                tipo_usuario, 
                email, 
                hash_senha, 
                caminho_imagem: caminhoImagem 
            });

            const result = await usuarioRepository.criar(usuario);
            
            return res.status(201).json({ 
                message: admsExistentes.length === 0 ? 'Primeiro administrador criado com sucesso' : 'Usuário criado com sucesso',
                result 
            });

        } catch (error) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Erro ao deletar arquivo:', err);
                });
            }
            console.error(error);
            return res.status(500).json({ MessageChannel: 'Ocorreu um erro no servidor', errorMessage: error.message });
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
            const { nome, cpf, tipo_usuario, email, senha } = req.body;

            // Verifica se o usuário existe para poder capturar a imagem antiga
            const usuarioExistente = await usuarioRepository.selecionarPorId(id);
            if (!usuarioExistente) {
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Erro ao deletar arquivo:', err);
                    });
                }
                return res.status(404).json({ erro: 'Usuário não encontrado.' });
            }

            let hash_senha = null;

            // GERA HASH SOMENTE SE INFORMAR SENHA
            if (senha) {
                hash_senha = await bcrypt.hash(senha, 10);
            }

            // Monta o caminho da imagem se foi feito upload
            let caminhoImagem = null;
            if (req.file) {
                caminhoImagem = `/imagens/${req.file.filename}`;

                // Se já existe uma imagem antiga, deleta do servidor
                if (usuarioExistente.caminho_imagem) {
                    const caminhoAntigoLocal = path.join(process.cwd(), 'uploads', usuarioExistente.caminho_imagem.replace('/imagens/', ''));
                    fs.unlink(caminhoAntigoLocal, (err) => {
                        if (err) console.error('Erro ao deletar imagem antiga:', err);
                    });
                }
            } else {
                // Se não subiu imagem nova, mantém a antiga que já estava no banco
                caminhoImagem = usuarioExistente.caminho_imagem;
            }

            const usuario = Usuario.editar({
                nome,
                cpf,
                tipo_usuario,
                email,
                hash_senha,
                caminho_imagem: caminhoImagem // Repassa a imagem atualizada ou mantida
            }, id);

            const result = await usuarioRepository.editar(id, usuario);

            res.status(200).json({ result });

        } catch (error) {
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Erro ao deletar arquivo:', err);
                });
            }
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

            const senhaValida = await bcrypt.compare(
                senha,
                usuario.hash_senha
            );

            if (!senhaValida) {
                return res.status(401).json({
                    erro: "Senha inválida"
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.id_usuario,
                    tipo_usuario: usuario.tipo_usuario
                },
                process.env.JWT_SECRET,
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
};

export default usuarioController;