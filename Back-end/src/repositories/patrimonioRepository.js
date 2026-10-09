import { connection } from "../configs/Database.js";

const patrimonioRepository = {

    // ============================================================
    // CRIAR PATRIMÔNIO
    // ============================================================
    criar: async (patrimonio) => {
        const conn = await connection.getConnection();

        try {
            // Adicionado o campo caminho_imagem na query e nos valores
            const sql = `
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

            const values = [
                patrimonio.nome,
                patrimonio.status,
                patrimonio.idSala,
                patrimonio.caminhoImagem,
                patrimonio.numero_patrimonio
            ];

            console.log(values);

            const [result] = await conn.execute(sql, values);

            return result;

        } catch (error) {
            throw error;

        } finally {
            conn.release();
        }
    },


    // ============================================================
    // SELECIONAR TODOS OS PATRIMÔNIOS
    // ============================================================
    selecionar: async () => {
        const conn = await connection.getConnection();

        try {
            // Especificando as colunas incluindo caminho_imagem
            const sql = `
                SELECT
                    id_patrimonio,
                    nome,
                    status,
                    id_sala,
                    caminho_imagem,
                    numero_patrimonio
                FROM patrimonio
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
    // EDITAR PATRIMÔNIO
    // ============================================================
    editar: async (id, patrimonio) => {
        const conn = await connection.getConnection();

        try {
            // Adicionado caminho_imagem = ? na query de atualização
            const sql = `
                UPDATE patrimonio
                SET
                    nome = ?,
                    status = ?,
                    id_sala = ?,
                    caminho_imagem = ?,
                    numero_patrimonio = ?
                WHERE id_patrimonio = ?
            `;

            const values = [
                patrimonio.nome,
                patrimonio.status,
                patrimonio.idSala,
                patrimonio.caminhoImagem,
                patrimonio.numero_patrimonio,
                id
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
    // DELETAR PATRIMÔNIO
    // ============================================================
    deletar: async (id) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                DELETE FROM patrimonio
                WHERE id_patrimonio = ?
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
    // SELECIONAR PATRIMÔNIO POR ID
    // ============================================================
    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();

        try {
            // Garante o retorno explícito do caminho_imagem para o Controller validar a exclusão de arquivos antigos
            const sql = `
                SELECT
                    id_patrimonio,
                    nome,
                    status,
                    id_sala,
                    caminho_imagem,
                    numero_patrimonio
                FROM patrimonio
                WHERE id_patrimonio = ?
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
    // SELECIONAR PATRIMÔNIOS POR SALA
    // ============================================================
    selecionarPorSala: async (id_sala) => {
        const conn = await connection.getConnection();

        try {
            const sql = `
                SELECT
                    id_patrimonio,
                    nome,
                    status,
                    id_sala,
                    caminho_imagem,
                    numero_patrimonio
                FROM patrimonio
                WHERE id_sala = ?
            `;

            const [rows] = await conn.execute(sql, [id_sala]);

            return rows;

        } catch (error) {
            throw error;

        } finally {
            conn.release();
        }
    },


    // ============================================================
    // SELECIONAR PATRIMÔNIOS POR BLOCO
    // ============================================================
    selecionarPorBloco: async (bloco) => {
        const conn = await connection.getConnection();

        try {
            // Trazendo explicitamente a imagem do patrimônio no JOIN
            const sql = `
                SELECT
                    p.id_patrimonio,
                    p.nome,
                    p.status,
                    p.id_sala,
                    p.caminho_imagem,
                    p.numero_patrimonio
                FROM patrimonio p
                JOIN salas s
                    ON p.id_sala = s.id_sala
                WHERE s.bloco = ?
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
    // TRANSFERIR PATRIMÔNIO
    // ============================================================
    transferir: async (
        idPatrimonio,
        idSalaDestino
    ) => {

        const conn = await connection.getConnection();

        try {

            await conn.beginTransaction();

            // ----------------------------------------------------
            // Busca a sala atual do patrimônio
            // ----------------------------------------------------
            const sqlPatrimonio = `
                SELECT
                    id_patrimonio,
                    id_sala
                FROM patrimonio
                WHERE id_patrimonio = ?
                FOR UPDATE
            `;

            const [patrimonios] = await conn.execute(
                sqlPatrimonio,
                [idPatrimonio]
            );

            if (patrimonios.length === 0) {
                throw new Error(
                    "Patrimônio não encontrado."
                );
            }

            const patrimonio = patrimonios[0];

            const idSalaOrigem = patrimonio.id_sala;

            // ----------------------------------------------------
            // Verifica se está tentando transferir para a
            // mesma sala
            // ----------------------------------------------------
            if (
                String(idSalaOrigem) ===
                String(idSalaDestino)
            ) {
                throw new Error(
                    "O patrimônio já está nesta sala."
                );
            }

            // ----------------------------------------------------
            // Busca os dados da sala de origem
            // ----------------------------------------------------
            const sqlSalaOrigem = `
                SELECT
                    id_sala,
                    descricao,
                    bloco
                FROM salas
                WHERE id_sala = ?
            `;

            const [salasOrigem] = await conn.execute(
                sqlSalaOrigem,
                [idSalaOrigem]
            );

            if (salasOrigem.length === 0) {
                throw new Error(
                    "Sala de origem não encontrada."
                );
            }

            const salaOrigem = salasOrigem[0];

            // ----------------------------------------------------
            // Busca os dados da sala de destino
            // ----------------------------------------------------
            const sqlSalaDestino = `
                SELECT
                    id_sala,
                    descricao,
                    bloco
                FROM salas
                WHERE id_sala = ?
            `;

            const [salasDestino] = await conn.execute(
                sqlSalaDestino,
                [idSalaDestino]
            );

            if (salasDestino.length === 0) {
                throw new Error(
                    "Sala de destino não encontrada."
                );
            }

            const salaDestino = salasDestino[0];

            // ----------------------------------------------------
            // Atualiza a sala do patrimônio
            // ----------------------------------------------------
            const sqlAtualizar = `
                UPDATE patrimonio
                SET id_sala = ?
                WHERE id_patrimonio = ?
            `;

            await conn.execute(
                sqlAtualizar,
                [
                    idSalaDestino,
                    idPatrimonio
                ]
            );

            // ----------------------------------------------------
            // Registra o histórico da transferência
            // ----------------------------------------------------
            const sqlHistorico = `
                INSERT INTO historico_transferencias
                (
                    id_patrimonio,
                    sala_origem,
                    sala_destino,
                    bloco_origem,
                    bloco_destino,
                    data_transferencia
                )
                VALUES (?, ?, ?, ?, ?, NOW())
            `;

            await conn.execute(
                sqlHistorico,
                [
                    idPatrimonio,
                    idSalaOrigem,
                    idSalaDestino,
                    salaOrigem.bloco,
                    salaDestino.bloco
                ]
            );

            // ----------------------------------------------------
            // Confirma a transação
            // ----------------------------------------------------
            await conn.commit();

            return {
                id_patrimonio: idPatrimonio,
                sala_origem: idSalaOrigem,
                sala_destino: idSalaDestino,
                bloco_origem: salaOrigem.bloco,
                bloco_destino: salaDestino.bloco
            };

        } catch (error) {

            // ----------------------------------------------------
            // Desfaz tudo se alguma operação falhar
            // ----------------------------------------------------
            await conn.rollback();

            throw error;

        } finally {

            conn.release();

        }
    },


    // ============================================================
    // HISTÓRICO DE TRANSFERÊNCIAS
    // ============================================================
    selecionarHistoricoTransferencias: async (
        idPatrimonio
    ) => {

        const conn = await connection.getConnection();

        try {

            const sql = `
                SELECT
                    ht.id_transferencia,
                    ht.id_patrimonio,
                    ht.sala_origem,
                    ht.sala_destino,
                    ht.bloco_origem,
                    ht.bloco_destino,
                    ht.data_transferencia,

                    so.descricao AS descricao_sala_origem,
                    sd.descricao AS descricao_sala_destino

                FROM historico_transferencias ht

                LEFT JOIN salas so
                    ON ht.sala_origem = so.id_sala

                LEFT JOIN salas sd
                    ON ht.sala_destino = sd.id_sala

                WHERE ht.id_patrimonio = ?

                ORDER BY
                    ht.data_transferencia DESC
            `;

            const [rows] = await conn.execute(
                sql,
                [idPatrimonio]
            );

            return rows;

        } catch (error) {

            throw error;

        } finally {

            conn.release();

        }
    }

};

export default patrimonioRepository;