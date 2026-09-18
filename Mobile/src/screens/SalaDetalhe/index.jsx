import React, { useCallback, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, Box } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarPatrimoniosPorSala,
    atualizarStatusPatrimonio,
} from "../../services/patrimonioService.js";
import { criarRequisicao } from "../../storage/requisicao/requisicoes.storage.js";
import { obterEstiloStatus } from "../../utils/statusPatrimonio.js";
import ModalStatusPatrimonio from "../../components/ModalStatusPatrimonio.jsx";

const iconColor = "#c9131c";

export default function SalaDetalheScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { idSala, nomeSala } = route.params || {};

    const [patrimonios, setPatrimonios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    const [patrimonioSelecionado, setPatrimonioSelecionado] = useState(null);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [salvando, setSalvando] = useState(false);

    async function carregarPatrimonios() {
        try {
            setCarregando(true);
            setErro(false);

            const token = await obterToken();
            if (!token) return;

            const resposta = await buscarPatrimoniosPorSala(token, idSala);
            setPatrimonios(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao buscar patrimônios", error);
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarPatrimonios();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [idSala])
    );

    function abrirModal(patrimonio) {
        setPatrimonioSelecionado(patrimonio);
        setModalVisivel(true);
    }

    function fecharModal() {
        if (salvando) return;
        setModalVisivel(false);
        setPatrimonioSelecionado(null);
    }

    async function salvarAtualizacao({ status, descricao }) {
        if (!patrimonioSelecionado) return;

        try {
            setSalvando(true);

            const token = await obterToken();

            await atualizarStatusPatrimonio(
                token,
                patrimonioSelecionado.id_patrimonio,
                status
            );

            await criarRequisicao({
                idPatrimonio: patrimonioSelecionado.id_patrimonio,
                nomePatrimonio: patrimonioSelecionado.nome,
                numeroPatrimonio: patrimonioSelecionado.numero_patrimonio,
                idSala,
                nomeSala,
                statusAnterior: patrimonioSelecionado.status,
                statusNovo: status,
                descricao,
            });

            setModalVisivel(false);
            setPatrimonioSelecionado(null);

            await carregarPatrimonios();
        } catch (error) {
            console.error("Erro ao atualizar patrimônio", error);
            Alert.alert(
                "Erro",
                "Não foi possível atualizar o patrimônio. Tente novamente."
            );
        } finally {
            setSalvando(false);
        }
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
                        <Text style={styles.eyebrow}>Sala</Text>
                        <Text style={styles.title} numberOfLines={1}>
                            {nomeSala || "Patrimônios"}
                        </Text>
                    </View>
                </View>

                {carregando ? (
                    <View style={styles.centro}>
                        <ActivityIndicator size="large" color={iconColor} />
                    </View>
                ) : erro ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>
                            Não foi possível carregar os patrimônios.
                        </Text>
                    </View>
                ) : patrimonios.length === 0 ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>
                            Nenhum patrimônio cadastrado nesta sala.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={patrimonios}
                        keyExtractor={(item) => String(item.id_patrimonio)}
                        contentContainerStyle={styles.lista}
                        renderItem={({ item }) => {
                            const estiloStatus = obterEstiloStatus(item.status);

                            return (
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.8}
                                    onPress={() => abrirModal(item)}
                                >
                                    <View style={styles.iconWrapper}>
                                        <Box color={iconColor} size={22} />
                                    </View>

                                    <View style={styles.cardText}>
                                        <Text style={styles.cardTitle} numberOfLines={1}>
                                            {item.nome}
                                        </Text>

                                        {!!item.numero_patrimonio && (
                                            <Text style={styles.cardSubtitle}>
                                                Nº {item.numero_patrimonio}
                                            </Text>
                                        )}
                                    </View>

                                    <View
                                        style={[
                                            styles.badge,
                                            { backgroundColor: estiloStatus.bg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.badgeTexto,
                                                { color: estiloStatus.texto },
                                            ]}
                                        >
                                            {item.status}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>

            <ModalStatusPatrimonio
                visivel={modalVisivel}
                patrimonio={patrimonioSelecionado}
                salvando={salvando}
                onFechar={fecharModal}
                onSalvar={salvarAtualizacao}
            />
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
        fontSize: 22,
        fontWeight: "600",
        letterSpacing: -0.5,
        marginTop: 4,
    },

    lista: {
        gap: 14,
        paddingBottom: 40,
    },

    card: {
        minHeight: 76,
        alignItems: "center",
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
        width: 44,
        height: 44,
        backgroundColor: "#ffd8d8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
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

    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginLeft: 10,
    },

    badgeTexto: {
        fontSize: 12,
        fontWeight: "700",
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