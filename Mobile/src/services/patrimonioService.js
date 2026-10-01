import { api } from "./api.js";

export async function buscarPatrimonios(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.get('/patrimonios', {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function buscarPatrimoniosPorSala(token, idSala) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!idSala) throw new Error("Erro: id da sala inválido");

        const resposta = await api.get(`/patrimonios/sala/${idSala}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function atualizarStatusPatrimonio(token, id, status) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id do patrimônio inválido");
        if (!status) throw new Error("Erro: status inválido");

        const resposta = await api.put(
            `/patrimonios/${id}`,
            { status },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return resposta.data;
    } catch (error) {
        throw error;
    }
}