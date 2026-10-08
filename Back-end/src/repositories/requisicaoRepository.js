import { connection } from '../configs/Database.js';
import { StatusRequisicao, STATUS_REQUISICAO_ABERTOS } from '../enums/statusRequisicao.js';
import { AcaoHistorico } from '../enums/acaoHistorico.js';
import { StatusPatrimonio } from '../enums/statusPatrimonio.js';

// Erro de regra de negócio: o controller converte em resposta HTTP
export class RequisicaoError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.name = 'RequisicaoError';
        this.status = status;
        this.extra = extra;
    }
}

const ABERTOS_SQL = STATUS_REQUISICAO_ABERTOS.map((s) => `'${s}'`).join(', ');

const SELECT_BASE = `
    SELECT
        r.id_requisicao, r.descricao, r.status_requisicao, r.prioridade,
        r.abertura, r.data_conclusao, r.atualizacao,
        p.id_patrimonio, p.nome AS patrimonio_nome, p.numero_patrimonio,
        p.caminho_imagem AS patrimonio_imagem, p.status AS patrimonio_status,
        s.id_sala, s.descricao AS sala_descricao, s.bloco,
        us.id_usuario AS solicitante_id, us.nome AS solicitante_nome,
        ur.id_usuario AS responsavel_id, ur.nome AS responsavel_nome
    FROM requisicoes_manutencao r
    JOIN patrimonio p ON p.id_patrimonio = r.id_patrimonio
    JOIN salas s ON s.id_sala = p.id_sala
    LEFT JOIN usuarios us ON us.id_usuario = r.id_usuario_solicitante
    LEFT JOIN usuarios ur ON ur.id_usuario = r.id_usuario_responsavel
`;

// Em aberto primeiro (mais recentes no topo); concluídas no final (conclusão mais recente primeiro)
const ORDER_BASE = `
    ORDER BY
        (r.status_requisicao = '${StatusRequisicao.CONCLUIDO}') ASC,
        CASE WHEN r.status_requisicao = '${StatusRequisicao.CONCLUIDO}'
             THEN COALESCE(r.data_conclusao, r.abertura) END DESC,
        CASE WHEN r.status_requisicao <> '${StatusRequisicao.CONCLUIDO}'
             THEN r.abertura END DESC,
        r.id_requisicao DESC
`;

const mapear = (row) => ({
    id_requisicao: row.id_requisicao,
    descricao: row.descricao,
    status_requisicao: row.status_requisicao,
    prioridade: row.prioridade,
    abertura: row.abertura,
    data_conclusao: row.data_conclusao,
    atualizacao: row.atualizacao,
    patrimonio: {
        id_patrimonio: row.id_patrimonio,
        nome: row.patrimonio_nome,
        numero_patrimonio: row.numero_patrimonio,
        caminho_imagem: row.patrimonio_imagem,
        status: row.patrimonio_status
    },
    sala: {
        id_sala: row.id_sala,
        descricao: row.sala_descricao,
        bloco: row.bloco
    },
    solicitante: row.solicitante_id ? { id_usuario: row.solicitante_id, nome: row.solicitante_nome } : null,
    responsavel: row.responsavel_id ? { id_usuario: row.responsavel_id, nome: row.responsavel_nome } : null
});

const inteiroSeguro = (valor, padrao, minimo, maximo) => {
    const n = Math.floor(Number(valor));
    if (!Number.isFinite(n)) return padrao;
    return Math.min(Math.max(n, minimo), maximo);
};

