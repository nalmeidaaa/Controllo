import { api } from "./api.js";

export async function buscarSalas(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.get('/salas', {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function buscarSalaComPatrimonios(token, idSala) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!idSala) throw new Error("Erro: id da sala inválido");

        const resposta = await api.get(`/salas/com-patrimonios/${idSala}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}
