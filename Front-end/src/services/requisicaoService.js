import { api } from "./api.js";

export async function listarHistorico(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.get('/requisicoes/historico', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return resposta.data;
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        throw error;
    }
}