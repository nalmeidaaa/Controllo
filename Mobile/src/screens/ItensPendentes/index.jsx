import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import { buscarPatrimonios } from "../../services/patrimonioService.js";
import {
    listarRequisicoes,
    sincronizarComPatrimonios,
} from "../../storage/requisicao/requisicoes.storage.js";

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

function ordenarRequisicoes(lista) {
    const emAndamento = lista
        .filter((item) => !item.concluida)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    const concluidas = lista
        .filter((item) => item.concluida)
        .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

    return [...emAndamento, ...concluidas];
}

export default function ItensPendentesScreen() {
    const navigation = useNavigation();

    const [requisicoes, setRequisicoes] = useState([]);
    const [carregando, setCarregando] = useState(true);

    async function carregarRequisicoes() {
        try {
            setCarregando(true);

            const token = await obterToken();

            let lista = await listarRequisicoes();

            if (token) {
                try {
                    const resposta = await buscarPatrimonios(token);
                    lista = await sincronizarComPatrimonios(resposta?.result ?? []);
                } catch (error) {
                    console.error("Erro ao sincronizar patrimônios", error);
                }
            }

            setRequisicoes(ordenarRequisicoes(lista));
        } catch (error) {
            console.error("Erro ao carregar itens pendentes", error);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarRequisicoes();
        }, [])
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
                        <Text style={styles.title}>Itens pendentes</Text>
                    </View>
                </View>

                {carregando ? (
                    <View style={styles.centro}>
                        <ActivityIndicator size="large" color={iconColor} />
                    </View>
                ) : requisicoes.length === 0 ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>
                            Nenhuma requisição foi feita até o momento.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={requisicoes}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.lista}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View
                                    style={[
                                        styles.iconWrapper,
                                        item.concluida
                                            ? styles.iconWrapperOk
                                            : styles.iconWrapperPendente,
                                    ]}
                                >
                                    {item.concluida ? (
                                        <CheckCircle2 color="#1f9254" size={22} />
                                    ) : (
                                        <Clock color="#c9131c" size={22} />
                                    )}
                                </View>

                                <View style={styles.cardText}>
                                    <Text style={styles.cardTitle} numberOfLines={1}>
                                        {item.nomePatrimonio}
                                    </Text>

                                    {!!item.nomeSala && (
                                        <Text style={styles.cardSubtitle}>
                                            {item.nomeSala}
                                        </Text>
                                    )}

                                    {!!item.descricao && (
                                        <Text style={styles.cardDescricao} numberOfLines={2}>
                                            {item.descricao}
                                        </Text>
                                    )}

                                    <Text style={styles.cardData}>
                                        {item.concluida
                                            ? `Concluída em ${formatarData(item.concluidoEm)}`
                                            : `Criada em ${formatarData(item.criadoEm)}`}
                                    </Text>
                                </View>

                                <View
                                    style={[
                                        styles.badge,
                                        item.concluida
                                            ? styles.badgeOk
                                            : styles.badgePendente,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.badgeTexto,
                                            item.concluida
                                                ? styles.badgeTextoOk
                                                : styles.badgeTextoPendente,
                                        ]}
                                    >
                                        {item.concluida ? "Concluída" : "Em andamento"}
                                    </Text>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f4f7f7",
    },

    container: {
        flex: 1,
        paddingHorizontal: 28,
        paddingTop: 40,
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 28,
    },

    voltarButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#ffd8d8",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    heading: {
        flex: 1,
    },

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

    lista: {
        gap: 14,
        paddingBottom: 40,
    },

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

    iconWrapperOk: {
        backgroundColor: "#e3f7ea",
    },

    iconWrapperPendente: {
        backgroundColor: "#ffd8d8",
    },

    cardText: {
        flex: 1,
    },

    cardTitle: {
        color: "#270d0d",
        fontSize: 15,
        fontWeight: "600",
    },

    cardSubtitle: {
        color: "#8a7373",
        fontSize: 12,
        marginTop: 2,
    },

    cardDescricao: {
        color: "#5a4646",
        fontSize: 12,
        marginTop: 4,
    },

    cardData: {
        color: "#a99",
        fontSize: 11,
        marginTop: 6,
    },

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginLeft: 8,
    },

    badgeOk: {
        backgroundColor: "#e3f7ea",
    },

    badgePendente: {
        backgroundColor: "#ffd8d8",
    },

    badgeTexto: {
        fontSize: 11,
        fontWeight: "700",
    },

    badgeTextoOk: {
        color: "#1f9254",
    },

    badgeTextoPendente: {
        color: "#c9131c",
    },

    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 80,
    },

    mensagemVazia: {
        color: "#8a7373",
        fontSize: 14,
        textAlign: "center",
    },
});