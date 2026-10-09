
import { connection } from '../configs/Database.js';

const salaRepository = {

    // ============================================================
    // CRIAR SALA
    // ============================================================

    criar: async (sala) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                INSERT INTO salas
                (descricao, bloco, caminho_imagem)
                VALUES (?, ?, ?)
            `;

            const values = [
                sala.descricao ?? null,
                sala.bloco ?? null,
                sala.caminhoImagem ?? sala.caminho_imagem ?? null
            ];

            const [result] = await conn.execute(sql, values);

            return result;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // LISTAR SALAS ATIVADAS
    // ============================================================

    selecionar: async () => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    id_sala,
                    descricao,
                    bloco,
                    status,
                    caminho_imagem
                FROM salas
                WHERE status = 'ativo'
                ORDER BY bloco, descricao
            `;

            const [rows] = await conn.execute(sql);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // LISTAR SALAS DESATIVADAS
    // ============================================================

    selecionarDesativadas: async () => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    id_sala,
                    descricao,
                    bloco,
                    status,
                    caminho_imagem
                FROM salas
                WHERE status = 'inativo'
                ORDER BY bloco, descricao
            `;

            const [rows] = await conn.execute(sql);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // BUSCAR SALA POR ID
    // ============================================================

    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    id_sala,
                    descricao,
                    bloco,
                    status,
                    caminho_imagem
                FROM salas
                WHERE id_sala = ?
            `;

            const [rows] = await conn.execute(sql, [id]);

            return rows[0] ?? null;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // BUSCAR SALAS POR BLOCO
    // ============================================================

    selecionarPorBloco: async (bloco) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    id_sala,
                    descricao,
                    bloco,
                    status,
                    caminho_imagem
                FROM salas
                WHERE bloco = ?
                ORDER BY descricao
            `;

            const [rows] = await conn.execute(sql, [bloco]);

            return rows;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // EDITAR SALA
    // ============================================================

    editar: async (id, sala) => {
        const conn = await connection.getConnection();

        try {
            let sql = 'UPDATE salas SET ';
            const values = [];

            if (
                sala.descricao !== null &&
                sala.descricao !== undefined
            ) {
                sql += 'descricao = ?, ';
                values.push(sala.descricao);
            }

            if (
                sala.bloco !== null &&
                sala.bloco !== undefined
            ) {
                sql += 'bloco = ?, ';
                values.push(sala.bloco);
            }

            const img =
                sala.caminhoImagem ??
                sala.caminho_imagem;

            if (img !== null && img !== undefined) {
                sql += 'caminho_imagem = ?, ';
                values.push(img);
            }

            if (values.length === 0) {
                throw new Error(
                    'Nenhum campo fornecido para atualização.'
                );
            }

            sql = sql.trimEnd().slice(0, -1);
            sql += ' WHERE id_sala = ?';

            values.push(id);

            const [result] = await conn.execute(sql, values);

            return result;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // DESATIVAR SALA
    // ============================================================

    desativar: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                UPDATE salas
                SET status = 'inativo'
                WHERE id_sala = ?
            `;

            const [result] = await conn.execute(sql, [id]);

            return result;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // REATIVAR SALA
    // ============================================================

    ativar: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                UPDATE salas
                SET status = 'ativo'
                WHERE id_sala = ?
            `;

            const [result] = await conn.execute(sql, [id]);

            return result;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // EXCLUIR SALA
    // ============================================================

    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                DELETE FROM salas
                WHERE id_sala = ?
            `;

            const [result] = await conn.execute(sql, [id]);

            return result;

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // CRIAR SALA COM PATRIMÔNIOS
    // ============================================================

    criarComPatrimonios: async (
        sala,
        instanciasPatrimonio
    ) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Cria a sala.
            const sqlSala = `
                INSERT INTO salas
                (descricao, bloco, caminho_imagem)
                VALUES (?, ?, ?)
            `;

            const valuesSala = [
                sala.descricao ?? null,
                sala.bloco ?? null,
                sala.caminhoImagem ??
                    sala.caminho_imagem ??
                    null
            ];

            const [resultSala] = await conn.execute(
                sqlSala,
                valuesSala
            );

            const idSala = resultSala.insertId;

            // Cria os patrimônios vinculados à sala.
            const patrimoniosCriados = [];

            if (
                instanciasPatrimonio &&
                instanciasPatrimonio.length > 0
            ) {
                for (const p of instanciasPatrimonio) {
                    const sqlPatrimonio = `
                        INSERT INTO patrimonio
                        (
                            nome,
                            status,
                            id_sala,
                            caminho_imagem,
                            numero_patrimonio
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    const fotoPatrimonio =
                        p.caminhoImagem ??
                        p.caminho_imagem ??
                        null;

                    const valuesPatrimonio = [
                        p.nome ?? null,
                        p.status ?? 'Ok',
                        idSala,
                        fotoPatrimonio,
                        p.numero_patrimonio ?? null
                    ];

                    const [resultPatr] = await conn.execute(
                        sqlPatrimonio,
                        valuesPatrimonio
                    );

                    patrimoniosCriados.push({
                        id_patrimonio: resultPatr.insertId,
                        nome: p.nome ?? null,
                        status: p.status ?? 'Ok',
                        id_sala: idSala,
                        caminho_imagem: fotoPatrimonio,
                        numero_patrimonio:
                            p.numero_patrimonio ?? null
                    });
                }
            }

            await conn.commit();

            return {
                id_sala: idSala,
                patrimonios: patrimoniosCriados
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // EDITAR SALA E SEUS PATRIMÔNIOS
    // ============================================================

    editarComPatrimonios: async (
        id,
        sala,
        patrimoniosNovos
    ) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            // Atualiza os dados da sala.
            let sql = 'UPDATE salas SET ';
            const values = [];

            if (
                sala.descricao !== null &&
                sala.descricao !== undefined
            ) {
                sql += 'descricao = ?, ';
                values.push(sala.descricao);
            }

            if (
                sala.bloco !== null &&
                sala.bloco !== undefined
            ) {
                sql += 'bloco = ?, ';
                values.push(sala.bloco);
            }

            const img =
                sala.caminhoImagem ??
                sala.caminho_imagem;

            if (img !== null && img !== undefined) {
                sql += 'caminho_imagem = ?, ';
                values.push(img);
            }

            if (values.length > 0) {
                sql = sql.trimEnd().slice(0, -1);
                sql += ' WHERE id_sala = ?';

                values.push(id);

                await conn.execute(sql, values);
            }

            let patrimoniosParaDeletar = [];

            if (
                patrimoniosNovos !== null &&
                patrimoniosNovos !== undefined
            ) {
                // Identifica os patrimônios enviados pelo formulário.
                const idsEnviados = patrimoniosNovos
                    .map(p => p.id ?? p.id_patrimonio)
                    .filter(Boolean);

                // Busca os patrimônios que já pertencem à sala.
                const [antigos] = await conn.execute(
                    `
                        SELECT
                            id_patrimonio,
                            caminho_imagem
                        FROM patrimonio
                        WHERE id_sala = ?
                    `,
                    [id]
                );

                // Identifica patrimônios removidos do formulário.
                patrimoniosParaDeletar = antigos.filter(
                    p => !idsEnviados.includes(p.id_patrimonio)
                );

                // Exclui os patrimônios removidos.
                if (patrimoniosParaDeletar.length > 0) {
                    const idsDeletar = patrimoniosParaDeletar.map(
                        p => p.id_patrimonio
                    );

                    await conn.execute(
                        `
                            DELETE FROM patrimonio
                            WHERE id_patrimonio IN (
                                ${idsDeletar.map(() => '?').join(',')}
                            )
                        `,
                        idsDeletar
                    );
                }

                // Busca os patrimônios que possuem requisições
                // de manutenção pendentes ou em andamento.
                const [comRequisicaoAberta] = await conn.execute(
                    `
                        SELECT DISTINCT r.id_patrimonio
                        FROM requisicoes_manutencao r
                        JOIN patrimonio p
                            ON p.id_patrimonio = r.id_patrimonio
                        WHERE p.id_sala = ?
                          AND r.status_requisicao
                              IN ('Pendente', 'Em andamento')
                    `,
                    [id]
                );

                const idsComRequisicaoAberta = new Set(
                    comRequisicaoAberta.map(
                        r => String(r.id_patrimonio)
                    )
                );

                // Atualiza os patrimônios existentes ou cria novos.
                for (const p of patrimoniosNovos) {
                    const idPatr =
                        p.id ?? p.id_patrimonio;

                    const fotoPatrimonio =
                        p.caminhoImagem ??
                        p.caminho_imagem ??
                        null;

                    if (idPatr) {
                        if (
                            idsComRequisicaoAberta.has(
                                String(idPatr)
                            )
                        ) {
                            // Se houver manutenção em aberto,
                            // não altera o status do patrimônio.
                            const sqlUpdate = `
                                UPDATE patrimonio
                                SET
                                    nome = ?,
                                    caminho_imagem = ?,
                                    numero_patrimonio = ?
                                WHERE
                                    id_patrimonio = ?
                                    AND id_sala = ?
                            `;

                            await conn.execute(sqlUpdate, [
                                p.nome ?? null,
                                fotoPatrimonio,
                                p.numero_patrimonio ?? null,
                                idPatr,
                                id
                            ]);

                        } else {
                            // Sem manutenção em aberto, atualiza os campos.
                            // Se o status não vier no formulário,
                            // mantém o status que já está no banco.
                            const sqlUpdate = `
                                UPDATE patrimonio
                                SET
                                    nome = ?,
                                    status = COALESCE(?, status),
                                    caminho_imagem = ?,
                                    numero_patrimonio = ?
                                WHERE
                                    id_patrimonio = ?
                                    AND id_sala = ?
                            `;

                            await conn.execute(sqlUpdate, [
                                p.nome ?? null,
                                p.status ?? null,
                                fotoPatrimonio,
                                p.numero_patrimonio ?? null,
                                idPatr,
                                id
                            ]);
                        }

                    } else {
                        // Cria um patrimônio novo.
                        const sqlInsert = `
                            INSERT INTO patrimonio
                            (
                                nome,
                                status,
                                id_sala,
                                caminho_imagem,
                                numero_patrimonio
                            )
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        await conn.execute(sqlInsert, [
                            p.nome ?? null,
                            p.status ?? 'Ok',
                            id,
                            fotoPatrimonio,
                            p.numero_patrimonio ?? null
                        ]);
                    }
                }
            }

            await conn.commit();

            return {
                patrimoniosParaDeletar
            };

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // EXCLUIR SALA E SEUS PATRIMÔNIOS
    // ============================================================

    deletarComPatrimonios: async (id) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                'DELETE FROM patrimonio WHERE id_sala = ?',
                [id]
            );

            const [result] = await conn.execute(
                'DELETE FROM salas WHERE id_sala = ?',
                [id]
            );

            await conn.commit();

            return result;

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },


    // ============================================================
    // LISTAR SALA COM SEUS PATRIMÔNIOS
    // ============================================================

    listarSalaEPatrimonios: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    s.id_sala,
                    s.descricao,
                    s.bloco,
                    s.status,
                    s.caminho_imagem AS sala_imagem,

                    p.id_patrimonio,
                    p.nome AS patrimonio_nome,
                    p.status AS patrimonio_status,
                    p.caminho_imagem AS patrimonio_imagem,
                    p.numero_patrimonio AS patrimonio_numero

                FROM salas s

                LEFT JOIN patrimonio p
                    ON s.id_sala = p.id_sala

                ${
                    id
                        ? 'WHERE s.id_sala = ?'
                        : "WHERE s.status = 'ativo' ORDER BY s.bloco, s.descricao"
                }
            `;

            const [rows] = await conn.execute(
                sql,
                id ? [id] : []
            );

            const salasMap = new Map();

            for (const row of rows) {
                // Adiciona cada sala apenas uma vez.
                if (!salasMap.has(row.id_sala)) {
                    salasMap.set(row.id_sala, {
                        id_sala: row.id_sala,
                        descricao: row.descricao,
                        bloco: row.bloco,
                        status: row.status,
                        caminho_imagem: row.sala_imagem,
                        patrimonios: []
                    });
                }

                // Adiciona os patrimônios vinculados à sala.
                if (row.id_patrimonio) {
                    salasMap
                        .get(row.id_sala)
                        .patrimonios
                        .push({
                            id_patrimonio: row.id_patrimonio,
                            nome: row.patrimonio_nome,
                            status: row.patrimonio_status,
                            caminho_imagem: row.patrimonio_imagem,
                            numero_patrimonio:
                                row.patrimonio_numero
                        });
                }
            }

            return Array.from(salasMap.values());

        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }

};

export default salaRepository;