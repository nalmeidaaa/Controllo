import { connection } from "../configs/Database.js";

const requisicaoRepository = {

    listarHistorico: async () => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    rm.id_requisicao,
                    s.descricao AS sala,
                    p.nome AS patrimonio,
                    rm.descricao,
                    rm.status_requisicao AS status,
                    rm.prioridade,
                    rm.abertura,
                    hm.fechamento
                FROM requisicoes_manutencao rm
                INNER JOIN patrimonio p
                    ON p.id_patrimonio = rm.id_patrimonio
                INNER JOIN salas s
                    ON s.id_sala = p.id_sala
                LEFT JOIN historicos_manutencao hm
                    ON hm.id_requisicao = rm.id_requisicao
                ORDER BY rm.abertura DESC
            `;

            const [rows] = await conn.execute(sql);
            return rows;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }

};

export default requisicaoRepository;