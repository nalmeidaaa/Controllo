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
export async function transferirPatrimonio(
    id,
    idSalaDestino,
    token
) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error(
                "Erro: ID do patrimônio inválido"
            );
        }

        if (!idSalaDestino) {
            throw new Error(
                "Erro: sala de destino inválida"
            );
        }

        const resposta = await api.put(
            `/patrimonios/${id}/transferir`,
            {
                id_sala_destino: idSalaDestino
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao transferir patrimônio com ID ${id}:`,
            error
        );

        throw error;
    }
}

// ============================================================
// OBTER HISTÓRICO DE TRANSFERÊNCIAS
// ============================================================
export async function obterHistoricoTransferencias(
    id,
    token
) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error(
                "Erro: ID do patrimônio inválido"
            );
        }

        const resposta = await api.get(
            `/patrimonios/${id}/historico-transferencias`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        console.error(
            `Erro ao buscar histórico do patrimônio com ID ${id}:`,
            error
        );

        throw error;
    }
}