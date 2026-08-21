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

        // Verifica se o usuário existe
        const usuarioExistente =
            await usuarioRepository.selecionarPorId(id);

        if (!usuarioExistente) {

            // Se uma imagem foi enviada, remove a nova imagem
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error(
                            'Erro ao deletar arquivo:',
                            err
                        );
                    }
                });
            }

            return res.status(404).json({
                erro: 'Usuário não encontrado.'
            });
        }

        // Guarda somente os dados que serão alterados
        const dadosAtualizados = {};

        // Atualiza o nome somente se foi enviado
        if (nome !== undefined) {
            dadosAtualizados.nome = nome;
        }

        // Atualiza o CPF somente se foi enviado
        if (cpf !== undefined) {
            dadosAtualizados.cpf = cpf;
        }

        // Atualiza o tipo de usuário somente se foi enviado
        if (tipo_usuario !== undefined) {
            dadosAtualizados.tipo_usuario = tipo_usuario;
        }

        // Atualiza o email somente se foi enviado
        if (email !== undefined) {
            dadosAtualizados.email = email;
        }

        // Gera o hash somente se uma nova senha foi informada
        if (senha !== undefined && senha !== '') {
            dadosAtualizados.hash_senha =
                await bcrypt.hash(senha, 10);
        }

        // Verifica se uma nova imagem foi enviada
        if (req.file) {

            dadosAtualizados.caminho_imagem =
                `/imagens/${req.file.filename}`;

            // Caminho da imagem antiga
            if (usuarioExistente.caminho_imagem) {

                const caminhoAntigoLocal = path.join(
                    process.cwd(),
                    'uploads',
                    usuarioExistente.caminho_imagem
                        .replace('/imagens/', '')
                );

                // Só tenta deletar se a imagem realmente existir
                if (fs.existsSync(caminhoAntigoLocal)) {

                    fs.unlink(caminhoAntigoLocal, (err) => {
                        if (err && err.code !== 'ENOENT') {
                            console.error(
                                'Erro ao deletar imagem antiga:',
                                err
                            );
                        }
                    });
                }
            }
        }

        // Verifica se algum dado foi enviado
        if (Object.keys(dadosAtualizados).length === 0) {

            // Remove a imagem que acabou de ser enviada
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err && err.code !== 'ENOENT') {
                        console.error(
                            'Erro ao deletar arquivo:',
                            err
                        );
                    }
                });
            }

            return res.status(400).json({
                erro: 'Nenhum dado foi informado para atualização.'
            });
        }

        // Cria o objeto usuário com os dados alterados
        const usuario = Usuario.editar(
            dadosAtualizados,
            id
        );

        // Atualiza no banco
        const result = await usuarioRepository.editar(
            id,
            usuario
        );

        return res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso!',
            result
        });

    } catch (error) {

        // Se ocorrer erro, remove a nova imagem enviada
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(
                        'Erro ao deletar arquivo:',
                        err
                    );
                }
            });
        }

        console.error(error);

        return res.status(500).json({
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