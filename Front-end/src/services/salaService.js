import { api } from "./api.js";

export async function listarSalas(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.get('/salas/com-patrimonios', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return resposta.data;
    } catch (error) {
        console.error('Erro ao listar salas:', error);
        throw error;
    }
}

export async function obterSalaComPatrimonios(id, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.get(`/salas/com-patrimonios/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return resposta.data;
    } catch (error) {
        console.error(`Erro ao obter sala com ID ${id}:`, error);
        throw error;
    }
}

export async function excluirSala(id, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        await api.delete(`/salas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error(`Erro ao excluir sala com ID ${id}:`, error);
        throw error;
    }
}

export async function criarSala(formData, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.post('/salas', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return resposta.data;
    } catch (error) {
        console.error('Erro ao criar sala:', error);
        throw error;
    }
}

export async function editarSala(id, formData, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.put(`/salas/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return resposta.data;
    } catch (error) {
        console.error(`Erro ao editar sala com ID ${id}:`, error);
        throw error;
    }
}