const requisicaoRepository = {

    // CRIAR: requisição + patrimônio Pendente + histórico "Abertura" (tudo ou nada)
    criar: async (requisicao) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            // Trava a linha do patrimônio: dois pedidos simultâneos ficam em fila
            const [patrimonios] = await conn.execute(
                'SELECT id_patrimonio FROM patrimonio WHERE id_patrimonio = ? FOR UPDATE',
                [requisicao.idPatrimonio]
            );
            if (patrimonios.length === 0) {
                throw new RequisicaoError(404, 'Patrimônio não encontrado.');
            }

            const [abertas] = await conn.execute(
                `SELECT id_requisicao FROM requisicoes_manutencao
                 WHERE id_patrimonio = ? AND status_requisicao IN (${ABERTOS_SQL}) LIMIT 1`,
                [requisicao.idPatrimonio]
            );
            if (abertas.length > 0) {
                throw new RequisicaoError(409, 'Este patrimônio já possui uma requisição em aberto.', {
                    id_requisicao: abertas[0].id_requisicao
                });
            }

            const [inserido] = await conn.execute(
                `INSERT INTO requisicoes_manutencao
                    (descricao, status_requisicao, prioridade, id_patrimonio, id_usuario_solicitante)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    requisicao.descricao,
                    StatusRequisicao.PENDENTE,
                    requisicao.prioridade,
                    requisicao.idPatrimonio,
                    requisicao.idUsuarioSolicitante
                ]
            );
            const idRequisicao = inserido.insertId;

            await conn.execute(
                'UPDATE patrimonio SET status = ? WHERE id_patrimonio = ?',
                [StatusPatrimonio.PENDENTE, requisicao.idPatrimonio]
            );

            await conn.execute(
                `INSERT INTO historicos_manutencao (descricao, id_requisicao, acao, id_usuario)
                 VALUES (?, ?, ?, ?)`,
                [requisicao.descricao, idRequisicao, AcaoHistorico.ABERTURA, requisicao.idUsuarioSolicitante]
            );

            await conn.commit();
            return idRequisicao;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // ASSUMIR: Pendente -> Em andamento + histórico "Andamento"
    assumir: async (idRequisicao, idUsuario) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const [linhas] = await conn.execute(
                'SELECT status_requisicao FROM requisicoes_manutencao WHERE id_requisicao = ? FOR UPDATE',
                [idRequisicao]
            );
            if (linhas.length === 0) {
                throw new RequisicaoError(404, 'Requisição não encontrada.');
            }
            const status = linhas[0].status_requisicao;
            if (status === StatusRequisicao.EM_ANDAMENTO) {
                throw new RequisicaoError(409, 'Esta requisição já está em andamento.');
            }
            if (status === StatusRequisicao.CONCLUIDO) {
                throw new RequisicaoError(409, 'Esta requisição já foi concluída.');
            }

            await conn.execute(
                `UPDATE requisicoes_manutencao
                 SET status_requisicao = ?, id_usuario_responsavel = ?
                 WHERE id_requisicao = ?`,
                [StatusRequisicao.EM_ANDAMENTO, idUsuario, idRequisicao]
            );

            await conn.execute(
                `INSERT INTO historicos_manutencao (descricao, id_requisicao, acao, id_usuario)
                 VALUES (?, ?, ?, ?)`,
                ['Requisição assumida pela manutenção.', idRequisicao, AcaoHistorico.ANDAMENTO, idUsuario]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // CONCLUIR: Concluído + patrimônio Ok + histórico "Finalizacao"
    concluir: async (idRequisicao, idUsuario, observacao) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const [linhas] = await conn.execute(
                `SELECT status_requisicao, id_patrimonio
                 FROM requisicoes_manutencao WHERE id_requisicao = ? FOR UPDATE`,
                [idRequisicao]
            );
            if (linhas.length === 0) {
                throw new RequisicaoError(404, 'Requisição não encontrada.');
            }
            if (linhas[0].status_requisicao === StatusRequisicao.CONCLUIDO) {
                throw new RequisicaoError(409, 'Esta requisição já foi concluída.');
            }
            const idPatrimonio = linhas[0].id_patrimonio;

            await conn.execute(
                `UPDATE requisicoes_manutencao
                 SET status_requisicao = ?, data_conclusao = NOW(),
                     id_usuario_responsavel = COALESCE(id_usuario_responsavel, ?)
                 WHERE id_requisicao = ?`,
                [StatusRequisicao.CONCLUIDO, idUsuario, idRequisicao]
            );

            await conn.execute(
                'UPDATE patrimonio SET status = ? WHERE id_patrimonio = ?',
                [StatusPatrimonio.OK, idPatrimonio]
            );

            await conn.execute(
                `INSERT INTO historicos_manutencao (descricao, id_requisicao, acao, id_usuario)
                 VALUES (?, ?, ?, ?)`,
                [observacao, idRequisicao, AcaoHistorico.FINALIZACAO, idUsuario]
            );

            await conn.commit();
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // DETALHE: requisição + linha do tempo (ordem cronológica)
    buscarPorId: async (id) => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute(`${SELECT_BASE} WHERE r.id_requisicao = ?`, [id]);
            if (rows.length === 0) return null;

            const [eventos] = await conn.execute(
                `SELECT h.id_historico, h.acao, h.descricao, h.horario,
                        u.id_usuario, u.nome AS usuario_nome
                 FROM historicos_manutencao h
                 LEFT JOIN usuarios u ON u.id_usuario = h.id_usuario
                 WHERE h.id_requisicao = ?
                 ORDER BY h.horario ASC, h.id_historico ASC`,
                [id]
            );

            return {
                ...mapear(rows[0]),
                historico: eventos.map((e) => ({
                    id_historico: e.id_historico,
                    acao: e.acao,
                    descricao: e.descricao,
                    horario: e.horario,
                    usuario: e.id_usuario ? { id_usuario: e.id_usuario, nome: e.usuario_nome } : null
                }))
            };
        } finally {
            conn.release();
        }
    },

    // MINHAS: requisições abertas pelo usuário (já ordenadas)
    listarMinhas: async (idUsuario) => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute(
                `${SELECT_BASE} WHERE r.id_usuario_solicitante = ? ${ORDER_BASE}`,
                [idUsuario]
            );
            return rows.map(mapear);
        } finally {
            conn.release();
        }
    },

    // TODAS (manutenção e administração): filtros + paginação
    listarTodas: async ({ status, idSala, prioridade, pagina, limite } = {}) => {
        const conn = await connection.getConnection();
        try {
            const where = [];
            const params = [];

            if (status) { where.push('r.status_requisicao = ?'); params.push(status); }
            if (idSala) { where.push('s.id_sala = ?'); params.push(idSala); }
            if (prioridade) { where.push('r.prioridade = ?'); params.push(prioridade); }

            const clausulaWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
            const limiteSeguro = inteiroSeguro(limite, 10, 1, 50);
            const paginaSegura = inteiroSeguro(pagina, 1, 1, 1000000);
            const offset = (paginaSegura - 1) * limiteSeguro;

            const [[{ total }]] = await conn.execute(
                `SELECT COUNT(*) AS total
                 FROM requisicoes_manutencao r
                 JOIN patrimonio p ON p.id_patrimonio = r.id_patrimonio
                 JOIN salas s ON s.id_sala = p.id_sala
                 ${clausulaWhere}`,
                params
            );

            const [rows] = await conn.execute(
                `${SELECT_BASE} ${clausulaWhere} ${ORDER_BASE} LIMIT ${limiteSeguro} OFFSET ${offset}`,
                params
            );

            return { result: rows.map(mapear), total: Number(total), pagina: paginaSegura, limite: limiteSeguro };
        } finally {
            conn.release();
        }
    },

    // REQUISIÇÃO EM ABERTO DE UM PATRIMÔNIO
    buscarAbertaPorPatrimonio: async (idPatrimonio) => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute(
                `${SELECT_BASE}
                 WHERE r.id_patrimonio = ? AND r.status_requisicao IN (${ABERTOS_SQL})
                 ORDER BY r.abertura DESC, r.id_requisicao DESC LIMIT 1`,
                [idPatrimonio]
            );
            return rows.length ? mapear(rows[0]) : null;
        } finally {
            conn.release();
        }
    },

    // MURAL: até 3 eventos dos últimos 7 dias das requisições do usuário
    listarAtualizacoes: async (idUsuario) => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute(
                `SELECT
                    h.id_historico, h.acao, h.descricao AS historico_descricao, h.horario,
                    r.id_requisicao, r.descricao, r.status_requisicao, r.prioridade,
                    r.abertura, r.data_conclusao, r.atualizacao,
                    p.id_patrimonio, p.nome AS patrimonio_nome, p.numero_patrimonio,
                    p.caminho_imagem AS patrimonio_imagem, p.status AS patrimonio_status,
                    s.id_sala, s.descricao AS sala_descricao, s.bloco,
                    us.id_usuario AS solicitante_id, us.nome AS solicitante_nome,
                    ur.id_usuario AS responsavel_id, ur.nome AS responsavel_nome
                 FROM historicos_manutencao h
                 JOIN requisicoes_manutencao r ON r.id_requisicao = h.id_requisicao
                 JOIN patrimonio p ON p.id_patrimonio = r.id_patrimonio
                 JOIN salas s ON s.id_sala = p.id_sala
                 LEFT JOIN usuarios us ON us.id_usuario = r.id_usuario_solicitante
                 LEFT JOIN usuarios ur ON ur.id_usuario = r.id_usuario_responsavel
                 WHERE r.id_usuario_solicitante = ?
                   AND h.horario >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                 ORDER BY h.horario DESC, h.id_historico DESC
                 LIMIT 3`,
                [idUsuario]
            );

            return rows.map((row) => ({
                id_historico: row.id_historico,
                acao: row.acao,
                descricao: row.historico_descricao,
                horario: row.horario,
                requisicao: mapear(row)
            }));
        } finally {
            conn.release();
        }
    }
};

export default requisicaoRepository;
