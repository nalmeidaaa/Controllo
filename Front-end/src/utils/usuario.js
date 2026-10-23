import { api } from '../services/api.js';
import { buscarUsuarios } from '../services/usuarioService.js';
import { obterUsuarioAtual, obterToken, salvarUsuario } from '../storage/usuario/dados.storage.js';

// ------------------------------------------------------------
// Token (JWT) – usado só como último recurso para achar o nome
// ------------------------------------------------------------
function payloadDoToken(token) {
    try {
        const corpo = String(token || '').split('.')[1];
        if (!corpo) return null;
        const json = decodeURIComponent(
            atob(corpo.replace(/-/g, '+').replace(/_/g, '/'))
                .split('')
                .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('')
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// ------------------------------------------------------------
// Nome
// O login pode devolver o nome em chaves diferentes (ou aninhado),
// então procuramos nos lugares mais prováveis.
// ------------------------------------------------------------
export function nomeDoUsuario(usuario) {
    if (!usuario) return '';
    const direto =
        usuario.nome ||
        usuario.name ||
        usuario.nome_completo ||
        usuario.nome_usuario ||
        usuario.usuario?.nome ||
        usuario.user?.nome ||
        usuario.user?.name;
    if (direto && String(direto).trim()) return String(direto).trim();

    const payload = payloadDoToken(usuario.token);
    return String(payload?.nome || payload?.name || '').trim();
}

export function primeiroNome(usuario) {
    return nomeDoUsuario(usuario).split(/\s+/)[0] || '';
}

export function idDoUsuario(usuario) {
    return usuario?.id_usuario ?? usuario?.id ?? usuario?.usuario?.id_usuario ?? payloadDoToken(usuario?.token)?.id ?? null;
}

// ------------------------------------------------------------
// Iniciais: primeira letra do primeiro e do último nome
// "Maria da Silva" -> "MS" | "Ana" -> "A"
// ------------------------------------------------------------
export function iniciaisDoNome(nome) {
    const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '';
    const primeira = Array.from(partes[0])[0];
    if (partes.length === 1) return primeira.toUpperCase();
    const ultima = Array.from(partes[partes.length - 1])[0];
    return (primeira + ultima).toUpperCase();
}

// ------------------------------------------------------------
// Foto
// Aceita o caminho relativo do backend (caminho_imagem) e também
// URLs absolutas / data URLs.
// ------------------------------------------------------------
export function urlFotoUsuario(usuario) {
    const origem =
        usuario?.foto_local ||
        usuario?.caminho_imagem ||
        usuario?.imagem_url ||
        usuario?.foto ||
        usuario?.imagem ||
        usuario?.usuario?.caminho_imagem;

    if (!origem || typeof origem !== 'string') return null;
    if (/^(https?:|data:|blob:)/i.test(origem)) return origem;

    const base = String(api.defaults.baseURL || '').replace(/\/$/, '');
    return `${base}${origem.startsWith('/') ? '' : '/'}${origem}`;
}

// Reduz a foto escolhida para um data URL pequeno (cabe no sessionStorage)
export function arquivoParaMiniatura(arquivo, lado = 256) {
    return new Promise((resolve) => {
        const leitor = new FileReader();
        leitor.onerror = () => resolve(null);
        leitor.onload = () => {
            const img = new Image();
            img.onerror = () => resolve(null);
            img.onload = () => {
                const escala = Math.min(1, lado / Math.min(img.width, img.height));
                const largura = Math.round(img.width * escala);
                const altura = Math.round(img.height * escala);
                const canvas = document.createElement('canvas');
                canvas.width = largura;
                canvas.height = altura;
                canvas.getContext('2d').drawImage(img, 0, 0, largura, altura);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.src = leitor.result;
        };
        leitor.readAsDataURL(arquivo);
    });
}

// ------------------------------------------------------------
// Rótulo do tipo de usuário
// ------------------------------------------------------------
const ROTULOS_TIPO = {
    administracao: 'Administração',
    manutencao: 'Manutenção',
    geral: 'Geral',
};

export function rotuloTipoUsuario(tipo) {
    const chave = String(tipo || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    return ROTULOS_TIPO[chave] || (tipo ? String(tipo) : '');
}

// ------------------------------------------------------------
// Completa os dados do usuário logado (nome e foto) buscando na lista
// de usuários, caso o login não tenha devolvido tudo. Falhas (ex.: 403
// para perfis sem acesso à lista) são silenciosas.
// ------------------------------------------------------------
export async function sincronizarUsuarioLogado({ forcar = false } = {}) {
    const atual = obterUsuarioAtual();
    if (!atual) return null;
    if (atual.sincronizado && !forcar) return atual;

    try {
        const token = obterToken();
        const id = idDoUsuario(atual);
        if (!token || id == null) return atual;

        const resposta = await buscarUsuarios(token);
        const lista = Array.isArray(resposta?.result) ? resposta.result : [];
        const encontrado = lista.find((u) => String(u.id_usuario ?? u.id) === String(id));
        if (!encontrado) return atual;

        const mesclado = {
            ...atual,
            nome: encontrado.nome || atual.nome,
            email: encontrado.email || atual.email,
            cpf: encontrado.cpf || atual.cpf,
            tipo_usuario: encontrado.tipo_usuario || atual.tipo_usuario,
            caminho_imagem: encontrado.caminho_imagem || atual.caminho_imagem || null,
            sincronizado: true,
        };
        if (encontrado.caminho_imagem) delete mesclado.foto_local;
        salvarUsuario(mesclado);
        return mesclado;
    } catch {
        return atual;
    }
}
