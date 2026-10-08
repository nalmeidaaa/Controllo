import { Alert } from "react-native";
import { api } from "./api.js";
import { deslogarUsuario } from "../storage/usuario/dados.storage.js";

function cabecalho(token) {
    if (!token) throw new Error("Erro: token inválido");
    return { headers: { Authorization: `Bearer ${token}` } };
}

export async function buscarAtualizacoes(token) {
    const resposta = await api.get("/requisicoes/atualizacoes", cabecalho(token));
    return resposta.data;
}

export async function buscarMinhasRequisicoes(token) {
    const resposta = await api.get("/requisicoes/minhas", cabecalho(token));
    return resposta.data;
}

export async function buscarRequisicaoAbertaPorPatrimonio(token, idPatrimonio) {
    if (!idPatrimonio) throw new Error("Erro: id do patrimônio inválido");
    const resposta = await api.get(
        `/requisicoes/patrimonio/${idPatrimonio}/aberta`,
        cabecalho(token)
    );
    return resposta.data;
}

export async function buscarRequisicaoPorId(token, idRequisicao) {
    if (!idRequisicao) throw new Error("Erro: id da requisição inválido");
    const resposta = await api.get(`/requisicoes/${idRequisicao}`, cabecalho(token));
    return resposta.data;
}

// prioridade: "Alta" | "Media" (sem acento) | "Baixa"
export async function criarRequisicao(token, { idPatrimonio, descricao, prioridade }) {
    if (!idPatrimonio) throw new Error("Erro: id do patrimônio inválido");
    const resposta = await api.post(
        "/requisicoes",
        { id_patrimonio: idPatrimonio, descricao, prioridade },
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

// Token expirado (1h): avisa e leva ao login
export async function encerrarSessaoExpirada(navigation) {
    await deslogarUsuario();
    Alert.alert("Sessão expirada", "Faça login novamente para continuar.");
    navigation.reset({ index: 0, routes: [{ name: "LoginScreen" }] });
}
