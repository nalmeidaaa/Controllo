import historicoRepository from '../repositories/historicoRepository.js';
import { AcaoHistorico } from '../enums/acaoHistorico.js';

const semAcento = (texto) =>
    String(texto).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const idValido = (valor) => {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

// Data no formato AAAA-MM-DD e que realmente existe no calendário
const dataValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const data = new Date(`${valor}T00:00:00Z`);
    return !Number.isNaN(data.getTime()) && data.toISOString().slice(0, 10) === valor;
};

const responderErro = (res, error) => {
    console.error('ERRO NO HISTÓRICO:', error);
    return res.status(500).json({ message: 'Ocorreu um erro no servidor.', error: error.message });
};

const historicoController = {

    listar: async (req, res) => {
        try {
            const { acao, de, ate, id_sala, id_patrimonio, id_solicitante, id_responsavel, pagina, limite } = req.query;

            // Aceita "finalizacao", "Finalização", "ABERTURA"...
            let acaoNormalizada = null;
            if (acao) {
                acaoNormalizada = Object.values(AcaoHistorico).find((a) => semAcento(a) === semAcento(acao)) ?? null;
                if (!acaoNormalizada) {
                    return res.status(400).json({ message: 'Ação inválida. Valores permitidos: Abertura, Andamento e Finalizacao.', campo: 'acao' });
                }
            }

            if (de && !dataValida(de)) {
                return res.status(400).json({ message: 'Data inicial inválida. Use o formato AAAA-MM-DD.', campo: 'de' });
            }
            if (ate && !dataValida(ate)) {
                return res.status(400).json({ message: 'Data final inválida. Use o formato AAAA-MM-DD.', campo: 'ate' });
            }
            if (de && ate && de > ate) {
                return res.status(400).json({ message: 'A data inicial não pode ser maior que a data final.', campo: 'de' });
            }

            const filtrosNumericos = { id_sala, id_patrimonio, id_solicitante, id_responsavel };
            for (const [campo, valor] of Object.entries(filtrosNumericos)) {
                if (valor && !idValido(valor)) {
                    return res.status(400).json({ message: `Filtro inválido: ${campo}.`, campo });
                }
            }

            const resultado = await historicoRepository.listar({
                acao: acaoNormalizada,
                de: de || null,
                ate: ate || null,
                idSala: id_sala ? Number(id_sala) : null,
                idPatrimonio: id_patrimonio ? Number(id_patrimonio) : null,
                idSolicitante: id_solicitante ? Number(id_solicitante) : null,
                idResponsavel: id_responsavel ? Number(id_responsavel) : null,
                pagina,
                limite
            });

            return res.status(200).json(resultado);
        } catch (error) {
            return responderErro(res, error);
        }
    },

    listarPorRequisicao: async (req, res) => {
        try {
            const id = idValido(req.params.id_requisicao);
            if (!id) {
                return res.status(400).json({ message: 'Requisição informada é inválida.' });
            }

            const result = await historicoRepository.listarPorRequisicao(id);
            if (!result) {
                return res.status(404).json({ message: 'Requisição não encontrada.' });
            }

            return res.status(200).json({ result });
        } catch (error) {
            return responderErro(res, error);
        }
    }
};

export default historicoController;
