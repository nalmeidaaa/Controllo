import { connection } from "../configs/Database.js"
import { normalizarTipoUsuario } from "../utils/normalizarTipoUsuario.js";

const usuarioRepository = {

    criar: async (usuario) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            const sqlInsertUser = `INSERT INTO usuarios (nome, cpf, tipo_usuario, email, hash_senha) VALUES (?, ?, ?, ?, ?)`;
            const values = [usuario.nome, usuario.cpf, usuario.tipo_usuario, usuario.email, usuario.hash_senha];
            const [result] = await conn.execute(sqlInsertUser, values);
            const userId = result.insertId; // Obtém o ID do usuário recém-inserido
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
            const sql = 'SELECT * FROM usuarios';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    editar: async (id, usuario) => {

        const conn = await connection.getConnection();

        try {

            await conn.beginTransaction();

            let sql = `UPDATE usuarios SET `;
            let values = [];

            if (usuario.nome) {

                sql += ` nome = ?,`;
                values.push(usuario.nome);

            }

            if (usuario.tipo_usuario) {

                sql += ` tipo_usuario = ?,`;
                values.push(usuario.tipo_usuario);
                let tipo_usuario_antigo = (await usuarioRepository.selecionarPorId(id)).tipo_usuario;
                tipo_usuario_antigo = normalizarTipoUsuario(tipo_usuario_antigo);
                const sqlDelete = `DELETE FROM ${tipo_usuario_antigo} WHERE id_usuario = ?;`;
                await conn.execute(sqlDelete, [id]); //
            }

            if (usuario.cpf !== undefined && (usuario.cpf === await usuarioRepository.selecionarPorId(id).cpf)) {
                sql += ` cpf = ?,`;
                values.push(usuario.cpf ?? null);
            }

            if (usuario.email !== undefined) {

                sql += ` email = ?,`;
                values.push(usuario.email ?? null);

            }

            if (usuario.hash_senha) {

                sql += ` hash_senha = ?,`;
                values.push(usuario.hash_senha);

            }

            // REMOVE A ÚLTIMA VÍRGULA
            sql = sql.slice(0, -1);

            sql += ` WHERE id_usuario = ?`;
            //também quero que atualize nas outras tabelas (administracao, manutencao e geral) caso o tipo_usuario seja alterado
            if (usuario.tipo_usuario) {

                const sqlInsert = `INSERT INTO ${usuario.tipo_usuario} (id_usuario) VALUES (?)`;
                await conn.execute(sqlInsert, [id]);
            }

            values.push(id);

            const [result] = await conn.execute(
                sql,
                values
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
    deletar: async (id) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();
            const tipo_usuario = (await usuarioRepository.selecionarPorId(id)).tipo_usuario;


            const sql = `DELETE FROM usuarios WHERE id_usuario = ?`;
            const values = [id];
            const [rows] = await conn.execute(sql, values);
            await conn.commit();
            return rows;
        }
        catch (error) {
            await conn.rollback();
            throw error;
        }
        finally {
            conn.release();
        }
    },
    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT * FROM usuarios WHERE id_usuario = ?';
            const [rows] = await conn.execute(sql, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },
    selecionarAdministracao: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT a.*, u.nome FROM administracao a JOIN usuarios u ON a.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    selecionarManutencao: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT m.*, u.nome FROM manutencao m JOIN usuarios u ON m.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    selecionarGeral: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT g.*, u.nome FROM geral g JOIN usuarios u ON g.id_usuario = u.id_usuario';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        }
    },
    buscarPorEmail: async (email) => {
        const conn = await connection.getConnection();
        try {
            const sql = "SELECT * FROM usuarios WHERE email = ?";
            const [rows] = await conn.execute(sql, [email]);
            return rows[0];
        } finally {
            conn.release();
        }
    },
    buscarPorCpf: async (cpf) => {
        const conn = await connection.getConnection();
        try {
            const sql = "SELECT * FROM usuarios WHERE cpf = ?";
            const [rows] = await conn.execute(sql, [cpf]);
            return rows[0];
        }
        finally {
            conn.release();
        }
    }
};

export default usuarioRepository;