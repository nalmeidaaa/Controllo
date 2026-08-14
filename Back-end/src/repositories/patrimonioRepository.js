import { connection } from "../configs/Database.js";

const patrimonioRepository = {
    criar: async (patrimonio) => {
        const conn = await connection.getConnection();
        try {
            // Adicionado o campo caminho_imagem na query e nos valores
            const sql = `INSERT INTO patrimonio (nome, status, id_sala, caminho_imagem, numero_patrimonio) VALUES (?, ?, ?, ?, ?)`;
            const values = [patrimonio.nome, patrimonio.status, patrimonio.idSala, patrimonio.caminhoImagem, patrimonio.numero_patrimonio];
            console.log(values)
            const [result] = await conn.execute(sql, values);
            return result;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionar: async () => {
        const conn = await connection.getConnection();
        try {
            // Especificando as colunas incluindo caminho_imagem
            const sql = 'SELECT id_patrimonio, nome, status, id_sala, caminho_imagem, numero_patrimonio FROM patrimonio';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    editar: async (id, patrimonio) => {
        const conn = await connection.getConnection();
        try {
            // Adicionado caminho_imagem = ? na query de atualização
            const sql = `UPDATE patrimonio SET nome = ?, status = ?, id_sala = ?, caminho_imagem = ?, numero_patrimonio = ? WHERE id_patrimonio = ?`;
            const values = [patrimonio.nome, patrimonio.status, patrimonio.idSala, patrimonio.caminhoImagem, patrimonio.numero_patrimonio, id];
            const [result] = await conn.execute(sql, values);
            return result;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    deletar: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'DELETE FROM patrimonio WHERE id_patrimonio = ?';
            const [result] = await conn.execute(sql, [id]);
            return result;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();
        try {
            // Garante o retorno explícito do caminho_imagem para o Controller validar a exclusão de arquivos antigos
            const sql = 'SELECT id_patrimonio, nome, status, id_sala, caminho_imagem, numero_patrimonio FROM patrimonio WHERE id_patrimonio = ?';
            const [rows] = await conn.execute(sql, [id]);
            return rows[0] ?? null; 
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorSala: async (id_sala) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT id_patrimonio, nome, status, id_sala, caminho_imagem, numero_patrimonio FROM patrimonio WHERE id_sala = ?';
            const [rows] = await conn.execute(sql, [id_sala]);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorBloco: async (bloco) => {
        const conn = await connection.getConnection();
        try {
            // Trazendo explicitamente a imagem do patrimônio no JOIN
            const sql = `SELECT p.id_patrimonio, p.nome, p.status, p.id_sala, p.caminho_imagem, p.numero_patrimonio
                         FROM patrimonio p 
                         JOIN salas s ON p.id_sala = s.id_sala 
                         WHERE s.bloco = ?`;
            const [rows] = await conn.execute(sql, [bloco]);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    }
};

export default patrimonioRepository;