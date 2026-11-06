import { BASE_URL } from "../services/api.js";
import { buscarMeuPerfil } from "../services/usuarioService.js";
import {
    obterUsuarioAtual,
    obterToken,
    salvarUsuario,
} from "../storage/usuario/dados.storage.js";

export function nomeDoUsuario(usuario) {
    if (!usuario) return "";
    const nome = usuario.nome || usuario.nome_usuario || usuario.name || "";
    return String(nome).trim();
}

// Primeira letra do primeiro e do último nome: "Maria da Silva" -> "MS" | "Ana" -> "A"
export function iniciaisDoNome(nome) {
    const partes = String(nome || "").trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return "";

    const primeira = Array.from(partes[0])[0];
    if (partes.length === 1) return primeira.toUpperCase();

    const ultima = Array.from(partes[partes.length - 1])[0];
    return (primeira + ultima).toUpperCase();
}

const ROTULOS_TIPO = {
    administracao: "Administração",
    manutencao: "Manutenção",
    geral: "Geral",
};

export function rotuloTipoUsuario(tipo) {
    const chave = String(tipo || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

    return ROTULOS_TIPO[chave] || (tipo ? String(tipo) : "");
}

// Aceita o caminho relativo do backend (caminho_imagem), URLs absolutas e URIs locais
export function urlFotoUsuario(usuario) {
    const origem = usuario?.foto_local || usuario?.caminho_imagem;

    if (!origem || typeof origem !== "string") return null;
    if (/^(https?:|file:|content:|data:)/i.test(origem)) return origem;

    const base = String(BASE_URL || "").replace(/\/$/, "");
    return `${base}${origem.startsWith("/") ? "" : "/"}${origem}`;
}

export function formatarCpf(cpf) {
    const numeros = String(cpf || "").replace(/\D/g, "");
    if (numeros.length !== 11) return String(cpf || "");
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// O login só devolve token, id, nome e tipo. Aqui completa e-mail, CPF e foto
// uma única vez por sessão. Falhas são silenciosas (a tela segue com o que tem).
export async function sincronizarUsuarioLogado({ forcar = false } = {}) {
    const atual = await obterUsuarioAtual();
    if (!atual) return null;
    if (atual.sincronizado && !forcar) return atual;

    try {
        const token = await obterToken();
        if (!token) return atual;

        const resposta = await buscarMeuPerfil(token);
        const perfil = resposta?.result;
        if (!perfil) return atual;

        const mesclado = {
            ...atual,
            nome: perfil.nome || atual.nome,
            email: perfil.email || atual.email || "",
            cpf: perfil.cpf || atual.cpf || "",
            caminho_imagem: perfil.caminho_imagem || atual.caminho_imagem || null,
            sincronizado: true,
        };
        if (perfil.caminho_imagem) delete mesclado.foto_local;

        await salvarUsuario(mesclado);
        return mesclado;
    } catch {
        return atual;
    }
}
