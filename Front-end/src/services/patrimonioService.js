import { api } from "./api.js";

export async function excluirPatrimonio(id, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        await api.delete(`/patrimonios/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    } catch (error) {
        console.error(`Erro ao excluir patrimônio com ID ${id}:`, error);
        throw error;
    }
}

export async function editarPatrimonio(id, dadosAtualizados, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const isFormData = dadosAtualizados instanceof FormData;
        const resposta = await api.put(`/patrimonios/${id}`, dadosAtualizados, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...(isFormData ? { 'Content-Type': 'multipart/form-data' } : {})
            }
        });
        return resposta.data;
    } catch (error) {
        console.error(`Erro ao editar patrimônio com ID ${id}:`, error);
        throw error;
    }
}

export async function criarPatrimonio(dados, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.post('/patrimonios', dados, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return resposta.data;
    } catch (error) {
        console.error("Erro ao criar patrimônio:", error);
        throw error;
    }
}