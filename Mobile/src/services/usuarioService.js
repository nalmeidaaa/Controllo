import { api } from "./api.js";
import { obterUsuarioAtual } from "../storage/usuario/dados.storage.js";

const BASE64_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function decodificarBase64Url(base64Url) {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const resto = base64.length % 4;

    if (resto === 2) base64 += "==";
    else if (resto === 3) base64 += "=";

    const semPadding = base64.replace(/=+$/, "");
    let buffer = 0;
    let bits = 0;
    let resultado = "";

    for (let i = 0; i < semPadding.length; i++) {
        const valor = BASE64_CHARS.indexOf(semPadding[i]);

        if (valor === -1) continue;

        buffer = (buffer << 6) | valor;
        bits += 6;

        if (bits >= 8) {
            bits -= 8;
            resultado += String.fromCharCode((buffer >> bits) & 0xff);
        }
    }

    return resultado;
}

function normalizarTipoUsuario(tipo) {
    if (!tipo || typeof tipo !== "string") return null;

    return tipo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
}

function bytesParaUtf8(bytesString) {
    let percentEncoded = "";

    for (let i = 0; i < bytesString.length; i++) {
        percentEncoded +=
            "%" + ("00" + bytesString.charCodeAt(i).toString(16)).slice(-2);
    }

    return decodeURIComponent(percentEncoded);
}

function obterPayloadToken(tokenInput) {
    try {
        if (!tokenInput) return null;

        const tokenString =
            typeof tokenInput === "object" ? tokenInput.token : tokenInput;

        if (!tokenString || typeof tokenString !== "string") return null;

        const payloadBase64 = tokenString.split(".")[1];

        if (!payloadBase64) return null;

        const payloadDecodificado = bytesParaUtf8(
            decodificarBase64Url(payloadBase64)
        );

        return JSON.parse(payloadDecodificado);
    } catch (e) {
        return null;
    }
}

export async function verificarSetup() {
    try {
        const resposta = await api.get("/usuarios/setup");
        return resposta.data;
    } catch (error) {
        throw error;
    }
}

// Realiza o login e prepara os dados do usuário para salvar no aplicativo
export async function logar(login, senha) {
    try {
        if (!login || !senha) {
            throw new Error("Login e senha são obrigatórios");
        }

        const resposta = await api.post("/usuarios/login", {
            login,
            senha,
        });

        const dadosResposta = resposta.data;
        const token = dadosResposta?.token;

        if (!token) {
            throw new Error("Resposta inválida do servidor.");
        }

        const payload = obterPayloadToken(token);
        const dadosUsuario = dadosResposta?.usuario ?? {};

        return {
            ...dadosResposta,

            token,

            id:
                payload?.id ??
                payload?.id_usuario ??
                dadosUsuario?.id ??
                dadosUsuario?.id_usuario ??
                dadosResposta?.id ??
                dadosResposta?.id_usuario ??
                null,

            nome:
                payload?.nome ??
                payload?.name ??
                dadosUsuario?.nome ??
                dadosUsuario?.name ??
                dadosResposta?.nome ??
                dadosResposta?.name ??
                "",

            tipo_usuario: normalizarTipoUsuario(
                payload?.tipo_usuario ??
                dadosUsuario?.tipo_usuario ??
                dadosResposta?.tipo_usuario
            ),
        };
    } catch (error) {
        throw error;
    }
}

export async function criarUsuario(token, formData) {
    try {
        const resposta = await api.post("/usuarios", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function atualizarUsuario(token, id, formData) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");

        const resposta = await api.put(`/usuarios/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function buscarUsuarios(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");

        const resposta = await api.get("/usuarios", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function excluirUsuario(token, id) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");

        const dadosStorage = await obterUsuarioAtual();
        const payload = obterPayloadToken(dadosStorage || token);

        const idUsuarioLogado = payload?.id || payload?.id_usuario;

        if (
            idUsuarioLogado &&
            String(idUsuarioLogado) === String(id)
        ) {
            throw new Error(
                "Você não pode alterar o tipo da sua própria conta."
            );
        }

        const resposta = await api.delete(`/usuarios/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function desativarUsuario(token, id) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        if (!id) throw new Error("Erro: id inválido");

        const dadosStorage = await obterUsuarioAtual();
        const payload = obterPayloadToken(dadosStorage || token);

        const idUsuarioLogado = payload?.id || payload?.id_usuario;

        if (
            idUsuarioLogado &&
            String(idUsuarioLogado) === String(id)
        ) {
            throw new Error(
                "Você não pode desativar a sua própria conta."
            );
        }

        const resposta = await api.put(
            `/usuarios/${id}`,
            { tipo_usuario: "desativado" },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return resposta.data;
    } catch (error) {
        throw error;
    }
}

// Cadastro público (sem token). Multipart; não envia tipo_usuario nem foto.
export async function cadastrarUsuario({ nome, cpf, email, senha }) {
    const formData = new FormData();

    formData.append("nome", nome);
    formData.append("cpf", cpf);
    formData.append("email", email);
    formData.append("senha", senha);

    const resposta = await api.post("/usuarios/cadastro", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return resposta.data;
}

// Perfil do próprio usuário (qualquer tipo de conta)
export async function buscarMeuPerfil(token) {
    if (!token) throw new Error("Erro: token inválido");

    const resposta = await api.get("/usuarios/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return resposta.data;
}

// formData aceita: nome, email e imagem. Tipo de conta e CPF não mudam por aqui.
// Envio de foto pode demorar mais que o padrão (10s), por isso o timeout é maior.
// Não definimos Content-Type manualmente: o React Native monta o multipart com o boundary correto.
const TIMEOUT_UPLOAD = 60000;

export async function atualizarMeuPerfil(token, formData) {
    if (!token) throw new Error("Erro: token inválido");

    const enviar = () =>
        api.put("/usuarios/me", formData, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: TIMEOUT_UPLOAD,
        });

    let resposta;
    try {
        resposta = await enviar();
    } catch (error) {
        // Sem resposta do servidor (conexão ainda acordando): tenta mais uma vez.
        // Respostas de erro do servidor (400, 401, 409...) não são repetidas.
        if (error?.response) throw error;

        await new Promise((resolver) => setTimeout(resolver, 1500));
        resposta = await enviar();
    }

    return resposta.data;
}
