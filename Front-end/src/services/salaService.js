import { api } from "./api.js";

/*
 * =====================================================
 * LISTAR SALAS ATIVAS
 * =====================================================
 */
export async function listarSalas(token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.get(
            '/salas/com-patrimonios',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            'Erro ao listar salas:',
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * LISTAR SALAS DESATIVADAS
 * =====================================================
 */
export async function listarSalasDesativadas(token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.get(
            '/salas/desativadas',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            'Erro ao listar salas desativadas:',
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * OBTER SALA COM PATRIMÔNIOS
 * =====================================================
 */
export async function obterSalaComPatrimonios(id, token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.get(
            `/salas/com-patrimonios/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao obter sala com ID ${id}:`,
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * DESATIVAR SALA
 * =====================================================
 */
export async function desativarSala(id, token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.put(
            `/salas/${id}/desativar`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao desativar sala com ID ${id}:`,
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * ATIVAR SALA
 * =====================================================
 */
export async function ativarSala(id, token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.put(
            `/salas/${id}/ativar`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao ativar sala com ID ${id}:`,
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * EXCLUIR SALA
 * =====================================================
 *
 * Mantemos essa função porque ela ainda existe
 * no backend para exclusão definitiva.
 */
export async function excluirSala(id, token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        await api.delete(
            `/salas/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

    } catch (error) {
        console.error(
            `Erro ao excluir sala com ID ${id}:`,
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * CRIAR SALA
 * =====================================================
 */
export async function criarSala(formData, token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.post(
            '/salas',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            'Erro ao criar sala:',
            error
        );

        throw error;
    }
}


/*
 * =====================================================
 * EDITAR SALA
 * =====================================================
 */
export async function editarSala(id, formData, token) {
    try {
        if (!token) {
            throw new Error(
                "Erro ao editar sala: token inválido"
            );
        }

        const resposta = await api.put(
            `/salas/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao editar sala com ID ${id}:`,
            error
        );

        throw error;
    }
}