import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, Box } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import { buscarPatrimoniosPorSala } from "../../services/patrimonioService.js";
import {
    buscarRequisicaoAbertaPorPatrimonio,
    ehErroDeSessao,
    encerrarSessaoExpirada,
    mensagemDeErro,
} from "../../services/requisicaoGeralService.js";
import { BASE_URL } from "../../services/api.js";
import { obterEstiloStatus } from "../../utils/statusPatrimonio.js";

const iconColor = "#c9131c";

export default function SalaDetalheScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const { idSala, nomeSala } = route.params || {};

    const [patrimonios, setPatrimonios] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);
    const [abrindoId, setAbrindoId] = useState(null);

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
            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            setCarregando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarPatrimonios();
        }, [idSala])
    );

    async function abrirPatrimonio(patrimonio) {
        if (abrindoId) return;

        if (patrimonio.status === "Ok") {
            navigation.navigate("NovaRequisicaoScreen", {
                patrimonio,
                idSala,
                nomeSala,
            });
            return;
        }

        if (patrimonio.status !== "Pendente") return;

        try {
            setAbrindoId(patrimonio.id_patrimonio);
            const token = await obterToken();
            const resposta = await buscarRequisicaoAbertaPorPatrimonio(
                token,
                patrimonio.id_patrimonio
            );
            const aberta = resposta?.result;

            if (!aberta) throw new Error("Resposta inválida");

            if (aberta.propria === false) {
                Alert.alert(
                    "Requisição em aberto",
                    `Este patrimônio já possui uma requisição em aberto (${aberta.status_requisicao}) feita por outro usuário.`
                );
                return;
            }

            navigation.navigate("RequisicaoDetalheScreen", {
                idRequisicao: aberta.id_requisicao,
            });
        } catch (error) {
            console.error("Erro ao buscar requisição aberta", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }

            Alert.alert(
                "Erro",
                mensagemDeErro(error, "Não foi possível abrir a requisição deste patrimônio.")
            );

            if (error?.response?.status === 404) carregarPatrimonios();
        } finally {
            setAbrindoId(null);
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
                            const urlImagem = item.caminho_imagem || item.imagem || item.foto;

                            return (
                                <TouchableOpacity
                                    style={styles.card}
                                    activeOpacity={0.8}
                                    disabled={abrindoId !== null}
                                    onPress={() => abrirPatrimonio(item)}
                                >
                                    {urlImagem ? (
                                        <Image
                                            source={{ uri: `${BASE_URL}${urlImagem}` }}
                                            style={styles.patrimonioImagem}
                                        />
                                    ) : (
                                        <View style={styles.iconWrapper}>
                                            <Box color={iconColor} size={22} />
                                        </View>
                                    )}

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

                                    {abrindoId === item.id_patrimonio ? (
                                        <ActivityIndicator color={iconColor} />
                                    ) : (
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
                                    )}
                                </TouchableOpacity>
                            );
                        }}
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
        gap: 16,
        paddingBottom: 40,
    },
    card: {
        minHeight: 84,
        alignItems: "center",
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 22,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#fce9e9",
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        backgroundColor: "#ffd8d8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    patrimonioImagem: {
        width: 48,
        height: 48,
        borderRadius: 10,
        marginRight: 16,
        backgroundColor: "#ffd8d8", 
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        color: "#270d0d",
        fontSize: 16,
        fontWeight: "600",
    },
    cardSubtitle: {
        color: "#8a7373",
        fontSize: 13,
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    badgeTexto: {
        fontSize: 12,
        fontWeight: "600",
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
