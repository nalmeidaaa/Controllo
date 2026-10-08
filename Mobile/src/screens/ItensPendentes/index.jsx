import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarMinhasRequisicoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoGeralService.js";
import BadgeStatusRequisicao from "../../components/geral/BadgeStatusRequisicao.jsx";

const iconColor = "#c9131c";

function formatarData(isoString) {
    if (!isoString) return "";

    const data = new Date(isoString);

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ItensPendentesScreen() {
    const navigation = useNavigation();

    const [requisicoes, setRequisicoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState(false);

    async function carregarRequisicoes(puxar = false) {
        try {
            if (puxar) setAtualizando(true);
            else setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await buscarMinhasRequisicoes(token);

            // a ordem já vem pronta do servidor: não reordenar
            setRequisicoes(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao carregar itens pendentes", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarRequisicoes();
        }, [])
    );

    function renderItem({ item }) {
        const concluida = item.status_requisicao === "Concluído";

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                    navigation.navigate("RequisicaoDetalheScreen", {
                        idRequisicao: item.id_requisicao,
                    })
                }
            >
                <View
                    style={[
                        styles.iconWrapper,
                        concluida ? styles.iconWrapperOk : styles.iconWrapperPendente,
                    ]}
                >
                    {concluida ? (
                        <CheckCircle2 color="#1f9254" size={22} />
                    ) : (
                        <Clock color="#c9131c" size={22} />
                    )}
                </View>

                <View style={styles.cardText}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.patrimonio?.nome}
                        {item.patrimonio?.numero_patrimonio
                            ? ` • Nº ${item.patrimonio.numero_patrimonio}`
                            : ""}
                    </Text>

                    {!!item.sala?.descricao && (
                        <Text style={styles.cardSubtitle}>{item.sala.descricao}</Text>
                    )}

                    {!!item.descricao && (
                        <Text style={styles.cardDescricao} numberOfLines={2}>
                            {item.descricao}
                        </Text>
                    )}

                    <Text style={styles.cardData}>
                        {concluida
                            ? `Concluída em ${formatarData(item.data_conclusao)}`
                            : `Criada em ${formatarData(item.abertura)}`}
                    </Text>
                </View>

                <BadgeStatusRequisicao status={item.status_requisicao} />
            </TouchableOpacity>
        );
    }

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
                        <Text style={styles.title}>Itens pendentes</Text>
                    </View>
                </View>

                {carregando ? (
                    <View style={styles.centro}>
                        <ActivityIndicator size="large" color={iconColor} />
                    </View>
                ) : erro ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>
                            Não foi possível carregar as requisições.
                        </Text>
                        <TouchableOpacity
                            style={styles.botaoTentar}
                            onPress={() => carregarRequisicoes()}
                        >
                            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={requisicoes}
                        keyExtractor={(item) => String(item.id_requisicao)}
                        contentContainerStyle={[
                            styles.lista,
                            requisicoes.length === 0 && styles.listaVazia,
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={atualizando}
                                onRefresh={() => carregarRequisicoes(true)}
                                colors={[iconColor]}
                                tintColor={iconColor}
                            />
                        }
                        ListEmptyComponent={
                            <Text style={styles.mensagemVazia}>
                                Nenhuma requisição foi feita até o momento
                            </Text>
                        }
                        renderItem={renderItem}
                    />
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
    lista: { gap: 14, paddingBottom: 40 },
    listaVazia: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
    card: {
        alignItems: "flex-start",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "#fce9e9",
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    iconWrapperOk: { backgroundColor: "#e3f7ea" },
    iconWrapperPendente: { backgroundColor: "#ffd8d8" },
    cardText: { flex: 1, marginRight: 8 },
    cardTitle: { color: "#270d0d", fontSize: 15, fontWeight: "600" },
    cardSubtitle: { color: "#8a7373", fontSize: 12, marginTop: 2 },
    cardDescricao: { color: "#5a4646", fontSize: 12, marginTop: 4 },
    cardData: { color: "#a99", fontSize: 11, marginTop: 6 },
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
