import React, { useCallback, useRef, useState } from "react";
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
import { ArrowLeft } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    listarRequisicoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoManutencaoService.js";
import CardRequisicao from "../../components/manutencao/CardRequisicao.jsx";

const iconColor = "#c9131c";
const LIMITE = 10;

// valor = parâmetro `status` enviado à API
const FILTROS = [
    { label: "Todas", valor: undefined },
    { label: "Pendentes", valor: "Pendente" },
    { label: "Em andamento", valor: "Em andamento" },
    { label: "Concluídas", valor: "Concluído" },
];

export default function ManutencaoRequisicoesScreen() {
    const navigation = useNavigation();

    const [filtro, setFiltro] = useState(undefined);
    const [requisicoes, setRequisicoes] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erro, setErro] = useState(false);

    // descarta respostas de requisições antigas (troca rápida de filtro)
    const contador = useRef(0);

    async function carregar({ status, puxar = false } = {}) {
        const id = ++contador.current;

        try {
            if (puxar) setAtualizando(true);
            else setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await listarRequisicoes(token, { pagina: 1, limite: LIMITE, status });

            if (id !== contador.current) return;

            // a ordem já vem pronta do servidor: não reordenar
            setRequisicoes(resposta?.result ?? []);
            setTotal(resposta?.total ?? 0);
            setPagina(1);
        } catch (error) {
            console.error("Erro ao carregar requisições", error);
            if (id !== contador.current) return;

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            if (id === contador.current) {
                setCarregando(false);
                setAtualizando(false);
            }
        }
    }

    async function carregarMais() {
        if (carregando || atualizando || carregandoMais || erro) return;
        if (requisicoes.length >= total) return;

        const id = contador.current;

        try {
            setCarregandoMais(true);
            const token = await obterToken();
            const proxima = pagina + 1;
            const resposta = await listarRequisicoes(token, {
                pagina: proxima,
                limite: LIMITE,
                status: filtro,
            });

            if (id !== contador.current) return;

            const novos = resposta?.result ?? [];
            setRequisicoes((atual) => {
                const ids = new Set(atual.map((r) => r.id_requisicao));
                return [...atual, ...novos.filter((r) => !ids.has(r.id_requisicao))];
            });
            setTotal(resposta?.total ?? total);
            setPagina(proxima);
        } catch (error) {
            console.error("Erro ao carregar mais requisições", error);
            if (ehErroDeSessao(error)) encerrarSessaoExpirada(navigation);
        } finally {
            setCarregandoMais(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregar({ status: filtro });
        }, [filtro])
    );

    function trocarFiltro(valor) {
        if (valor === filtro) return;
        setRequisicoes([]);
        setTotal(0);
        setFiltro(valor); // o useFocusEffect recarrega
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

                <View style={styles.chips}>
                    {FILTROS.map((f) => {
                        const ativo = f.valor === filtro;
                        return (
                            <TouchableOpacity
                                key={f.label}
                                activeOpacity={0.8}
                                style={[styles.chip, ativo && styles.chipAtivo]}
                                onPress={() => trocarFiltro(f.valor)}
                            >
                                <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                                    {f.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
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
                            onPress={() => carregar({ status: filtro })}
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
                                onRefresh={() => carregar({ status: filtro, puxar: true })}
                                colors={[iconColor]}
                                tintColor={iconColor}
                            />
                        }
                        onEndReached={carregarMais}
                        onEndReachedThreshold={0.4}
                        ListEmptyComponent={
                            <Text style={styles.mensagemVazia}>Nenhuma requisição encontrada</Text>
                        }
                        ListFooterComponent={
                            carregandoMais ? (
                                <ActivityIndicator style={styles.rodape} color={iconColor} />
                            ) : null
                        }
                        renderItem={({ item }) => (
                            <CardRequisicao
                                requisicao={item}
                                onPress={() =>
                                    navigation.navigate("ManutencaoRequisicaoDetalheScreen", {
                                        idRequisicao: item.id_requisicao,
                                    })
                                }
                            />
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f4f7f7" },
    container: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
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
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e6d3d3",
        backgroundColor: "#fbf5f5",
    },
    chipAtivo: { backgroundColor: "#c9131c", borderColor: "#c9131c" },
    chipTexto: { color: "#5a4646", fontSize: 13, fontWeight: "600" },
    chipTextoAtivo: { color: "#ffffff" },
    lista: { gap: 14, paddingBottom: 40 },
    listaVazia: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
    rodape: { paddingVertical: 16 },
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
