import { Alert } from "react-native";
import { api } from "./api.js";
import { deslogarUsuario } from "../storage/usuario/dados.storage.js";

function cabecalho(token) {
    if (!token) throw new Error("Erro: token inválido");
    return { headers: { Authorization: `Bearer ${token}` } };
}

// status: "Pendente" | "Em andamento" | "Concluído" | undefined (todas)
export async function listarRequisicoes(token, { pagina = 1, limite = 10, status } = {}) {
    const params = { pagina, limite };
    if (status) params.status = status;

    const resposta = await api.get("/requisicoes", { ...cabecalho(token), params });
    return resposta.data; // { result, total, pagina, limite }
}

export async function buscarRequisicaoPorId(token, id) {
    if (!id) throw new Error("Erro: id da requisição inválido");
    const resposta = await api.get(`/requisicoes/${id}`, cabecalho(token));
    return resposta.data;
}

export async function assumirRequisicao(token, id) {
    if (!id) throw new Error("Erro: id da requisição inválido");
    const resposta = await api.put(`/requisicoes/${id}/assumir`, {}, cabecalho(token));
    return resposta.data;
}

export async function concluirRequisicao(token, id, descricao) {
    if (!id) throw new Error("Erro: id da requisição inválido");
    const resposta = await api.put(
        `/requisicoes/${id}/concluir`,
        { descricao },
        cabecalho(token)
    );
    return resposta.data;
}

export function ehErroDeSessao(error) {
    return error?.response?.status === 401;
}

export function mensagemDeErro(error, padrao) {
    if (error?.response?.data?.message) return error.response.data.message;
    if (!error?.response) return "Sem conexão com o servidor. Verifique sua internet.";
    return padrao;
}

export async function encerrarSessaoExpirada(navigation) {
    await deslogarUsuario();
    Alert.alert("Sessão expirada", "Faça login novamente para continuar.");
    navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
}
