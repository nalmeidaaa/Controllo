import { api } from "./api.js";

// ============================================================
// EXCLUIR PATRIMÔNIO
// ============================================================
export async function excluirPatrimonio(id, token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        await api.delete(`/patrimonios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

    } catch (error) {
        console.error(
            `Erro ao excluir patrimônio com ID ${id}:`,
            error
        );

        throw error;
    }
}

// ============================================================
// EDITAR PATRIMÔNIO
// ============================================================
export async function editarPatrimonio(
    id,
    dadosAtualizados,
    token
) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const isFormData =
            dadosAtualizados instanceof FormData;

        const resposta = await api.put(
            `/patrimonios/${id}`,
            dadosAtualizados,
            {
                headers: {
                    Authorization: `Bearer ${token}`,

                    ...(isFormData
                        ? {
                            'Content-Type':
                                'multipart/form-data'
                        }
                        : {})
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao editar patrimônio com ID ${id}:`,
            error
        );

        throw error;
    }
}

// ============================================================
// CRIAR PATRIMÔNIO
// ============================================================
export async function criarPatrimonio(
    dados,
    token
) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.post(
            '/patrimonios',
            dados,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            "Erro ao criar patrimônio:",
            error
        );

        throw error;
    }
}

// ============================================================
// TRANSFERIR PATRIMÔNIO
// ============================================================
// `patrimonio` (opcional) é o objeto atual do item: o fallback precisa
// reenviar nome/status/número, pois a rota de edição os exige.
export async function transferirPatrimonio(
    id,
    idSalaDestino,
    token,
    patrimonio = {}
) {
    if (!token) throw new Error("Erro: token inválido");
    if (!id) throw new Error("Erro: ID do patrimônio inválido");
    if (!idSalaDestino) throw new Error("Erro: sala de destino inválida");

    const headers = { Authorization: `Bearer ${token}` };

    try {
        const resposta = await api.put(
            `/patrimonios/${id}/transferir`,
            { id_sala_destino: idSalaDestino, id_sala: idSalaDestino },
            { headers }
        );
        return resposta.data;

    } catch (error) {
        const status = error.response?.status;

        // Erros de validação/permissão (400, 401, 403, 409, 422...) são respostas
        // reais do backend: repassa. Já rota inexistente (404/405), erro de
        // servidor (5xx) ou falha de rede indicam que a rota dedicada não funciona;
        // nesses casos transfere pela edição do patrimônio (muda só a sala).
        const usarFallback =
            !status || status === 404 || status === 405 || status >= 500;

        if (!usarFallback) {
            console.error(`Erro ao transferir patrimônio com ID ${id}:`, error);
            throw error;
        }

        console.warn(
            `Rota /transferir falhou (${status ?? 'sem resposta'}). Usando edição do patrimônio.`
        );

        const dados = new FormData();
        dados.append('nome', patrimonio.nome ?? '');
        if (patrimonio.status) dados.append('status', patrimonio.status);
        if (patrimonio.numero_patrimonio) {
            dados.append('numero_patrimonio', patrimonio.numero_patrimonio);
        }
        dados.append('id_sala', idSalaDestino);

        try {
            const resposta = await api.put(
                `/patrimonios/${id}`,
                dados,
                { headers: { ...headers, 'Content-Type': 'multipart/form-data' } }
            );
            return resposta.data;
        } catch (erroFallback) {
            console.error(`Erro ao transferir patrimônio com ID ${id}:`, erroFallback);
            throw erroFallback;
        }
    }
}

// ============================================================
// HISTÓRICO DO PATRIMÔNIO
// (usa a mesma rota /historicos da tela de Histórico, filtrando pelo patrimônio)
// ============================================================
export async function obterHistoricoPatrimonio(id, token) {
    if (!token) throw new Error("Erro: token inválido");
    if (!id) throw new Error("Erro: ID do patrimônio inválido");

    const resposta = await api.get('/historicos', {
        headers: { Authorization: `Bearer ${token}` },
        params: { id_patrimonio: id, pagina: 1, limite: 100 }
    });

    return resposta.data; // { result, total, pagina, limite }
}
