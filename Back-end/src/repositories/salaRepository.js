import { connection } from '../configs/Database.js';

const salaRepository = {
    criar: async (sala) => {
        const conn = await connection.getConnection();
        try {
            const sql = `INSERT INTO salas (descricao, bloco, caminho_imagem) VALUES (?, ?, ?)`;
            const values = [sala.descricao ?? null, sala.bloco ?? null, sala.caminhoImagem ?? sala.caminho_imagem ?? null];
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
            const sql = 'SELECT id_sala, descricao, bloco, caminho_imagem FROM salas ORDER BY bloco, descricao';
            const [rows] = await conn.execute(sql);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorId: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT id_sala, descricao, bloco, caminho_imagem FROM salas WHERE id_sala = ?';
            const [rows] = await conn.execute(sql, [id]);
            return rows[0] ?? null;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    selecionarPorBloco: async (bloco) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'SELECT id_sala, descricao, bloco, caminho_imagem FROM salas WHERE bloco = ? ORDER BY descricao';
            const [rows] = await conn.execute(sql, [bloco]);
            return rows;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    editar: async (id, sala) => {
        const conn = await connection.getConnection();
        try {
            let sql = 'UPDATE salas SET ';
            const values = [];

            if (sala.descricao !== null && sala.descricao !== undefined) {
                sql += 'descricao = ?, ';
                values.push(sala.descricao);
            }

            if (sala.bloco !== null && sala.bloco !== undefined) {
                sql += 'bloco = ?, ';
                values.push(sala.bloco);
            }

            const img = sala.caminhoImagem ?? sala.caminho_imagem;
            if (img !== null && img !== undefined) {
                sql += 'caminho_imagem = ?, ';
                values.push(img);
            }

            if (values.length === 0) {
                throw new Error('Nenhum campo fornecido para atualização.');
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

    deletar: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = 'DELETE FROM salas WHERE id_sala = ?';
            const [result] = await conn.execute(sql, [id]);
            return result;
        } catch (error) {
            throw error;
        } finally {
            conn.release();
        }
    },

    criarComPatrimonios: async (sala, instanciasPatrimonio) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            // Insere a sala com tratamento anti-undefined
            const sqlSala = `INSERT INTO salas (descricao, bloco, caminho_imagem) VALUES (?, ?, ?)`;
            const valuesSala = [
                sala.descricao ?? null, 
                sala.bloco ?? null, 
                sala.caminhoImagem ?? sala.caminho_imagem ?? null
            ];
            const [resultSala] = await conn.execute(sqlSala, valuesSala);
            const idSala = resultSala.insertId;

            // Insere os patrimônios vinculados com tratamento anti-undefined
            const patrimoniosCriados = [];
            if (instanciasPatrimonio && instanciasPatrimonio.length > 0) {
                for (const p of instanciasPatrimonio) {
                    const sqlPatrimonio = `INSERT INTO patrimonio (nome, status, id_sala, caminho_imagem) VALUES (?, ?, ?, ?)`;
                    const fotoPatrimonio = p.caminhoImagem ?? p.caminho_imagem ?? null;
                    
                    const valuesPatrimonio = [
                        p.nome ?? null, 
                        p.status ?? 'Ok', 
                        idSala, 
                        fotoPatrimonio
                    ];
                    const [resultPatr] = await conn.execute(sqlPatrimonio, valuesPatrimonio);

                    patrimoniosCriados.push({
                        id_patrimonio: resultPatr.insertId,
                        nome: p.nome ?? null,
                        status: p.status ?? 'Ok',
                        id_sala: idSala,
                        caminho_imagem: fotoPatrimonio
                    });
                }
            }

            await conn.commit();
            return { id_sala: idSala, patrimonios: patrimoniosCriados };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    editarComPatrimonios: async (id, sala, patrimoniosNovos) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            let sql = 'UPDATE salas SET ';
            const values = [];
            if (sala.descricao !== null && sala.descricao !== undefined) {
                sql += 'descricao = ?, ';
                values.push(sala.descricao);
            }
            if (sala.bloco !== null && sala.bloco !== undefined) {
                sql += 'bloco = ?, ';
                values.push(sala.bloco);
            }
            const img = sala.caminhoImagem ?? sala.caminho_imagem;
            if (img !== null && img !== undefined) {
                sql += 'caminho_imagem = ?, ';
                values.push(img);
            }

            if (values.length > 0) {
                sql = sql.trimEnd().slice(0, -1) + ' WHERE id_sala = ?';
                values.push(id);
                await conn.execute(sql, values);
            }

            let patrimoniosParaDeletar = [];

            if (patrimoniosNovos !== null && patrimoniosNovos !== undefined) {
                const idsEnviados = patrimoniosNovos.map(p => p.id ?? p.id_patrimonio).filter(Boolean);

                const [antigos] = await conn.execute('SELECT id_patrimonio, caminho_imagem FROM patrimonio WHERE id_sala = ?', [id]);
                patrimoniosParaDeletar = antigos.filter(p => !idsEnviados.includes(p.id_patrimonio));

                if (patrimoniosParaDeletar.length > 0) {
                    const idsDeletar = patrimoniosParaDeletar.map(p => p.id_patrimonio);
                    await conn.execute(`DELETE FROM patrimonio WHERE id_patrimonio IN (${idsDeletar.map(() => '?').join(',')})`, idsDeletar);
                }

                for (const p of patrimoniosNovos) {
                    const idPatr = p.id ?? p.id_patrimonio;
                    const fotoPatrimonio = p.caminhoImagem ?? p.caminho_imagem ?? null;

                    if (idPatr) {
                        // CORRIGIDO: Agora atualiza também o caminho da imagem do patrimônio na edição!
                        const sqlUpdate = `UPDATE patrimonio SET nome = ?, status = ?, caminho_imagem = ? WHERE id_patrimonio = ? AND id_sala = ?`;
                        await conn.execute(sqlUpdate, [p.nome ?? null, p.status ?? 'Ok', fotoPatrimonio, idPatr, id]);
                    } else {
                        const sqlInsert = `INSERT INTO patrimonio (nome, status, id_sala, caminho_imagem) VALUES (?, ?, ?, ?)`;
                        await conn.execute(sqlInsert, [p.nome ?? null, p.status ?? 'Ok', id, fotoPatrimonio]);
                    }
                }
            }

            await conn.commit();
            return { patrimoniosParaDeletar };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    deletarComPatrimonios: async (id) => {
        const conn = await connection.getConnection();
        try {
            await conn.beginTransaction();

            await conn.execute('DELETE FROM patrimonio WHERE id_sala = ?', [id]);
            const [result] = await conn.execute('DELETE FROM salas WHERE id_sala = ?', [id]);

            await conn.commit();
            return result;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    listarSalaEPatrimonios: async (id) => {
        const conn = await connection.getConnection();
        try {
            const sql = `
                SELECT 
                    s.id_sala, s.descricao, s.bloco, s.caminho_imagem AS sala_imagem,
                    p.id_patrimonio, p.nome AS patrimonio_nome, p.status AS patrimonio_status, p.caminho_imagem AS patrimonio_imagem
                FROM salas s
                LEFT JOIN patrimonio p ON s.id_sala = p.id_sala
                ${id ? 'WHERE s.id_sala = ?' : 'ORDER BY s.bloco, s.descricao'}
            `;
            const [rows] = await conn.execute(sql, id ? [id] : []);

            const salasMap = new Map();
            for (const row of rows) {
                if (!salasMap.has(row.id_sala)) {
                    salasMap.set(row.id_sala, {
                        id_sala: row.id_sala,
                        descricao: row.descricao,
                        bloco: row.bloco,
                        caminho_imagem: row.sala_imagem,
                        patrimonios: []
                    });
                }
                if (row.id_patrimonio) {
                    salasMap.get(row.id_sala).patrimonios.push({
                        id_patrimonio: row.id_patrimonio,
                        nome: row.patrimonio_nome,
                        status: row.patrimonio_status,
                        caminho_imagem: row.patrimonio_imagem
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