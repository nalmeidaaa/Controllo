import fs from 'fs';
import path from 'path';

import { Patrimonio } from '../models/Patrimonio.js';
import patrimonioRepository from '../repositories/patrimonioRepository.js';
import { error } from 'console';

const patrimonioController = {
    criar: async (req, res) => {
        try {
            const { nome, status, id_sala } = req.body;

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
                caminho_imagem: caminhoImagem
            });

            const result = await patrimonioRepository.criar(patrimonio);
            res.status(201).json({ result });
        } catch (error) {
            // Se houve upload mas ocorreu um erro no processo, deleta o arquivo para evitar lixo no servidor
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Erro ao deletar arquivo:', err);
                });
            }
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    editar: async (req, res) => {
        try {
            const { id } = req.params;
            const { nome, status, id_sala } = req.body;

            const existente = await patrimonioRepository.selecionarPorId(id);
            if (!existente) {
                // Se tentou subir uma imagem para um patrimônio que não existe, limpa o arquivo enviado
                if (req.file) {
                    fs.unlink(req.file.path, (err) => {
                        if (err) console.error('Erro ao deletar arquivo:', err);
                    });
                }
                return res.status(404).json({ erro: 'Patrimônio não encontrado.' });
            }

            // Monta o caminho da imagem se foi feito upload
            let caminhoImagem = null;
            if (req.file) {
                caminhoImagem = `/imagens/${req.file.filename}`;

                // Se já existia uma imagem antiga atrelada a este patrimônio, deleta ela do disco
                if (existente.caminho_imagem) {
                    const caminhoAntigoLocal = path.join(process.cwd(), 'uploads', existente.caminho_imagem.replace('/imagens/', ''));
                    fs.unlink(caminhoAntigoLocal, (err) => {
                        if (err) console.error('Erro ao deletar imagem antiga:', err);
                    });
                }
            } else {
                // Se não enviou uma nova imagem, mantém a que já estava salva no banco
                caminhoImagem = existente.caminho_imagem;
            }

            // Cria a instância editada passando o caminho da imagem atualizado
            const patrimonio = Patrimonio.editar({
                nome: nome || existente.nome,
                status: status || existente.status,
                id_sala: id_sala || existente.id_sala,
                caminho_imagem: caminhoImagem
            }, id);

            const result = await patrimonioRepository.editar(id, patrimonio);
            res.status(200).json({ result });
        } catch (error) {
            // Fallback de erro: se falhar o update na base, remove a imagem recém-enviada
            if (req.file) {
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Erro ao deletar arquivo:', err);
                });
            }
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

     selecionar: async (req, res) => {
        try {
            const result = await patrimonioRepository.selecionar();
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    selecionarPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await patrimonioRepository.selecionarPorId(id);

            if (!result) {
                return res.status(404).json({ erro: 'Patrimônio não encontrado.' });
            }

            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    selecionarPorSala: async (req, res) => {
        try {
            const { id_sala } = req.params;
            const result = await patrimonioRepository.selecionarPorSala(id_sala);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    selecionarPorBloco: async (req, res) => {
        try {
            const { bloco } = req.params;
            const result = await patrimonioRepository.selecionarPorBloco(bloco);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    },

    deletar: async (req, res) => {
        try {
            const { id } = req.params;

            const existente = await patrimonioRepository.selecionarPorId(id);
            if (!existente) {
                return res.status(404).json({ erro: 'Patrimônio não encontrado.' });
            }

            const result = await patrimonioRepository.deletar(id);
            res.status(200).json({ result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ mensagem: 'Ocorreu um erro no servidor', errorMessage: error.message });
        }
    }

};

export default patrimonioController;