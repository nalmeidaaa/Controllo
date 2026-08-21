import { connection } from "../configs/Database.js"
import { normalizarTipoUsuario } from "../utils/normalizarTipoUsuario.js";

const usuarioRepository = {

    criar: async (usuario) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            // Incluído caminho_imagem no INSERT
            const sqlInsertUser = `INSERT INTO usuarios (nome, cpf, tipo_usuario, email, hash_senha, caminho_imagem) VALUES (?, ?, ?, ?, ?, ?)`;
            const values = [usuario.nome, usuario.cpf, usuario.tipo_usuario, usuario.email, usuario.hash_senha, usuario.caminhoImagem];
            
            const [result] = await conn.execute(sqlInsertUser, values);
            const userId = result.insertId; 

            const sql = `INSERT INTO ${usuario.tipo_usuario} (id_usuario) VALUES (?)`;
            await conn.execute(sql, [userId]);
            
            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionar: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT id_usuario, nome, cpf, tipo_usuario, email, caminho_imagem FROM usuarios';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release(); // Adicionado para evitar leak de conexão
        }
    },

    editar: async (id, usuario) => {
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction();

        let sql = `UPDATE usuarios SET `;
        let values = [];

        // Atualiza o nome somente se foi enviado
        if (usuario.nome !== undefined) {
            sql += `nome = ?, `;
            values.push(usuario.nome);
        }

        // Atualiza o tipo de usuário somente se foi enviado
        if (usuario.tipo_usuario !== undefined) {
            sql += `tipo_usuario = ?, `;
            values.push(usuario.tipo_usuario);

            // Busca o tipo antigo
            const usuarioAntigo =
                await usuarioRepository.selecionarPorId(id);

            if (usuarioAntigo) {
                const tipo_usuario_antigo =
                    normalizarTipoUsuario(usuarioAntigo.tipo_usuario);

                const sqlDelete = `
                    DELETE FROM ${tipo_usuario_antigo}
                    WHERE id_usuario = ?
                `;

                await conn.execute(sqlDelete, [id]);
            }
        }

        // Atualiza CPF somente se foi enviado
        if (usuario.cpf !== undefined) {
            sql += `cpf = ?, `;
            values.push(usuario.cpf ?? null);
        }

        // Atualiza email somente se foi enviado
        if (usuario.email !== undefined) {
            sql += `email = ?, `;
            values.push(usuario.email ?? null);
        }

        // Atualiza senha somente se foi enviada
        if (usuario.hash_senha !== undefined) {
            sql += `hash_senha = ?, `;
            values.push(usuario.hash_senha);
        }

        // Atualiza imagem somente se foi enviada
        if (usuario.caminho_imagem !== undefined) {
            sql += `caminho_imagem = ?, `;
            values.push(usuario.caminho_imagem ?? null);
        }

        // Verifica se existe algum campo para atualizar
        if (values.length === 0) {
            await conn.rollback();

            return {
                affectedRows: 0,
                message: 'Nenhum dado foi informado para atualização.'
            };
        }

        // Remove a última vírgula e espaço
        sql = sql.slice(0, -2);

        sql += ` WHERE id_usuario = ?`;

        values.push(id);

        // Atualiza a tabela usuarios
        const [result] = await conn.execute(sql, values);

        // Se o tipo de usuário foi alterado,
        // adiciona na nova tabela filha
        if (usuario.tipo_usuario !== undefined) {

            const tipoUsuario =
                normalizarTipoUsuario(usuario.tipo_usuario);

            const sqlInsert = `
                INSERT INTO ${tipoUsuario} (id_usuario)
                VALUES (?)
            `;

            await conn.execute(sqlInsert, [id]);
        }

        await conn.commit();

        return result;

    } catch (error) {

        await conn.rollback();
        throw error;

    } finally {

        conn.release();
    }
},
    deletar: async (id) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            
            // Busca o tipo antes de deletar para remover da respectiva tabela filha se não houver ON DELETE CASCADE
            const usuarioAntigo = await usuarioRepository.selecionarPorId(id);
            if (usuarioAntigo) {
                const tipo_usuario = normalizarTipoUsuario(usuarioAntigo.tipo_usuario);
                const sqlFilha = `DELETE FROM ${tipo_usuario} WHERE id_usuario = ?`;
                await conn.execute(sqlFilha, [id]);
            }

            const sql = `DELETE FROM usuarios WHERE id_usuario = ?`;
            const [rows] = await conn.execute(sql, [id]);
            
            await conn.commit();
            return rows;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT id_usuario, nome, cpf, tipo_usuario, email, hash_senha, caminho_imagem FROM usuarios WHERE id_usuario = ?';
            const [rows] = await conn.execute(sql, [id]);
            return rows[0] ?? null;
        } catch (error) {
            throw error;
        } finally {
            conn.release(); // Adicionado para liberar a conexão de volta ao pool
        }
    },

    selecionarAdministracao: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT a.*, u.nome, u.email, u.caminho_imagem FROM administracao a JOIN usuarios u ON a.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarManutencao: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT m.*, u.nome, u.email, u.caminho_imagem FROM manutencao m JOIN usuarios u ON m.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarGeral: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT g.*, u.nome, u.email, u.caminho_imagem FROM geral g JOIN usuarios u ON g.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    buscarPorEmail: async (email) => {
        const conn = await connection.getConnection();
        try {
            const sql = "SELECT id_usuario, nome, cpf, tipo_usuario, email, hash_senha, caminho_imagem FROM usuarios WHERE email = ?";
            const [rows] = await conn.execute(sql, [email]);
            return rows[0] ?? null;
        } finally {
            conn.release();
        }
    },

    buscarPorCpf: async (cpf) => {
        const conn = await connection.getConnection();
        try {
            const sql = "SELECT id_usuario, nome, cpf, tipo_usuario, email, hash_senha, caminho_imagem FROM usuarios WHERE cpf = ?";
            const [rows] = await conn.execute(sql, [cpf]);
            return rows[0] ?? null;
        } finally {
            conn.release();
        }
    }
};

export default usuarioRepository;