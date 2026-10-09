import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/Usuario.js";
import usuarioRepository, { UsuarioError } from "../repositories/usuarioRepository.js";
import fs from "fs";
import path from "path";
import { normalizarTipoUsuario } from "../utils/normalizarTipoUsuario.js";

// Apaga do disco um arquivo enviado por upload (caminho salvo no banco: /imagens/<arquivo>)
const apagarImagemDoDisco = (caminhoImagem) => {
    if (!caminhoImagem) return;
    const caminhoLocal = path.join(process.cwd(), "uploads", caminhoImagem);
    fs.unlink(caminhoLocal, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("Erro ao deletar imagem:", err);
        }
    });
};

// Remove o arquivo que o multer acabou de salvar (quando a requisição falha)
const descartarUpload = (req) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Erro ao deletar arquivo:", err);
        });
    }
};

// Erros de regra de negócio e de duplicidade (CPF / e-mail) das rotas de cadastro e aprovação
const responderErroUsuario = (res, error) => {
    if (error instanceof UsuarioError) {
        return res.status(error.status).json({ message: error.message, ...error.extra });
    }

    if (error.code === "ER_DUP_ENTRY") {
        const mensagemErro = error.message.toLowerCase();
        if (mensagemErro.includes("cpf")) {
            return res.status(409).json({ message: "O CPF informado já está cadastrado.", campo: "cpf" });
        }
        if (mensagemErro.includes("email")) {
            return res.status(409).json({ message: "O E-mail informado já está cadastrado.", campo: "email" });
        }
        return res.status(409).json({ message: "Já existe um usuário com esses dados." });
    }

    console.error("ERRO NO CADASTRO/APROVAÇÃO:", error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor.", error: error.message });
};

const usuarioController = {

    // CADASTRO PÚBLICO: sempre cria o usuário como "pendente", ignorando qualquer tipo enviado
    cadastrar: async (req, res) => {
        try {
            const { nome, cpf, email, senha } = req.body ?? {};

            // Sem administrador o sistema ainda não foi configurado: o primeiro acesso é o setup
            const admsExistentes = await usuarioRepository.selecionarAdministracao();
            if (admsExistentes.length === 0) {
                descartarUpload(req);
                return res.status(403).json({
                    message: "O sistema ainda não foi configurado. Realize o cadastro inicial do administrador."
                });
            }

            if (typeof nome !== "string" || nome.trim().length < 3) {
                descartarUpload(req);
                return res.status(400).json({ message: "Informe o nome completo.", campo: "nome" });
            }
            if (!cpf) {
                descartarUpload(req);
                return res.status(400).json({ message: "Informe o CPF.", campo: "cpf" });
            }
            if (!email) {
                descartarUpload(req);
                return res.status(400).json({ message: "Informe o e-mail.", campo: "email" });
            }

            if (
                typeof senha !== "string" ||
                senha.length < 6 || !/[A-Z]/.test(senha) || !/[a-z]/.test(senha) || !/[^A-Za-z0-9]/.test(senha)
            ) {
                descartarUpload(req);
                return res.status(400).json({
                    message: "A senha deve possuir no mínimo 6 caracteres, uma letra maiúscula, uma letra minúscula e um caractere especial.",
                    campo: "senha"
                });
            }


            const hash_senha = await bcrypt.hash(senha, 10);
            const caminhoImagem = req.file ? `/imagens/${req.file.filename}` : null;

            let usuario;
            try {
                usuario = Usuario.criar({
                    nome: nome.trim(),
                    cpf,
                    tipo_usuario: "pendente", // fixo: nunca vem do corpo da requisição
                    email,
                    hash_senha,
                    caminho_imagem: caminhoImagem
                });
            } catch (erroValidacao) {
                descartarUpload(req);
                const campo = /cpf/i.test(erroValidacao.message) ? "cpf" : /email/i.test(erroValidacao.message) ? "email" : undefined;
                return res.status(400).json({ message: erroValidacao.message, ...(campo && { campo }) });
            }

            await usuarioRepository.criar(usuario);

            return res.status(201).json({
                message: "Cadastro enviado! Aguarde a aprovação do administrador."
            });
        } catch (error) {
            descartarUpload(req);
            return responderErroUsuario(res, error);
        }
    },

    selecionarPendentes: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionarPendentes();
            return res.status(200).json({ result });
        } catch (error) {
            return responderErroUsuario(res, error);
        }
    },

    contarPendentes: async (req, res) => {
        try {
            const result = await usuarioRepository.contarPendentes();
            return res.status(200).json({ result });
        } catch (error) {
            return responderErroUsuario(res, error);
        }
    },

    aprovar: async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "Usuário informado é inválido." });
            }

            const { tipo_usuario } = req.body ?? {};
            if (!tipo_usuario) {
                return res.status(400).json({ message: "Informe o perfil do usuário.", campo: "tipo_usuario" });
            }

            const result = await usuarioRepository.aprovar(id, tipo_usuario);
            return res.status(200).json({ message: "Cadastro aprovado com sucesso.", result });
        } catch (error) {
            return responderErroUsuario(res, error);
        }
    },

    recusar: async (req, res) => {
        try {
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || id <= 0) {
                return res.status(400).json({ message: "Usuário informado é inválido." });
            }

            const { caminho_imagem } = await usuarioRepository.recusar(id);
            apagarImagemDoDisco(caminho_imagem);

            return res.status(200).json({ message: "Cadastro recusado e excluído." });
        } catch (error) {
            return responderErroUsuario(res, error);
        }
    },

    criar: async (req, res) => {
        try {
            let { nome, cpf, tipo_usuario, email, senha } = req.body;

            // Regra de segurança:
            // Se não existir nenhum administrador, força o tipo para "administracao"
            const admsExistentes =
                await usuarioRepository.selecionarAdministracao();

            if (admsExistentes.length === 0) {
                tipo_usuario = "administracao";
            } else if (
                tipo_usuario &&
                normalizarTipoUsuario(tipo_usuario) === "desativado"
            ) {
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) {
                            console.error("Erro ao deletar arquivo:", err);
                        }
                    });
                }

                return res.status(400).json({
                    message: "Não é possível criar um usuário já desativado.",
                    campo: "tipo_usuario"
                });
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
    verificarSetup: async (req, res) => {
        try {
            const result = await usuarioRepository.verificarSetup();

            return res.status(200).json({
                result
            });
        } catch (error) {
            return res.status(500).json({
                message: "Ocorreu um erro no servidor.",
                error: error.message
            })
        }
    },

    selecionar: async (req, res) => {
        try {
            const result = await usuarioRepository.selecionar();

            return res.status(200).json({
                result
            });

        } catch (error) {

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

            // Só informa o estado da conta a quem sabe a senha
            const tipoDoUsuario = normalizarTipoUsuario(usuario.tipo_usuario);

            if (tipoDoUsuario === "pendente") {
                return res.status(403).json({
                    message: "Seu cadastro ainda está aguardando aprovação."
                });
            }

            if (tipoDoUsuario === "desativado") {
                return res.status(403).json({
                    message: "Sua conta está desativada. Procure o administrador."
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