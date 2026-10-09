import fs from 'fs';
import path from 'path';

import { Patrimonio } from '../models/Patrimonio.js';
import patrimonioRepository from '../repositories/patrimonioRepository.js';

const patrimonioController = {

    // ============================================================
    // CRIAR PATRIMÔNIO
    // ============================================================
    criar: async (req, res) => {
        try {
            const {
                nome,
                status,
                id_sala,
                numero_patrimonio
            } = req.body;

            // Monta o caminho da imagem se foi feito upload
            let caminhoImagem = null;

            if (req.file) {
                caminhoImagem = `/imagens/${req.file.filename}`;
            }

            // Passa o caminho da imagem junto com o objeto para o método criar
            const patrimonio = Patrimonio.criar({
                nome,
                status: status ?? 'Ok',
                id_sala,
                caminho_imagem: caminhoImagem,
                numero_patrimonio:
                    numero_patrimonio || null
            });

            const result =
                await patrimonioRepository.criar(
                    patrimonio
                );

            // Devolve o objeto completo do patrimônio
            // para que o front consiga atualizar a lista
            // sem precisar recarregar a página
            const patrimonioCriado = {
                id_patrimonio: result.insertId,
                nome: patrimonio.nome,
                status: patrimonio.status,
                id_sala: patrimonio.idSala,
                caminho_imagem:
                    patrimonio.caminhoImagem,
                numero_patrimonio:
                    patrimonio.numero_patrimonio
            };

            res.status(201).json({
                result: patrimonioCriado
            });

        } catch (error) {

            // Se houve upload mas ocorreu um erro
            // no processo, deleta o arquivo
            // para evitar lixo no servidor
            if (req.file) {
                fs.unlink(
                    req.file.path,
                    (err) => {
                        if (err) {
                            console.error(
                                'Erro ao deletar arquivo:',
                                err
                            );
                        }
                    }
                );
            }

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // EDITAR PATRIMÔNIO
    // ============================================================
    editar: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                nome,
                status,
                id_sala,
                numero_patrimonio
            } = req.body;

            const existente =
                await patrimonioRepository.selecionarPorId(
                    id
                );

            if (!existente) {

                // Se tentou subir uma imagem para um
                // patrimônio que não existe, limpa
                // o arquivo enviado
                if (req.file) {
                    fs.unlink(
                        req.file.path,
                        (err) => {
                            if (err) {
                                console.error(
                                    'Erro ao deletar arquivo:',
                                    err
                                );
                            }
                        }
                    );
                }

                return res.status(404).json({
                    erro:
                        'Patrimônio não encontrado.'
                });
            }

            // Monta o caminho da imagem se foi feito upload
            let caminhoImagem = null;

            if (req.file) {

                caminhoImagem =
                    `/imagens/${req.file.filename}`;

                // Se já existia uma imagem antiga
                // atrelada a este patrimônio,
                // deleta ela do disco
                if (existente.caminho_imagem) {

                    const caminhoAntigoLocal =
                        path.join(
                            process.cwd(),
                            'uploads',
                            existente.caminho_imagem
                                .replace(
                                    '/imagens/',
                                    ''
                                )
                        );

                    fs.unlink(
                        caminhoAntigoLocal,
                        (err) => {
                            if (err) {
                                console.error(
                                    'Erro ao deletar imagem antiga:',
                                    err
                                );
                            }
                        }
                    );
                }

            } else {

                // Se não enviou uma nova imagem,
                // mantém a que já estava salva
                // no banco
                caminhoImagem =
                    existente.caminho_imagem;
            }

            // Cria a instância editada
            const patrimonio =
                Patrimonio.editar(
                    {
                        nome:
                            nome ||
                            existente.nome,

                        status:
                            status ||
                            existente.status,

                        id_sala:
                            id_sala ||
                            existente.id_sala,

                        caminho_imagem:
                            caminhoImagem,

                        numero_patrimonio:
                            numero_patrimonio ||
                            existente.numero_patrimonio ||
                            null
                    },
                    id
                );

            const result =
                await patrimonioRepository.editar(
                    id,
                    patrimonio
                );

            // Devolve o objeto atualizado completo
            const patrimonioAtualizado = {
                id_patrimonio: Number(id),
                nome: patrimonio.nome,
                status: patrimonio.status,
                id_sala: patrimonio.idSala,
                caminho_imagem:
                    patrimonio.caminhoImagem,
                numero_patrimonio:
                    patrimonio.numero_patrimonio
            };

            res.status(200).json({
                result: patrimonioAtualizado
            });

        } catch (error) {

            // Fallback de erro:
            // se falhar o update na base,
            // remove a imagem recém-enviada
            if (req.file) {
                fs.unlink(
                    req.file.path,
                    (err) => {
                        if (err) {
                            console.error(
                                'Erro ao deletar arquivo:',
                                err
                            );
                        }
                    }
                );
            }

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR TODOS
    // ============================================================
    selecionar: async (req, res) => {
        try {

            const result =
                await patrimonioRepository.selecionar();

            res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR POR ID
    // ============================================================
    selecionarPorId: async (req, res) => {
        try {

            const { id } = req.params;

            const result =
                await patrimonioRepository
                    .selecionarPorId(id);

            if (!result) {
                return res.status(404).json({
                    erro:
                        'Patrimônio não encontrado.'
                });
            }

            res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR POR SALA
    // ============================================================
    selecionarPorSala: async (req, res) => {
        try {

            const { id_sala } = req.params;

            const result =
                await patrimonioRepository
                    .selecionarPorSala(id_sala);

            res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR POR BLOCO
    // ============================================================
    selecionarPorBloco: async (req, res) => {
        try {

            const { bloco } = req.params;

            const result =
                await patrimonioRepository
                    .selecionarPorBloco(bloco);

            res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // DELETAR
    // ============================================================
    deletar: async (req, res) => {
        try {

            const { id } = req.params;

            const existente =
                await patrimonioRepository
                    .selecionarPorId(id);

            if (!existente) {
                return res.status(404).json({
                    erro:
                        'Patrimônio não encontrado.'
                });
            }

            const result =
                await patrimonioRepository.deletar(id);

            res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage: error.message
            });
        }
    },


    // ============================================================
    // TRANSFERIR PATRIMÔNIO
    // ============================================================
    transferir: async (req, res) => {
        try {

            const { id } = req.params;

            const {
                id_sala_destino
            } = req.body;

            // ----------------------------------------------------
            // Validação da sala de destino
            // ----------------------------------------------------
            if (!id_sala_destino) {
                return res.status(400).json({
                    erro:
                        'Informe a sala de destino.'
                });
            }

            // ----------------------------------------------------
            // Verifica se o patrimônio existe
            // ----------------------------------------------------
            const patrimonio =
                await patrimonioRepository
                    .selecionarPorId(id);

            if (!patrimonio) {
                return res.status(404).json({
                    erro:
                        'Patrimônio não encontrado.'
                });
            }

            // ----------------------------------------------------
            // Faz a transferência e registra o histórico
            // ----------------------------------------------------
            const resultado =
                await patrimonioRepository.transferir(
                    id,
                    id_sala_destino
                );

            console.log(
                'Patrimônio transferido:',
                resultado
            );

            return res.status(200).json({
                mensagem:
                    'Patrimônio transferido com sucesso.',
                result: resultado
            });

        } catch (error) {

            console.error(
                'Erro ao transferir patrimônio:',
                error
            );

            // ----------------------------------------------------
            // Erros conhecidos
            // ----------------------------------------------------
            if (
                error.message ===
                'Patrimônio não encontrado.'
            ) {
                return res.status(404).json({
                    erro: error.message
                });
            }

            if (
                error.message ===
                'Sala de origem não encontrada.'
            ) {
                return res.status(404).json({
                    erro: error.message
                });
            }

            if (
                error.message ===
                'Sala de destino não encontrada.'
            ) {
                return res.status(404).json({
                    erro: error.message
                });
            }

            if (
                error.message ===
                'O patrimônio já está nesta sala.'
            ) {
                return res.status(400).json({
                    erro: error.message
                });
            }

            // ----------------------------------------------------
            // Erro interno
            // ----------------------------------------------------
            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // HISTÓRICO DE TRANSFERÊNCIAS
    // ============================================================
    historicoTransferencias: async (
        req,
        res
    ) => {
        try {

            const { id } = req.params;

            // ----------------------------------------------------
            // Verifica se o patrimônio existe
            // ----------------------------------------------------
            const patrimonio =
                await patrimonioRepository
                    .selecionarPorId(id);

            if (!patrimonio) {
                return res.status(404).json({
                    erro:
                        'Patrimônio não encontrado.'
                });
            }

            // ----------------------------------------------------
            // Busca o histórico
            // ----------------------------------------------------
            const result =
                await patrimonioRepository
                    .selecionarHistoricoTransferencias(
                        id
                    );

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(
                'Erro ao buscar histórico:',
                error
            );

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    }

};

export default patrimonioController;