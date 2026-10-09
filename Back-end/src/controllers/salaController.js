import { Sala } from '../models/Sala.js';
import { Patrimonio } from '../models/Patrimonio.js';
import salaRepository from '../repositories/salaRepository.js';
import patrimonioRepository from '../repositories/patrimonioRepository.js';
import fs from 'fs';
import path from 'path';

const salaController = {

    criar: async (req, res) => {
        try {
            const {
                descricao,
                bloco,
                patrimonios: patrimoniosRaw
            } = req.body;

            if (!descricao || !bloco) {

                // Se der erro de validação, limpa qualquer arquivo que subiu no Multer
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }

                return res.status(400).json({
                    erro: 'Descrição e bloco são obrigatórios.'
                });
            }

            // Faz o parse do array de patrimônios enviado via FormData
            let patrimonios = [];

            if (patrimoniosRaw) {
                patrimonios =
                    typeof patrimoniosRaw === 'string'
                        ? JSON.parse(patrimoniosRaw)
                        : patrimoniosRaw;
            }

            // ============================================================
            // 1. CAPTURA A FOTO ESPECÍFICA DA SALA
            // ============================================================

            console.log('REQ.FILES =>', req.files);

            const arquivoSala =
                req.files?.find(
                    f => f.fieldname === 'imagem_sala'
                );

            const caminhoImagemSala =
                arquivoSala
                    ? `/imagens/${arquivoSala.filename}`
                    : null;

            const sala =
                Sala.criar(
                    descricao,
                    bloco,
                    caminhoImagemSala
                );

            // ============================================================
            // 2. INSTANCIA OS PATRIMÔNIOS
            // ============================================================

            const instanciasPatrimonio =
                patrimonios.map((p, index) => {

                    const arquivoPatrimonio =
                        req.files?.find(
                            f =>
                                f.fieldname ===
                                `foto_${index}`
                        );

                    const caminhoImagemPatrimonio =
                        arquivoPatrimonio
                            ? `/imagens/${arquivoPatrimonio.filename}`
                            : null;

                    return Patrimonio.criar({
                        nome: p.nome,
                        status: p.status,
                        id_sala: null,
                        caminhoImagem:
                            caminhoImagemPatrimonio,
                        numero_patrimonio:
                            p.numero_patrimonio || null
                    });
                });

            // ============================================================
            // 3. PERSISTÊNCIA TRANSACTIONAL
            // ============================================================

            const result =
                await salaRepository.criarComPatrimonios(
                    sala,
                    instanciasPatrimonio
                );

            return res.status(201).json({
                mensagem:
                    'Sala e patrimônios criados com sucesso',
                result
            });

        } catch (error) {

            // Rollback físico:
            // apaga os arquivos salvos se a transação do banco estourar
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {

                    fs.unlink(
                        file.path,
                        err => {
                            if (err) {
                                console.error(
                                    'Erro ao deletar arquivo no rollback:',
                                    err
                                );
                            }
                        }
                    );

                });
            }

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    editar: async (req, res) => {
        try {
            const { id } = req.params;

            const {
                descricao,
                bloco,
                patrimonios: patrimoniosRaw
            } = req.body;

            const salaExistente =
                await salaRepository.selecionarPorId(id);

            if (!salaExistente) {

                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => {
                        fs.unlinkSync(file.path);
                    });
                }

                return res.status(404).json({
                    erro: 'Sala não encontrada.'
                });
            }

            // ============================================================
            // 1. PROCESSA NOVA IMAGEM DA SALA
            // ============================================================

            const arquivoSala =
                req.files?.find(
                    f => f.fieldname === 'imagem_sala'
                );

            let caminhoImagemSala =
                salaExistente.caminho_imagem;

            if (arquivoSala) {

                caminhoImagemSala =
                    `/imagens/${arquivoSala.filename}`;

                // Remove a foto antiga da sala do HD
                if (salaExistente.caminho_imagem) {

                    const caminhoAntigoLocal =
                        path.join(
                            process.cwd(),
                            'uploads',
                            salaExistente.caminho_imagem
                                .replace('/imagens/', '')
                        );

                    fs.unlink(
                        caminhoAntigoLocal,
                        err => {
                            if (err) {
                                console.error(err);
                            }
                        }
                    );
                }
            }

            const sala =
                Sala.editar(
                    id,
                    descricao ||
                        salaExistente.descricao,
                    bloco ||
                        salaExistente.bloco,
                    caminhoImagemSala
                );

            // ============================================================
            // 2. PROCESSA A LISTA DE PATRIMÔNIOS
            // ============================================================

            let instanciasPatrimonio = null;

            if (patrimoniosRaw !== undefined) {

                const patrimonios =
                    typeof patrimoniosRaw === 'string'
                        ? JSON.parse(patrimoniosRaw)
                        : patrimoniosRaw;

                // Busca o estado atual dos patrimônios da sala
                // para poder reter a imagem
                const patrimoniosExistentes =
                    await patrimonioRepository
                        .selecionarPorSala(id);

                const mapaImagensExistentes =
                    new Map(
                        patrimoniosExistentes.map(
                            p => [
                                String(
                                    p.id_patrimonio
                                ),
                                p.caminho_imagem
                            ]
                        )
                    );

                instanciasPatrimonio =
                    patrimonios.map(
                        (p, index) => {

                            const arquivoPatrimonio =
                                req.files?.find(
                                    f =>
                                        f.fieldname ===
                                        `foto_${index}`
                                );

                            const caminhoImagemPatrimonio =
                                arquivoPatrimonio
                                    ? `/imagens/${arquivoPatrimonio.filename}`
                                    : null;

                            const idPatrimonio =
                                p.id_patrimonio ||
                                p.id;

                            if (idPatrimonio) {

                                // Se já existe, edita passando o ID real
                                // e retém a foto antiga se nenhuma nova
                                // foi enviada
                                const imagemAtual =
                                    mapaImagensExistentes.get(
                                        String(
                                            idPatrimonio
                                        )
                                    ) || null;

                                return Patrimonio.editar(
                                    {
                                        nome: p.nome,
                                        status: p.status,
                                        id_sala: id,
                                        caminhoImagem:
                                            caminhoImagemPatrimonio ||
                                            p.caminho_imagem ||
                                            imagemAtual,
                                        numero_patrimonio:
                                            p.numero_patrimonio ||
                                            null
                                    },
                                    idPatrimonio
                                );

                            } else {

                                // Se for um item novo durante a edição,
                                // cria associando ao ID real da sala
                                return Patrimonio.criar({
                                    nome: p.nome,
                                    status: p.status,
                                    id_sala: id,
                                    caminhoImagem:
                                        caminhoImagemPatrimonio,
                                    numero_patrimonio:
                                        p.numero_patrimonio ||
                                        null
                                });
                            }
                        }
                    );
            }

            // ============================================================
            // 3. SALVA ALTERAÇÕES DA SALA E PATRIMÔNIOS
            // ============================================================

            const {
                patrimoniosParaDeletar
            } =
                await salaRepository
                    .editarComPatrimonios(
                        id,
                        sala,
                        instanciasPatrimonio
                    );

            // ============================================================
            // 4. REMOVE DO HD AS IMAGENS DOS PATRIMÔNIOS EXCLUÍDOS
            // ============================================================

            if (
                patrimoniosParaDeletar &&
                patrimoniosParaDeletar.length > 0
            ) {

                for (
                    const pDel
                    of patrimoniosParaDeletar
                ) {

                    if (pDel.caminho_imagem) {

                        const caminhoDelLocal =
                            path.join(
                                process.cwd(),
                                'uploads',
                                pDel.caminho_imagem
                                    .replace(
                                        '/imagens/',
                                        ''
                                    )
                            );

                        fs.unlink(
                            caminhoDelLocal,
                            err => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }
                }
            }

            return res.status(200).json({
                mensagem:
                    'Sala e patrimônios atualizados com sucesso'
            });

        } catch (error) {

            // Em caso de erro, limpa os uploads
            // desta requisição
            if (req.files && req.files.length > 0) {

                req.files.forEach(file => {

                    fs.unlink(
                        file.path,
                        err => {
                            if (err) {
                                console.error(err);
                            }
                        }
                    );

                });
            }

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // DESATIVAR SALA
    // ============================================================

    desativar: async (req, res) => {
        try {

            const { id } = req.params;

            // Verifica se a sala existe
            const salaExistente =
                await salaRepository
                    .selecionarPorId(id);

            if (!salaExistente) {

                return res.status(404).json({
                    erro: 'Sala não encontrada.'
                });
            }

            // Verifica se a sala já está desativada
            if (
                salaExistente.status === 'inativo'
            ) {

                return res.status(400).json({
                    erro:
                        'A sala já está desativada.'
                });
            }

            // Altera somente o status da sala
            const result =
                await salaRepository.desativar(id);

            return res.status(200).json({
                mensagem:
                    'Sala desativada com sucesso.',
                result
            });

        } catch (error) {

            console.error(
                'Erro ao desativar sala:',
                error
            );

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // ATIVAR / REATIVAR SALA
    // ============================================================

    ativar: async (req, res) => {
        try {

            const { id } = req.params;

            console.log(
                '================================='
            );

            console.log(
                'REATIVANDO SALA'
            );

            console.log(
                'ID:',
                id
            );

            console.log(
                '================================='
            );

            // Verifica se a sala existe
            const salaExistente =
                await salaRepository
                    .selecionarPorId(id);

            if (!salaExistente) {

                return res.status(404).json({
                    erro: 'Sala não encontrada.'
                });
            }

            // Verifica se a sala já está ativa
            if (
                salaExistente.status === 'ativo'
            ) {

                return res.status(400).json({
                    erro:
                        'A sala já está ativa.'
                });
            }

            // Altera o status para ativo
            const result =
                await salaRepository.ativar(id);

            console.log(
                'Sala reativada com sucesso:',
                result
            );

            return res.status(200).json({
                mensagem:
                    'Sala reativada com sucesso.',
                result
            });

        } catch (error) {

            console.error(
                'Erro ao reativar sala:',
                error
            );

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // DELETAR SALA
    // ============================================================

    deletar: async (req, res) => {
        try {

            const { id } = req.params;

            const salaExistente =
                await salaRepository
                    .selecionarPorId(id);

            if (!salaExistente) {

                return res.status(404).json({
                    erro:
                        'Sala não encontrada.'
                });
            }

            // ========================================================
            // 1. BUSCA OS PATRIMÔNIOS DA SALA
            // ========================================================

            const patrimoniosDaSala =
                await patrimonioRepository
                    .selecionarPorSala(id);

            if (
                patrimoniosDaSala &&
                patrimoniosDaSala.length > 0
            ) {

                for (
                    const patr
                    of patrimoniosDaSala
                ) {

                    if (patr.caminho_imagem) {

                        const caminhoLocalPatr =
                            path.join(
                                process.cwd(),
                                'uploads',
                                patr.caminho_imagem
                                    .replace(
                                        '/imagens/',
                                        ''
                                    )
                            );

                        fs.unlink(
                            caminhoLocalPatr,
                            err => {
                                if (err) {
                                    console.error(err);
                                }
                            }
                        );
                    }
                }
            }

            // ========================================================
            // 2. APAGA A IMAGEM DA SALA
            // ========================================================

            if (
                salaExistente.caminho_imagem
            ) {

                const caminhoLocal =
                    path.join(
                        process.cwd(),
                        'uploads',
                        salaExistente.caminho_imagem
                            .replace(
                                '/imagens/',
                                ''
                            )
                    );

                fs.unlink(
                    caminhoLocal,
                    err => {
                        if (err) {
                            console.error(err);
                        }
                    }
                );
            }

            // ========================================================
            // 3. DELETA SALA E PATRIMÔNIOS
            // ========================================================

            const result =
                await salaRepository
                    .deletarComPatrimonios(id);

            return res.status(200).json({
                mensagem:
                    'Sala e todos os seus patrimônios deletados com sucesso',
                result
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // LISTAR SALAS E PATRIMÔNIOS
    // ============================================================

    listarSalaEPatrimonios: async (req, res) => {
        try {

            const result =
                req.params.id
                    ? await salaRepository
                        .listarSalaEPatrimonios(
                            req.params.id
                        )
                    : await salaRepository
                        .listarSalaEPatrimonios();

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR SALAS ATIVAS
    // ============================================================

    selecionar: async (req, res) => {
        try {

            const result =
                await salaRepository.selecionar();

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR SALAS DESATIVADAS
    // ============================================================

    selecionarDesativadas: async (req, res) => {
        try {

            const result =
                await salaRepository
                    .selecionarDesativadas();

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(
                'Erro ao listar salas desativadas:',
                error
            );

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR SALA POR ID
    // ============================================================

    selecionarPorId: async (req, res) => {
        try {

            const { id } = req.params;

            const result =
                await salaRepository
                    .selecionarPorId(id);

            if (!result) {

                return res.status(404).json({
                    erro:
                        'Sala não encontrada.'
                });
            }

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    },


    // ============================================================
    // SELECIONAR SALAS POR BLOCO
    // ============================================================

    selecionarPorBloco: async (req, res) => {
        try {

            const { bloco } = req.params;

            const result =
                await salaRepository
                    .selecionarPorBloco(bloco);

            return res.status(200).json({
                result
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                mensagem:
                    'Ocorreu um erro no servidor',
                errorMessage:
                    error.message
            });
        }
    }
};

export default salaController;