import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    RefreshControl,
    SafeAreaView,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
    CheckCircle2,
    Clock,
    Send,
    AlertCircle,
    ArrowLeft,
    Search,
    Bell,
} from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarAtualizacoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoGeralService.js";

function formatarData(isoString) {
    if (!isoString) return "";

    const data = new Date(isoString);

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const TIPOS = {
    Abertura: { titulo: "Requisição enviada", fundo: "#fff4d6", Icone: Send, cor: "#a5710a" },
    Andamento: { titulo: "Requisição em andamento", fundo: "#ffd8d8", Icone: Clock, cor: "#c9131c" },
    Finalizacao: { titulo: "Requisição concluída!", fundo: "#e3f7ea", Icone: CheckCircle2, cor: "#1f9254" },
};

export default function TodasAtualizacoesScreen() {
    const navigation = useNavigation();

    const [atualizacoes, setAtualizacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [renovando, setRenovando] = useState(false);
    const [erro, setErro] = useState(false);
    const [busca, setBusca] = useState("");

    const carregarDados = async (silencioso = false) => {
        try {
            if (!silencioso) setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await buscarAtualizacoes(token);

            setAtualizacoes(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao carregar todas as atualizações", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            setCarregando(false);
            setRenovando(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            carregarDados();
        }, [])
    );

    const aoRecarregar = () => {
        setRenovando(true);
        carregarDados(true);
    };

    // Filtra por patrimônio, sala ou descrição da requisição
    const atualizacoesFiltradas = atualizacoes.filter((item) => {
        const termo = busca.toLowerCase().trim();
        if (!termo) return true;

        const patrimonio = item.requisicao?.patrimonio?.nome?.toLowerCase() || "";
        const sala = item.requisicao?.sala?.descricao?.toLowerCase() || "";
        const descricao = (item.descricao || item.requisicao?.descricao || "").toLowerCase();

        return patrimonio.includes(termo) || sala.includes(termo) || descricao.includes(termo);
    });

    const renderCard = ({ item }) => {
        const tipo = TIPOS[item.acao] || TIPOS.Abertura;
        const Icone = tipo.Icone;
        const requisicao = item.requisicao || {};
        const descricao =
            item.acao === "Finalizacao"
                ? item.descricao || requisicao.descricao
                : requisicao.descricao;

        return (
            <TouchableOpacity
                activeOpacity={0.8}
                style={styles.card}
                onPress={() =>
                    navigation.navigate("RequisicaoDetalheScreen", {
                        idRequisicao: requisicao.id_requisicao,
                    })
                }
            >
                <View style={[styles.iconWrapper, { backgroundColor: tipo.fundo }]}>
                    <Icone color={tipo.cor} size={22} />
                </View>

                <View style={styles.textWrapper}>
                    <Text style={styles.titulo}>{tipo.titulo}</Text>

                    <Text style={styles.subtitulo}>
                        {requisicao.patrimonio?.nome}
                        {requisicao.sala?.descricao ? ` • ${requisicao.sala.descricao}` : ""}
                    </Text>

                    {!!descricao && (
                        <Text style={styles.descricao} numberOfLines={3}>
                            {descricao}
                        </Text>
                    )}

                    <Text style={styles.data}>{formatarData(item.horario)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.botaoVoltar}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#270d0d" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitulo}>Mural Completo</Text>
            </View>

            {/* Barra de Pesquisa */}
            <View style={styles.searchContainer}>
                <Search color="#8a8a8a" size={20} style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por patrimônio, sala ou descrição..."
                    placeholderTextColor="#8a8a8a"
                    value={busca}
                    onChangeText={setBusca}
                />
            </View>

            {/* Conteúdo Principal */}
            {carregando ? (
                <View style={styles.containerCentralizado}>
                    <ActivityIndicator color="#c9131c" size="large" />
                    <Text style={styles.textoCarregando}>Carregando atualizações...</Text>
                </View>
            ) : erro ? (
                <View style={styles.containerCentralizado}>
                    <AlertCircle color="#c9131c" size={48} />
                    <Text style={styles.textoErroTitulo}>Não foi possível carregar</Text>
                    <Text style={styles.textoErroSubtitulo}>
                        Ocorreu um problema ao buscar o histórico.
                    </Text>
                    <TouchableOpacity style={styles.botaoTentarNovamente} onPress={() => carregarDados()}>
                        <Text style={styles.textoBotaoTentarNovamente}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={atualizacoesFiltradas}
                    keyExtractor={(item) => String(item.id_historico)}
                    renderItem={renderCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={renovando}
                            onRefresh={aoRecarregar}
                            colors={["#c9131c"]}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.containerVazio}>
                            <Bell color="#8a8a8a" size={40} />
                            <Text style={styles.textoVazioTitulo}>Nenhuma atualização encontrada</Text>
                            <Text style={styles.textoVazioSubtitulo}>
                                {busca
                                    ? "Tente buscar com outros termos."
                                    : "Não há atualizações registradas no momento."}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#eaeaea",
    },

    botaoVoltar: {
        padding: 4,
        marginRight: 12,
    },

    headerTitulo: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#270d0d",
    },

    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        height: 46,
    },

    searchIcon: {
        marginRight: 8,
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#270d0d",
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        gap: 12,
    },

    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: "rgb(239, 239, 239)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
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

    textWrapper: {
        flex: 1,
    },

    titulo: {
        color: "#270d0d",
        fontSize: 15,
        fontWeight: "700",
    },

    subtitulo: {
        color: "#5a4646",
        fontSize: 13,
        marginTop: 2,
    },

    descricao: {
        color: "#7a6a6a",
        fontSize: 12,
        marginTop: 4,
    },

    data: {
        color: "#a99",
        fontSize: 11,
        marginTop: 6,
    },

    containerCentralizado: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },

    textoCarregando: {
        marginTop: 12,
        color: "#7a6a6a",
        fontSize: 14,
    },

    textoErroTitulo: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#270d0d",
        marginTop: 12,
    },

    textoErroSubtitulo: {
        fontSize: 13,
        color: "#7a6a6a",
        textAlign: "center",
        marginTop: 4,
        marginBottom: 16,
    },

    botaoTentarNovamente: {
        backgroundColor: "#c9131c",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },

    textoBotaoTentarNovamente: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: 14,
    },

    containerVazio: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
    },

    textoVazioTitulo: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#270d0d",
        marginTop: 12,
    },

    textoVazioSubtitulo: {
        fontSize: 13,
        color: "#7a6a6a",
        textAlign: "center",
        marginTop: 4,
    },
});