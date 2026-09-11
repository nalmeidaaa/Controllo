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
        percentEncoded += "%" + ("00" + bytesString.charCodeAt(i).toString(16)).slice(-2);
    }
    return decodeURIComponent(percentEncoded);
}

function obterPayloadToken(tokenInput) {
    try {
        if (!tokenInput) return null;

        const tokenString = typeof tokenInput === "object" ? tokenInput.token : tokenInput;

        if (!tokenString || typeof tokenString !== "string") return null;

        const payloadBase64 = tokenString.split(".")[1];
        const payloadDecodificado = bytesParaUtf8(decodificarBase64Url(payloadBase64));
        return JSON.parse(payloadDecodificado);
    } catch (e) {
        return null;
    }
}

export async function verificarSetup() {
    try {
        const resposta = await api.get('/usuarios/setup');
        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function logar(login, senha) {
    try {
        if (!login || !senha) throw new Error("Login e senha são obrigatórios");
        const resposta = await api.post('/usuarios/login', { login, senha });
        const { token } = resposta.data;

        if (!token) throw new Error("Resposta inválida do servidor.");

        const payload = obterPayloadToken(token);

        return {
            token,
            id: payload?.id ?? null,
            tipo_usuario: normalizarTipoUsuario(payload?.tipo_usuario),
        };
    } catch (error) {
        throw error;
    }
}

export async function criarUsuario(token, formData) {
    try {
        const resposta = await api.post('/usuarios', formData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
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
                Authorization: `Bearer ${token}`
            }
        });
        return resposta.data;
    } catch (error) {
        throw error;
    }
}

export async function buscarUsuarios(token) {
    try {
        if (!token) throw new Error("Erro: token inválido");
        const resposta = await api.get('/usuarios', {
            headers: { Authorization: `Bearer ${token}` }
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

        if (idUsuarioLogado && String(idUsuarioLogado) === String(id)) {
            throw new Error("Você não pode alterar o tipo da sua própria conta.");
        }

        const resposta = await api.delete(
            `/usuarios/${id}`,
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

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

        if (idUsuarioLogado && String(idUsuarioLogado) === String(id)) {
            throw new Error("Você não pode desativar a sua própria conta.");
        }

        const resposta = await api.put(
            `/usuarios/${id}`,
            { tipo_usuario: "desativado" },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        return resposta.data;
    } catch (error) {
        throw error;
    }
}
