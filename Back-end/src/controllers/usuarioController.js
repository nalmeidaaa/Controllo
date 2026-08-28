import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import usuarioRepository from "../repositories/usuarioRepository.js";
import fs from "fs";
import path from "path";

const usuarioController = {

    criar: async (req, res) => {
        try {
            let { nome, cpf, tipo_usuario, email, senha } = req.body;

            // Regra de segurança:
            // Se não existir nenhum administrador, força o tipo para "administracao"
            const admsExistentes =
                await usuarioRepository.selecionarAdministracao();

            if (admsExistentes.length === 0) {
                tipo_usuario = "administracao";
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
                message:
                    admsExistentes.length === 0
                        ? "Primeiro administrador criado com sucesso"
                        : "Usuário criado com sucesso",
                result
            });

        } catch (error) {

            // Se ocorreu erro e uma imagem foi enviada,
            // remove a imagem que acabou de ser criada
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error("Erro ao deletar arquivo:", err);
                    }
                });
            }

            console.error("ERRO AO CRIAR USUÁRIO:", error);

            // Erro de CPF ou E-mail duplicado
            if (error.code === "ER_DUP_ENTRY") {

                if (error.message.toLowerCase().includes("cpf")) {
                    return res.status(409).json({
                        message: "O CPF informado já está cadastrado.",
                        campo: "cpf"
                    });
                }

                if (error.message.toLowerCase().includes("email")) {
                    return res.status(409).json({
                        message: "O E-mail informado já está cadastrado.",
                        campo: "email"
                    });
                }

                return res.status(409).json({
                    message: "Já existe um usuário com esses dados."
                });
            }

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    selecionar: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionar();

            return res.status(200).json({
                result
            });

        } catch (error) {
            console.error("ERRO AO SELECIONAR USUÁRIOS:", error);

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
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

            // Verifica se o usuário existe
            const usuarioExistente =
                await usuarioRepository.selecionarPorId(id);

            if (!usuarioExistente) {

                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error(
                                "Erro ao deletar arquivo:",
                                err
                            );
                        }
                    });
                }

                return res.status(404).json({
                    message: "Usuário não encontrado.",
                    campo: "usuario"
                });
            }

            let hash_senha = null;

            // Gera hash somente se uma nova senha foi informada
            if (senha) {
                hash_senha = await bcrypt.hash(senha, 10);
            }

            // Monta o caminho da imagem
            let caminhoImagem = null;

            if (req.file) {

                caminhoImagem = `/imagens/${req.file.filename}`;

                // Se existe uma imagem antiga, remove do servidor
                if (usuarioExistente.caminho_imagem) {

                    const caminhoAntigoLocal = path.join(
                        process.cwd(),
                        "uploads",
                        usuarioExistente.caminho_imagem.replace(
                            "/imagens/",
                            ""
                        )
                    );

                    fs.unlink(caminhoAntigoLocal, (err) => {
                        if (err) {
                            console.error(
                                "Erro ao deletar imagem antiga:",
                                err
                            );
                        }
                    });
                }

            } else {

                // Mantém a imagem antiga
                caminhoImagem =
                    usuarioExistente.caminho_imagem;
            }

            const usuario = Usuario.editar(
                {
                    nome,
                    cpf,
                    tipo_usuario,
                    email,
                    hash_senha,
                    caminho_imagem: caminhoImagem
                },
                id
            );

            const result =
                await usuarioRepository.editar(id, usuario);

            return res.status(200).json({
                result
            });

        } catch (error) {

            // Se ocorreu erro e uma imagem nova foi enviada,
            // remove a imagem
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) {
                        console.error(
                            "Erro ao deletar arquivo:",
                            err
                        );
                    }
                });
            }

            console.error("ERRO AO EDITAR USUÁRIO:", error);

            // Erro de CPF ou E-mail duplicado
            if (error.code === "ER_DUP_ENTRY") {

                if (error.message.toLowerCase().includes("cpf")) {
                    return res.status(409).json({
                        message:
                            "O CPF informado já está cadastrado.",
                        campo: "cpf"
                    });
                }

                if (error.message.toLowerCase().includes("email")) {
                    return res.status(409).json({
                        message:
                            "O E-mail informado já está cadastrado.",
                        campo: "email"
                    });
                }

                return res.status(409).json({
                    message:
                        "Já existe um usuário com esses dados."
                });
            }

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    deletar: async (req, res) => {
        try {
            const id = req.params.id;

            const result =
                await usuarioRepository.deletar(id);

            return res.status(200).json({
                result
            });

        } catch (error) {
            console.error("ERRO AO DELETAR USUÁRIO:", error);

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    selecionarAdministracao: async (req, res) => {
        try {
            const result =
                await usuarioRepository.selecionarAdministracao();

            return res.status(200).json({
                result
            });

        } catch (error) {
            console.error(
                "ERRO AO SELECIONAR ADMINISTRAÇÃO:",
                error
            );

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    selecionarManutencao: async (req, res) => {
        try {
            const result =
                await usuarioRepository.selecionarManutencao();

            return res.status(200).json({
                result
            });

        } catch (error) {
            console.error(
                "ERRO AO SELECIONAR MANUTENÇÃO:",
                error
            );

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    selecionarGeral: async (req, res) => {
        try {
            const result =
                await usuarioRepository.selecionarGeral();

            return res.status(200).json({
                result
            });

        } catch (error) {
            console.error(
                "ERRO AO SELECIONAR USUÁRIOS GERAIS:",
                error
            );

            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            });
        }
    },


    login: async (req, res) => {
        try {
            const { login, senha } = req.body;

            if (!login || !senha) {
                return res.status(400).json({
                    message: "Login e senha são obrigatórios"
                });
            }

            let usuario;

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (emailRegex.test(login)) {

                usuario =
                    await usuarioRepository.buscarPorEmail(
                        login
                    );

            } else {

                const cpfLimpo =
                    login.replace(/\D/g, "");

                usuario =
                    await usuarioRepository.buscarPorCpf(
                        cpfLimpo
                    );
            }

            if (!usuario) {
                return res.status(401).json({
                    message: "Usuário não encontrado"
                });
            }

            const senhaValida =
                await bcrypt.compare(
                    senha,
                    usuario.hash_senha
                );

            if (!senhaValida) {
                return res.status(401).json({
                    message: "Senha inválida"
                });
            }

            const token = jwt.sign(
                {
                    id: usuario.id_usuario,
                    tipo_usuario: usuario.tipo_usuario
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1h"
                }
            );

            return res.json({
                token
            });

        } catch (error) {

            console.error("ERRO NO LOGIN:", error);

            return res.status(500).json({
                message: "Erro no servidor",
                error: error.message
            });
        }
    }
};

export default usuarioController;