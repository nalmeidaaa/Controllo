import { connection } from '../configs/Database.js';

const SELECT_EVENTO = `
    SELECT
        h.id_historico, h.acao, h.descricao, h.horario,
        ua.id_usuario AS autor_id, ua.nome AS autor_nome,
        r.id_requisicao, r.descricao AS requisicao_descricao, r.status_requisicao, r.prioridade,
        r.abertura, r.data_conclusao,
        p.id_patrimonio, p.nome AS patrimonio_nome, p.numero_patrimonio,
        s.id_sala, s.descricao AS sala_descricao, s.bloco,
        us.id_usuario AS solicitante_id, us.nome AS solicitante_nome,
        ur.id_usuario AS responsavel_id, ur.nome AS responsavel_nome
    FROM historicos_manutencao h
    JOIN requisicoes_manutencao r ON r.id_requisicao = h.id_requisicao
    JOIN patrimonio p ON p.id_patrimonio = r.id_patrimonio
    JOIN salas s ON s.id_sala = p.id_sala
    LEFT JOIN usuarios ua ON ua.id_usuario = h.id_usuario
    LEFT JOIN usuarios us ON us.id_usuario = r.id_usuario_solicitante
    LEFT JOIN usuarios ur ON ur.id_usuario = r.id_usuario_responsavel
`;

const usuarioOuNulo = (id, nome) => (id ? { id_usuario: id, nome } : null);

const mapearResumoRequisicao = (row) => ({
    id_requisicao: row.id_requisicao,
    descricao: row.requisicao_descricao,
    status_requisicao: row.status_requisicao,
    prioridade: row.prioridade,
    abertura: row.abertura,
    data_conclusao: row.data_conclusao
});

const mapearEvento = (row) => ({
    id_historico: row.id_historico,
    acao: row.acao,
    descricao: row.descricao,
    horario: row.horario,
    usuario_acao: usuarioOuNulo(row.autor_id, row.autor_nome),
    requisicao: mapearResumoRequisicao(row),
    patrimonio: {
        id_patrimonio: row.id_patrimonio,
        nome: row.patrimonio_nome,
        numero_patrimonio: row.numero_patrimonio
    },
    sala: {
        id_sala: row.id_sala,
        descricao: row.sala_descricao,
        bloco: row.bloco
    },
    solicitante: usuarioOuNulo(row.solicitante_id, row.solicitante_nome),
    responsavel: usuarioOuNulo(row.responsavel_id, row.responsavel_nome)
});

const inteiroSeguro = (valor, padrao, minimo, maximo) => {
    const n = Math.floor(Number(valor));
    if (!Number.isFinite(n)) return padrao;
    return Math.min(Math.max(n, minimo), maximo);
};

const historicoRepository = {

    // Lista de eventos com filtros opcionais e paginação (mais recentes primeiro)
    listar: async ({ acao, de, ate, idSala, idPatrimonio, idSolicitante, idResponsavel, pagina, limite } = {}) => {
        const conn = await connection.getConnection();
        try {
            const where = [];
            const params = [];

            if (acao) { where.push('h.acao = ?'); params.push(acao); }
            if (de) { where.push('h.horario >= STR_TO_DATE(?, \'%Y-%m-%d\')'); params.push(de); }
            // "até" é inclusivo: vai até o fim do dia informado
            if (ate) { where.push('h.horario < DATE_ADD(STR_TO_DATE(?, \'%Y-%m-%d\'), INTERVAL 1 DAY)'); params.push(ate); }
            if (idSala) { where.push('s.id_sala = ?'); params.push(idSala); }
            if (idPatrimonio) { where.push('p.id_patrimonio = ?'); params.push(idPatrimonio); }
            if (idSolicitante) { where.push('r.id_usuario_solicitante = ?'); params.push(idSolicitante); }
            if (idResponsavel) { where.push('r.id_usuario_responsavel = ?'); params.push(idResponsavel); }

            const clausulaWhere = where.length ? `WHERE ${where.join(' AND ')}` : '';
            const limiteSeguro = inteiroSeguro(limite, 10, 1, 50);
            const paginaSegura = inteiroSeguro(pagina, 1, 1, 1000000);
            const offset = (paginaSegura - 1) * limiteSeguro;

            const [[{ total }]] = await conn.execute(
                `SELECT COUNT(*) AS total
                 FROM historicos_manutencao h
                 JOIN requisicoes_manutencao r ON r.id_requisicao = h.id_requisicao
                 JOIN patrimonio p ON p.id_patrimonio = r.id_patrimonio
                 JOIN salas s ON s.id_sala = p.id_sala
                 ${clausulaWhere}`,
                params
            );

            const [rows] = await conn.execute(
                `${SELECT_EVENTO} ${clausulaWhere}
                 ORDER BY h.horario DESC, h.id_historico DESC
                 LIMIT ${limiteSeguro} OFFSET ${offset}`,
                params
            );

            return { result: rows.map(mapearEvento), total: Number(total), pagina: paginaSegura, limite: limiteSeguro };
        } finally {
            conn.release();
        }
    },

    // Linha do tempo completa de uma requisição (ordem cronológica)
    listarPorRequisicao: async (idRequisicao) => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute(
                `${SELECT_EVENTO}
                 WHERE h.id_requisicao = ?
                 ORDER BY h.horario ASC, h.id_historico ASC`,
                [idRequisicao]
            );

            if (rows.length > 0) {
                const primeira = rows[0];
                return {
                    requisicao: {
                        ...mapearResumoRequisicao(primeira),
                        patrimonio: {
                            id_patrimonio: primeira.id_patrimonio,
                            nome: primeira.patrimonio_nome,
                            numero_patrimonio: primeira.numero_patrimonio
                        },
                        sala: {
                            id_sala: primeira.id_sala,
                            descricao: primeira.sala_descricao,
                            bloco: primeira.bloco
                        },
                        solicitante: usuarioOuNulo(primeira.solicitante_id, primeira.solicitante_nome),
                        responsavel: usuarioOuNulo(primeira.responsavel_id, primeira.responsavel_nome)
                    },
                    eventos: rows.map((row) => ({
                        id_historico: row.id_historico,
                        acao: row.acao,
                        descricao: row.descricao,
                        horario: row.horario,
                        usuario_acao: usuarioOuNulo(row.autor_id, row.autor_nome)
                    }))
                };
            }

            // Requisição inexistente (ou sem eventos registrados)
            return null;
        } finally {
            conn.release();
        }
    }
};

export default historicoRepository;
