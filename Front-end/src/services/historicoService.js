import { api } from "./api.js";

function cabecalho(token) {
    if (!token) throw new Error("Erro: token inválido");
    return { headers: { Authorization: `Bearer ${token}` } };
}

// filtros: { acao, de, ate, id_sala, id_patrimonio, pagina, limite }
export async function listarHistorico(token, filtros = {}) {
    const params = {};
    Object.entries(filtros).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') params[chave] = valor;
    });

    const resposta = await api.get('/historicos', { ...cabecalho(token), params });
    return resposta.data; // { result, total, pagina, limite }
}

export async function obterLinhaDoTempo(token, idRequisicao) {
    if (!idRequisicao) throw new Error("Erro: requisição inválida");
    const resposta = await api.get(`/historicos/requisicao/${idRequisicao}`, cabecalho(token));
    return resposta.data; // { result: { requisicao, eventos } }
}

// Patrimônios para o filtro (da sala escolhida ou de todas)
export async function listarPatrimoniosParaFiltro(token, idSala) {
    const url = idSala ? `/patrimonios/sala/${idSala}` : '/patrimonios';
    const resposta = await api.get(url, cabecalho(token));
    return resposta.data; // { result: [...] }
}
