import { Requisicao } from '../models/Requisicao.js';
import requisicaoRepository, { RequisicaoError } from '../repositories/requisicaoRepository.js';
import { StatusRequisicao } from '../enums/statusRequisicao.js';
import { PrioridadeRequisicao } from '../enums/prioridadeRequisicao.js';
import { normalizarTipoUsuario } from '../utils/normalizarTipoUsuario.js';

const MENSAGEM_SETUP = 'Operação indisponível enquanto o sistema não tem um administrador cadastrado.';

const idValido = (valor) => {
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
};

// Converte erros de regra de negócio em resposta HTTP; o resto vira 500
const responderErro = (res, error) => {
    if (error instanceof RequisicaoError) {
        return res.status(error.status).json({ message: error.message, ...error.extra });
    }
    console.error(error);
    return res.status(500).json({ message: 'Ocorreu um erro no servidor', errorMessage: error.message });
};

const requisicaoController = {

    criar: async (req, res) => {
        try {
            // No modo de configuração inicial (sem administrador) o usuário do token é fictício (id 0)
            if (req.usuario.id === 0) {
                return res.status(403).json({ message: MENSAGEM_SETUP });
            }

            let requisicao;
            try {
                requisicao = Requisicao.criar(req.body ?? {}, req.usuario.id);
            } catch (erroValidacao) {
                return res.status(400).json({ message: erroValidacao.message });
            }

            const idRequisicao = await requisicaoRepository.criar(requisicao);
            const result = await requisicaoRepository.buscarPorId(idRequisicao);

            res.status(201).json({ message: 'Requisição criada com sucesso.', result });
        } catch (error) {
            responderErro(res, error);
        }
    },

    minhas: async (req, res) => {
        try {
            const result = await requisicaoRepository.listarMinhas(req.usuario.id);
            res.status(200).json({ result });
        } catch (error) {
            responderErro(res, error);
        }
    },

    listar: async (req, res) => {
        try {
            const { status, prioridade, id_sala, pagina, limite } = req.query;

            const statusNormalizado = Requisicao.normalizarStatus(status, Object.values(StatusRequisicao));
            if (status && !statusNormalizado) {
                return res.status(400).json({ message: 'Status inválido. Valores permitidos: Pendente, Em andamento e Concluído.' });
            }

            const prioridadeNormalizada = Requisicao.normalizarPrioridade(prioridade);
            if (prioridade && !prioridadeNormalizada) {
                return res.status(400).json({ message: `Prioridade inválida. Valores permitidos: ${Object.values(PrioridadeRequisicao).join(', ')}.` });
            }

            if (id_sala && !idValido(id_sala)) {
                return res.status(400).json({ message: 'Sala informada é inválida.' });
            }

            const resultado = await requisicaoRepository.listarTodas({
                status: statusNormalizado,
                prioridade: prioridadeNormalizada,
                idSala: id_sala ? Number(id_sala) : null,
                pagina,
                limite
            });

            res.status(200).json(resultado);
        } catch (error) {
            responderErro(res, error);
        }
    },

    atualizacoes: async (req, res) => {
        try {
            const result = await requisicaoRepository.listarAtualizacoes(req.usuario.id);
            res.status(200).json({ result });
        } catch (error) {
            responderErro(res, error);
        }
    },

    abertaPorPatrimonio: async (req, res) => {
        try {
            const idPatrimonio = idValido(req.params.id_patrimonio);
            if (!idPatrimonio) {
                return res.status(400).json({ message: 'Patrimônio informado é inválido.' });
            }

            const aberta = await requisicaoRepository.buscarAbertaPorPatrimonio(idPatrimonio);
            if (!aberta) {
                return res.status(404).json({ message: 'Este patrimônio não possui requisição em aberto.' });
            }

            // "propria" indica se a requisição foi aberta pelo usuário que está consultando
            const propria = aberta.solicitante?.id_usuario === req.usuario.id;
            res.status(200).json({ result: { ...aberta, propria } });
        } catch (error) {
            responderErro(res, error);
        }
    },

    selecionarPorId: async (req, res) => {
        try {
            const id = idValido(req.params.id);
            if (!id) {
                return res.status(400).json({ message: 'Requisição informada é inválida.' });
            }

            const result = await requisicaoRepository.buscarPorId(id);
            if (!result) {
                return res.status(404).json({ message: 'Requisição não encontrada.' });
            }

            // Usuário Geral só enxerga as próprias requisições
            const tipo = normalizarTipoUsuario(req.usuario.tipo_usuario);
            if (tipo === 'geral' && result.solicitante?.id_usuario !== req.usuario.id) {
                return res.status(404).json({ message: 'Requisição não encontrada.' });
            }

            res.status(200).json({ result });
        } catch (error) {
            responderErro(res, error);
        }
    },

    assumir: async (req, res) => {
        try {
            if (req.usuario.id === 0) {
                return res.status(403).json({ message: MENSAGEM_SETUP });
            }

            const id = idValido(req.params.id);
            if (!id) {
                return res.status(400).json({ message: 'Requisição informada é inválida.' });
            }

            await requisicaoRepository.assumir(id, req.usuario.id);
            const result = await requisicaoRepository.buscarPorId(id);

            res.status(200).json({ message: 'Requisição assumida com sucesso.', result });
        } catch (error) {
            responderErro(res, error);
        }
    },

    concluir: async (req, res) => {
        try {
            if (req.usuario.id === 0) {
                return res.status(403).json({ message: MENSAGEM_SETUP });
            }

            const id = idValido(req.params.id);
            if (!id) {
                return res.status(400).json({ message: 'Requisição informada é inválida.' });
            }

            let observacao;
            try {
                const corpo = req.body ?? {};
                observacao = Requisicao.validarObservacao(corpo.descricao ?? corpo.observacao);
            } catch (erroValidacao) {
                return res.status(400).json({ message: erroValidacao.message });
            }

            await requisicaoRepository.concluir(id, req.usuario.id, observacao);
            const result = await requisicaoRepository.buscarPorId(id);

            res.status(200).json({ message: 'Requisição concluída com sucesso.', result });
        } catch (error) {
            responderErro(res, error);
        }
    }
};

export default requisicaoController;
