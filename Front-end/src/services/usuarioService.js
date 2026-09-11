import { api } from "./api.js";
import { obterUsuarioAtual } from "../storage/usuario/dados.storage.js";

// ============================================================
// VERIFICAR SETUP
// ============================================================
export async function verificarSetup() {
    try {
        const resposta = await api.get('/usuarios/setup');

        return resposta.data; // Espera-se { result: true/false }

    } catch (error) {
        throw error;
    }
}


// ============================================================
// LOGIN
// ============================================================
export async function logar(login, senha) {
    try {
        if (!login || !senha) {
            throw new Error("Login e senha são obrigatórios");
        }

        const resposta = await api.post('/usuarios/login', {
            login,
            senha
        });

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// CRIAR USUÁRIO
// ============================================================
export async function criarUsuario(token, formData) {
    try {
        const resposta = await api.post(
            '/usuarios',
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// ATUALIZAR USUÁRIO
// ============================================================
export async function atualizarUsuario(token, id, formData) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error("Erro: id inválido");
        }

        const resposta = await api.put(
            `/usuarios/${id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// BUSCAR USUÁRIOS
// ============================================================
export async function buscarUsuarios(token) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        const resposta = await api.get(
            '/usuarios',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// OBTER PAYLOAD DO TOKEN
// ============================================================
function obterPayloadToken(tokenInput) {
    try {
        if (!tokenInput) {
            return null;
        }

        // Se veio um objeto { token: "..." },
        // extrai a string do token
        const tokenString =
            typeof tokenInput === 'object'
                ? tokenInput.token
                : tokenInput;

        if (!tokenString || typeof tokenString !== 'string') {
            return null;
        }

        const partes = tokenString.split('.');

        if (partes.length < 2) {
            return null;
        }

        const payloadBase64 = partes[1];

        const payloadDecodificado = atob(
            payloadBase64
                .replace(/-/g, '+')
                .replace(/_/g, '/')
        );

        return JSON.parse(payloadDecodificado);

    } catch (e) {
        return null;
    }
}


// ============================================================
// EXCLUIR USUÁRIO
// ============================================================
export async function excluirUsuario(token, id) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error("Erro: id inválido");
        }

        // 1. Obtém os dados e resolve a string do token
        const dadosStorage = obterUsuarioAtual();

        const payload = obterPayloadToken(
            dadosStorage || token
        );

        // 2. O token do seu log possui a propriedade 'id'
        const idUsuarioLogado =
            payload?.id ||
            payload?.id_usuario;

        // 3. Validação de segurança
        if (
            idUsuarioLogado &&
            String(idUsuarioLogado) === String(id)
        ) {
            throw new Error(
                "Você não pode alterar o tipo da sua própria conta."
            );
        }

        const resposta = await api.delete(
            `/usuarios/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// DESATIVAR USUÁRIO
// ============================================================
export async function desativarUsuario(token, id) {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error("Erro: id inválido");
        }

        // 1. Obtém os dados e resolve a string do token
        const dadosStorage = obterUsuarioAtual();

        const payload = obterPayloadToken(
            dadosStorage || token
        );

        // 2. O token do seu log possui a propriedade 'id'
        const idUsuarioLogado =
            payload?.id ||
            payload?.id_usuario;

        // 3. Validação de segurança
        if (
            idUsuarioLogado &&
            String(idUsuarioLogado) === String(id)
        ) {
            throw new Error(
                "Você não pode desativar a sua própria conta."
            );
        }

        // 4. Altera o tipo do usuário para desativado
        const resposta = await api.put(
            `/usuarios/${id}`,
            {
                tipo_usuario: "desativado"
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}


// ============================================================
// ATIVAR USUÁRIO
// ============================================================
export async function ativarUsuario(token, id, tipo_usuario = "geral") {
    try {
        if (!token) {
            throw new Error("Erro: token inválido");
        }

        if (!id) {
            throw new Error("Erro: id inválido");
        }

        // Verifica se o tipo informado é válido
        const tiposPermitidos = [
            "administracao",
            "manutencao",
            "geral"
        ];

        if (!tiposPermitidos.includes(tipo_usuario)) {
            throw new Error(
                "Erro: tipo de usuário inválido."
            );
        }

        // 1. Obtém os dados e resolve a string do token
        const dadosStorage = obterUsuarioAtual();

        const payload = obterPayloadToken(
            dadosStorage || token
        );

        // 2. Identifica o usuário logado
        const idUsuarioLogado =
            payload?.id ||
            payload?.id_usuario;

        // 3. Impede alterações na própria conta
        if (
            idUsuarioLogado &&
            String(idUsuarioLogado) === String(id)
        ) {
            throw new Error(
                "Você não pode alterar o tipo da sua própria conta."
            );
        }

        // 4. Altera o usuário de desativado para o perfil escolhido
        const resposta = await api.put(
            `/usuarios/${id}`,
            {
                tipo_usuario: tipo_usuario
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return resposta.data;

    } catch (error) {
        throw error;
    }
}