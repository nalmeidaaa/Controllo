import { connection } from "../configs/Database.js"
import { normalizarTipoUsuario } from "../utils/normalizarTipoUsuario.js";

// Erro de regra de negócio: o controller converte em resposta HTTP
export class UsuarioError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.name = 'UsuarioError';
        this.status = status;
        this.extra = extra;
    }
}

// Perfis que o administrador pode atribuir ao aprovar um cadastro
const PERFIS_APROVACAO = ['geral', 'manutencao', 'administracao'];

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
            const sql = `
                SELECT
                    u.id_usuario,
                    u.nome,
                    u.cpf,
                    u.tipo_usuario,
                    u.email,
                    u.caminho_imagem,
                    d.tipo_usuario_antigo
                FROM usuarios u
                LEFT JOIN desativado d ON d.id_usuario = u.id_usuario
                WHERE u.tipo_usuario <> 'Pendente'
            `;
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release(); // Adicionado para evitar leak de conexão
        }
    },

    verificarSetup: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT COUNT(1) AS total FROM administracao';
            const [rows] = await conn.execute(sql);

            // Retorna true se houver registros, false se estiver vazio
            return rows[0].total === 0;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    editar: async (id, usuario) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            let sql = `UPDATE usuarios SET `;
            let values = [];
            let tipoUsuarioAntigoNormalizado = null;

            if (usuario.nome) {
                sql += ` nome = ?,`;
                values.push(usuario.nome);
            }

            if (usuario.tipo_usuario) {
                sql += ` tipo_usuario = ?,`;
                values.push(usuario.tipo_usuario);

                // Busca o tipo antigo para remover da tabela filha anterior
                let usuarioAntigo = await usuarioRepository.selecionarPorId(id);
                if (usuarioAntigo) {
                    tipoUsuarioAntigoNormalizado = normalizarTipoUsuario(usuarioAntigo.tipo_usuario);
                    const sqlDelete = `DELETE FROM ${tipoUsuarioAntigoNormalizado} WHERE id_usuario = ?;`;
                    await conn.execute(sqlDelete, [id]);
                }
            }

            // Correção da validação do CPF para permitir alteração quando enviado
            if (usuario.cpf !== undefined) {
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

            // Atualiza o caminho da imagem no banco de dados se enviado
            if (usuario.caminhoImagem !== undefined) {
                sql += ` caminho_imagem = ?,`;
                values.push(usuario.caminhoImagem ?? null);
            }

            // REMOVE A ÚLTIMA VÍRGULA
            sql = sql.slice(0, -1);
            sql += ` WHERE id_usuario = ?`;
            values.push(id);

            // 1º: Executa o UPDATE na tabela pai (usuarios)
            const [result] = await conn.execute(sql, values);

            // 2º: Insere na nova tabela filha se o tipo mudou
            if (usuario.tipo_usuario) {
                const tipoUsuarioNovoNormalizado = normalizarTipoUsuario(usuario.tipo_usuario);

                if (tipoUsuarioNovoNormalizado === "desativado") {
                    // Armazena o tipo de usuário antigo na tabela "desativado"
                    const sqlInsert = `INSERT INTO desativado (id_usuario, tipo_usuario_antigo) VALUES (?, ?)`;
                    await conn.execute(sqlInsert, [id, tipoUsuarioAntigoNormalizado]);
                } else {
                    const sqlInsert = `INSERT INTO ${tipoUsuarioNovoNormalizado} (id_usuario) VALUES (?)`;
                    await conn.execute(sqlInsert, [id]);
                }
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

    // CADASTRO PENDENTE: lista dos cadastros aguardando aprovação (mais antigos primeiro)
    selecionarPendentes: async () => {
        const conn = await connection.getConnection();
        try {
            const sql = `
                SELECT
                    u.id_usuario,
                    u.nome,
                    u.cpf,
                    u.email,
                    u.caminho_imagem,
                    p.criado_em AS data_cadastro
                FROM pendente p
                JOIN usuarios u ON u.id_usuario = p.id_usuario
                ORDER BY p.criado_em ASC, p.id_pendente ASC
            `;
            const [rows] = await conn.execute(sql);
            return rows;
        } finally {
            conn.release();
        }
    },

    contarPendentes: async () => {
        const conn = await connection.getConnection();
        try {
            const [rows] = await conn.execute('SELECT COUNT(*) AS total FROM pendente');
            return Number(rows[0].total);
        } finally {
            conn.release();
        }
    },

    // APROVAR: tira de "pendente" e coloca no perfil escolhido (tudo ou nada)
    aprovar: async (id, perfil) => {
        const perfilNormalizado = normalizarTipoUsuario(String(perfil ?? ''));
        if (!PERFIS_APROVACAO.includes(perfilNormalizado)) {
            throw new UsuarioError(400, 'Perfil inválido. Valores permitidos: geral, manutencao e administracao.', { campo: 'tipo_usuario' });
        }

        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const [usuarios] = await conn.execute(
                'SELECT id_usuario, nome, tipo_usuario FROM usuarios WHERE id_usuario = ? FOR UPDATE',
                [id]
            );
            if (usuarios.length === 0) {
                throw new UsuarioError(404, 'Usuário não encontrado.');
            }
            if (normalizarTipoUsuario(usuarios[0].tipo_usuario) !== 'pendente') {
                throw new UsuarioError(409, 'Este cadastro não está mais pendente.');
            }

            await conn.execute('DELETE FROM pendente WHERE id_usuario = ?', [id]);
            await conn.execute('UPDATE usuarios SET tipo_usuario = ? WHERE id_usuario = ?', [perfilNormalizado, id]);
            // perfilNormalizado vem da lista fixa acima (seguro para usar como nome de tabela)
            await conn.execute(`INSERT INTO ${perfilNormalizado} (id_usuario) VALUES (?)`, [id]);

            await conn.commit();
            return { id_usuario: usuarios[0].id_usuario, nome: usuarios[0].nome, tipo_usuario: perfilNormalizado };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // RECUSAR: exclui o cadastro pendente (devolve a foto para o controller apagar do disco)
    recusar: async (id) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            const [usuarios] = await conn.execute(
                'SELECT id_usuario, tipo_usuario, caminho_imagem FROM usuarios WHERE id_usuario = ? FOR UPDATE',
                [id]
            );
            if (usuarios.length === 0) {
                throw new UsuarioError(404, 'Usuário não encontrado.');
            }
            if (normalizarTipoUsuario(usuarios[0].tipo_usuario) !== 'pendente') {
                throw new UsuarioError(409, 'Este cadastro não está mais pendente.');
            }

            await conn.execute('DELETE FROM pendente WHERE id_usuario = ?', [id]);
            await conn.execute('DELETE FROM usuarios WHERE id_usuario = ?', [id]);

            await conn.commit();
            return { caminho_imagem: usuarios[0].caminho_imagem };
        } catch (error) {
            await conn.rollback();
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