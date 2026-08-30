import { Sala } from '../models/Sala.js';
import { Patrimonio } from '../models/Patrimonio.js'; 
import salaRepository from '../repositories/salaRepository.js';
import patrimonioRepository from '../repositories/patrimonioRepository.js'; 
import fs from 'fs';
import path from 'path';

const salaController = {

    criar: async (req, res) => {
        try {
            const { descricao, bloco, patrimonios: patrimoniosRaw } = req.body;

            if (!descricao || !bloco) {
                // Se der erro de validação, limpa qualquer arquivo que subiu no Multer
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => fs.unlinkSync(file.path));
                }
                return res.status(400).json({ erro: 'Descrição e bloco são obrigatórios.' });
            }

            // Faz o parse do array de patrimônios enviado via FormData
            let patrimonios = [];
            if (patrimoniosRaw) {
                patrimonios = typeof patrimoniosRaw === 'string' ? JSON.parse(patrimoniosRaw) : patrimoniosRaw;
            }

            // 1. Captura a foto específica da SALA (key: 'imagem_sala')
            console.log('REQ.FILES =>', req.files);
            const arquivoSala = req.files?.find(f => f.fieldname === 'imagem_sala');
            const caminhoImagemSala = arquivoSala ? `/imagens/${arquivoSala.filename}` : null;

            const sala = Sala.criar(descricao, bloco, caminhoImagemSala);

            // 2. Instancia os patrimônios mapeando suas respectivas fotos individuais (key: 'foto_0', 'foto_1'...)
            const instanciasPatrimonio = patrimonios.map((p, index) => {
                const arquivoPatrimonio = req.files?.find(f => f.fieldname === `foto_${index}`);
                const caminhoImagemPatrimonio = arquivoPatrimonio ? `/imagens/${arquivoPatrimonio.filename}` : null;

                return Patrimonio.criar({
                    nome: p.nome,
                    status: p.status,
                    id_sala: null, // Sem improvisos. Nasce nulo na memória e o Repository vincula após o insertId
                    caminhoImagem: caminhoImagemPatrimonio,
                    numero_patrimonio: p.numero_patrimonio || null
                });
            });

            // Invoca a persistência transacional unificada no banco
            const result = await salaRepository.criarComPatrimonios(sala, instanciasPatrimonio);

            res.status(201).json({
                mensagem: 'Sala e patrimônios criados com sucesso',
                result
            });
        } catch (error) {
            // Rollback físico: apaga os arquivos salvos se a transação do banco estourar
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error('Erro ao deletar arquivo no rollback:', err);
                    });
                });
            }
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { descricao, bloco, patrimonios: patrimoniosRaw } = req.body;

            const salaExistente = await salaRepository.selecionarPorId(id);
            if (!salaExistente) {
                if (req.files && req.files.length > 0) {
                    req.files.forEach(file => fs.unlinkSync(file.path));
                }
                return res.status(404).json({ erro: 'Sala não encontrada.' });
            }

            // 1. Processa nova imagem da SALA (se enviada)
            const arquivoSala = req.files?.find(f => f.fieldname === 'imagem_sala');
            let caminhoImagemSala = salaExistente.caminho_imagem;

            if (arquivoSala) {
                caminhoImagemSala = `/imagens/${arquivoSala.filename}`;
                // Remove a foto antiga da sala do HD
                if (salaExistente.caminho_imagem) {
                    const caminhoAntigoLocal = path.join(process.cwd(), 'uploads', salaExistente.caminho_imagem.replace('/imagens/', ''));
                    fs.unlink(caminhoAntigoLocal, (err) => { if (err) console.error(err); });
                }
            }
            const sala = Sala.editar(id, descricao || salaExistente.descricao, bloco || salaExistente.bloco, caminhoImagemSala);

            // 2. Processa a lista de Patrimônios e suas fotos atualizadas
            let instanciasPatrimonio = null;
            if (patrimoniosRaw !== undefined) {
                const patrimonios = typeof patrimoniosRaw === 'string' ? JSON.parse(patrimoniosRaw) : patrimoniosRaw;

                // Busca o estado atual dos patrimônios da sala para poder reter a imagem
                // de quem não recebeu um novo upload nesta edição (o front não reenvia o
                // caminho_imagem existente, então sem isso a foto era apagada a cada save)
                const patrimoniosExistentes = await patrimonioRepository.selecionarPorSala(id);
                const mapaImagensExistentes = new Map(
                    patrimoniosExistentes.map((p) => [String(p.id_patrimonio), p.caminho_imagem])
                );

                instanciasPatrimonio = patrimonios.map((p, index) => {
                    const arquivoPatrimonio = req.files?.find(f => f.fieldname === `foto_${index}`);
                    const caminhoImagemPatrimonio = arquivoPatrimonio ? `/imagens/${arquivoPatrimonio.filename}` : null;

                    const idPatrimonio = p.id_patrimonio || p.id;

                    if (idPatrimonio) {
                        // Se já existe, edita passando o ID real e retém a foto antiga se nenhuma nova foi upada
                        const imagemAtual = mapaImagensExistentes.get(String(idPatrimonio)) || null;
                        return Patrimonio.editar({ 
                            nome: p.nome, 
                            status: p.status, 
                            id_sala: id, // ID legítimo da sala vindo da URL
                            caminhoImagem: caminhoImagemPatrimonio || p.caminho_imagem || imagemAtual,
                            numero_patrimonio: p.numero_patrimonio || null
                        }, idPatrimonio);
                    } else {
                        // Se for um item novo injetado durante a edição, cria associando ao ID real da sala
                        return Patrimonio.criar({ 
                            nome: p.nome, 
                            status: p.status, 
                            id_sala: id, 
                            caminhoImagem: caminhoImagemPatrimonio,
                            numero_patrimonio: p.numero_patrimonio || null
                        });
                    }
                });
            }

            // Salva alterações da sala e sincroniza os patrimônios na transação
            const { patrimoniosParaDeletar } = await salaRepository.editarComPatrimonios(id, sala, instanciasPatrimonio);

            // Limpa do HD os arquivos físicos de imagens dos patrimônios excluídos na sincronização
            if (patrimoniosParaDeletar && patrimoniosParaDeletar.length > 0) {
                for (const pDel of patrimoniosParaDeletar) {
                    if (pDel.caminho_imagem) {
                        const caminhoDelLocal = path.join(process.cwd(), 'uploads', pDel.caminho_imagem.replace('/imagens/', ''));
                        fs.unlink(caminhoDelLocal, (err) => { if (err) console.error(err); });
                    }
                }
            }

            res.status(200).json({ mensagem: 'Sala e patrimônios atualizados com sucesso' });
        } catch (error) {
            // Em caso de quebra, limpa o upload desta requisição falha
            if (req.files && req.files.length > 0) {
                req.files.forEach(file => {
                    fs.unlink(file.path, (err) => { if (err) console.error(err); });
                });
            }
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            const salaExistente = await salaRepository.selecionarPorId(id);
            if (!salaExistente) {
                return res.status(404).json({ erro: 'Sala não encontrada.' });
            }

            // 1. Busca os patrimônios atuais da sala para apagar as imagens do HD antes do drop na Base
            const patrimoniosDaSala = await patrimonioRepository.selecionarPorSala(id);
            if (patrimoniosDaSala && patrimoniosDaSala.length > 0) {
                for (const patr of patrimoniosDaSala) {
                    if (patr.caminho_imagem) {
                        const caminhoLocalPatr = path.join(process.cwd(), 'uploads', patr.caminho_imagem.replace('/imagens/', ''));
                        fs.unlink(caminhoLocalPatr, (err) => { if (err) console.error(err); });
                    }
                }
            }

            // 2. Apaga a imagem da própria sala do HD
            if (salaExistente.caminho_imagem) {
                const caminhoLocal = path.join(process.cwd(), 'uploads', salaExistente.caminho_imagem.replace('/imagens/', ''));
                fs.unlink(caminhoLocal, (err) => { if (err) console.error(err); });
            }

            // 3. Executa a deleção em cascata via Transação no Banco de Dados
            const result = await salaRepository.deletarComPatrimonios(id);

            res.status(200).json({ mensagem: 'Sala e todos os seus patrimônios deletados com sucesso', result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    listarSalaEPatrimonios: async (req, res) => {
        try {
            const result = req.params.id ? await salaRepository.listarSalaEPatrimonios(req.params.id) : await salaRepository.listarSalaEPatrimonios();

            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },
    
    selecionar: async (req, res) => {
        try {
            const result = await salaRepository.selecionar();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    selecionarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await salaRepository.selecionarPorId(id);

            if (!result) {
                return res.status(404).json({ erro: 'Sala não encontrada.' });
            }

            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    selecionarPorBloco: async (req, res) => {
        try {
            const { bloco } = req.params;
            const result = await salaRepository.selecionarPorBloco(bloco);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    }
};

export default salaController;