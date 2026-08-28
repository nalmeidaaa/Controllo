import { api } from "./api.js";

const API_URL = api.defaults.baseURL;

// Função auxiliar para evitar barra dupla // ou falta de barra /
const formatarUrl = (caminho) => {
    if (!caminho) return null;
    if (caminho.startsWith('http')) return caminho;
    
    const urlBaseLimpa = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const caminhoLimpo = caminho.startsWith('/') ? caminho : `/${caminho}`;
    
    return `${urlBaseLimpa}${caminhoLimpo}`;
};

export function urlImagemSala(sala) {
    // Tenta pegar o caminho_imagem ou outros nomes comuns retornados pelo BD
    const caminho = sala?.caminho_imagem || sala?.imagem || sala?.foto;
    return formatarUrl(caminho);
}

export function urlImagemUsuario(usuario) {
    const caminho = usuario?.caminho_imagem || usuario?.imagem || usuario?.foto;
    return formatarUrl(caminho);
}

export function urlImagemPatrimonio(patrimonio) {
    const caminho = patrimonio?.caminho_imagem || patrimonio?.imagem || patrimonio?.foto;
    return formatarUrl(caminho);
}