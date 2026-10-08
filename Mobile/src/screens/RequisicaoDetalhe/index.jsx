import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarRequisicaoPorId,
    ehErroDeSessao,
    encerrarSessaoExpirada,
    mensagemDeErro,
} from "../../services/requisicaoGeralService.js";
import BadgeStatusRequisicao from "../../components/geral/BadgeStatusRequisicao.jsx";

const iconColor = "#c9131c";

const ACOES = {
    Abertura: "Requisição aberta",
    Andamento: "Em andamento",
    Finalizacao: "Finalização",
};

const PRIORIDADES = { Alta: "Alta", Media: "Média", Baixa: "Baixa" };

function formatarData(isoString) {
    if (!isoString) return "";

    return new Date(isoString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function RequisicaoDetalheScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { idRequisicao } = route.params || {};

    const [requisicao, setRequisicao] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);

    async function carregar() {
        try {
            setCarregando(true);
            setErro(null);

            const token = await obterToken();
            const resposta = await buscarRequisicaoPorId(token, idRequisicao);
            setRequisicao(resposta?.result ?? null);
        } catch (error) {
            console.error("Erro ao carregar requisição", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(mensagemDeErro(error, "Não foi possível carregar a requisição."));
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregar();
        }, [idRequisicao])
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.voltarButton}
                        activeOpacity={0.8}
                        onPress={() => navigation.goBack()}
                    >
                        <ArrowLeft color={iconColor} size={22} />
                    </TouchableOpacity>

                    <View style={styles.heading}>
                        <Text style={styles.eyebrow}>Controllo</Text>
                        <Text style={styles.title}>Requisição</Text>
                    </View>
                </View>

                {carregando ? (
                    <View style={styles.centro}>
                        <ActivityIndicator size="large" color={iconColor} />
                    </View>
                ) : erro || !requisicao ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>
                            {erro || "Requisição não encontrada."}
                        </Text>
                        <TouchableOpacity style={styles.botaoTentar} onPress={carregar}>
                            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.conteudo}>
                        <View style={styles.card}>
                            <Text style={styles.patrimonioNome}>
                                {requisicao.patrimonio?.nome}
                            </Text>
                            {!!requisicao.patrimonio?.numero_patrimonio && (
                                <Text style={styles.sub}>
                                    Nº {requisicao.patrimonio.numero_patrimonio}
                                </Text>
                            )}
                            {!!requisicao.sala?.descricao && (
                                <Text style={styles.sub}>
                                    {requisicao.sala.descricao}
                                    {requisicao.sala.bloco ? ` • Bloco ${requisicao.sala.bloco}` : ""}
                                </Text>
                            )}

                            <View style={styles.linhaBadges}>
                                <BadgeStatusRequisicao status={requisicao.status_requisicao} />
                                <Text style={styles.prioridade}>
                                    Prioridade: {PRIORIDADES[requisicao.prioridade] || requisicao.prioridade}
                                </Text>
                            </View>

                            <Text style={styles.secao}>Descrição</Text>
                            <Text style={styles.texto}>{requisicao.descricao}</Text>

                            {!!requisicao.responsavel && (
                                <>
                                    <Text style={styles.secao}>Responsável</Text>
                                    <Text style={styles.texto}>{requisicao.responsavel.nome}</Text>
                                </>
                            )}
                        </View>

                        <Text style={styles.tituloTimeline}>Linha do tempo</Text>

                        {(requisicao.historico ?? []).map((evento, indice, lista) => (
                            <View key={evento.id_historico} style={styles.eventoRow}>
                                <View style={styles.trilho}>
                                    <View style={styles.bolinha} />
                                    {indice < lista.length - 1 && <View style={styles.linha} />}
                                </View>

                                <View style={styles.eventoCard}>
                                    <Text style={styles.eventoTitulo}>
                                        {ACOES[evento.acao] || evento.acao}
                                    </Text>
                                    <Text style={styles.eventoData}>
                                        {formatarData(evento.horario)}
                                        {evento.usuario?.nome ? ` • ${evento.usuario.nome}` : ""}
                                    </Text>
                                    {!!evento.descricao && (
                                        <Text style={styles.eventoDescricao}>{evento.descricao}</Text>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f4f7f7" },
    container: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
    voltarButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#ffd8d8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    heading: { flex: 1 },
    eyebrow: {
        color: "#b01d2e",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.7,
    },
    title: {
        color: "#2d0e0e",
        fontSize: 24,
        fontWeight: "600",
        letterSpacing: -0.5,
        marginTop: 4,
    },
    conteudo: { paddingBottom: 40 },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fce9e9",
    },
    patrimonioNome: { color: "#270d0d", fontSize: 18, fontWeight: "700" },
    sub: { color: "#8a7373", fontSize: 13, marginTop: 2 },
    linhaBadges: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
    },
    prioridade: { color: "#5a4646", fontSize: 13, fontWeight: "600" },
    secao: { color: "#b01d2e", fontSize: 11, fontWeight: "600", textTransform: "uppercase", marginTop: 16 },
    texto: { color: "#270d0d", fontSize: 14, marginTop: 4 },
    tituloTimeline: {
        color: "#2d0e0e",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 12,
    },
    eventoRow: { flexDirection: "row" },
    trilho: { width: 20, alignItems: "center" },
    bolinha: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#c9131c", marginTop: 4 },
    linha: { flex: 1, width: 2, backgroundColor: "#f0d4d4" },
    eventoCard: { flex: 1, paddingLeft: 10, paddingBottom: 18 },
    eventoTitulo: { color: "#270d0d", fontSize: 14, fontWeight: "700" },
    eventoData: { color: "#a99", fontSize: 12, marginTop: 2 },
    eventoDescricao: { color: "#5a4646", fontSize: 13, marginTop: 4 },
    centro: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 },
    mensagemVazia: { color: "#8a7373", fontSize: 14, textAlign: "center" },
    botaoTentar: {
        marginTop: 14,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#c9131c",
    },
    botaoTentarTexto: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
});
