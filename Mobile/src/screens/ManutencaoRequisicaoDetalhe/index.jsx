import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { ArrowLeft, Box } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarRequisicaoPorId,
    assumirRequisicao,
    concluirRequisicao,
    ehErroDeSessao,
    encerrarSessaoExpirada,
    mensagemDeErro,
} from "../../services/requisicaoManutencaoService.js";
import { BASE_URL } from "../../services/api.js";
import BadgeStatusRequisicao from "../../components/manutencao/BadgeStatusRequisicao.jsx";
import BadgePrioridade from "../../components/manutencao/BadgePrioridade.jsx";
import ModalConcluir from "../../components/manutencao/ModalConcluir.jsx";

const iconColor = "#c9131c";

const ACOES = {
    Abertura: "Requisição aberta",
    Andamento: "Em andamento",
    Finalizacao: "Finalização",
};

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

export default function ManutencaoRequisicaoDetalheScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { idRequisicao } = route.params || {};

    const [requisicao, setRequisicao] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [executando, setExecutando] = useState(false);
    const [modalVisivel, setModalVisivel] = useState(false);
    const [erroModal, setErroModal] = useState(null);

    async function carregar(silencioso = false) {
        try {
            if (!silencioso) setCarregando(true);
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

    // 401 -> login; 409 -> mensagem + recarrega; outros -> mensagem
    async function tratarErroAcao(error, padrao, { fecharModal = false } = {}) {
        if (ehErroDeSessao(error)) {
            setModalVisivel(false);
            encerrarSessaoExpirada(navigation);
            return;
        }

        const mensagem = mensagemDeErro(error, padrao);

        if (error?.response?.status === 409) {
            setModalVisivel(false);
            Alert.alert("Atenção", mensagem);
            await carregar(true);
            return;
        }

        if (fecharModal) {
            setErroModal(mensagem);
        } else {
            Alert.alert("Erro", mensagem);
        }
    }

    function confirmarAssumir() {
        if (executando) return;

        Alert.alert("Assumir requisição", "Deseja assumir esta requisição?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Assumir", onPress: assumir },
        ]);
    }

    async function assumir() {
        try {
            setExecutando(true);
            const token = await obterToken();
            await assumirRequisicao(token, idRequisicao);
            await carregar(true);
        } catch (error) {
            console.error("Erro ao assumir requisição", error);
            await tratarErroAcao(error, "Não foi possível assumir a requisição.");
        } finally {
            setExecutando(false);
        }
    }

    function abrirModalConcluir() {
        if (executando) return;
        setErroModal(null);
        setModalVisivel(true);
    }

    async function concluir(observacao) {
        try {
            setExecutando(true);
            setErroModal(null);
            const token = await obterToken();
            await concluirRequisicao(token, idRequisicao, observacao);
            setModalVisivel(false);
            await carregar(true);
        } catch (error) {
            console.error("Erro ao concluir requisição", error);
            await tratarErroAcao(error, "Não foi possível concluir a requisição.", {
                fecharModal: true,
            });
        } finally {
            setExecutando(false);
        }
    }

    const status = requisicao?.status_requisicao;
    const eventoFinal = (requisicao?.historico ?? []).find((e) => e.acao === "Finalizacao");
    const urlImagem = requisicao?.patrimonio?.caminho_imagem;

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
                        <Text style={styles.eyebrow}>Manutenção</Text>
                        <Text style={styles.title}>Requisição</Text>
                    </View>
                </View>

                {carregando ? (
                    <View style={styles.centro}>
                        <ActivityIndicator size="large" color={iconColor} />
                    </View>
                ) : erro || !requisicao ? (
                    <View style={styles.centro}>
                        <Text style={styles.mensagemVazia}>{erro || "Requisição não encontrada."}</Text>
                        <TouchableOpacity style={styles.botaoTentar} onPress={() => carregar()}>
                            <Text style={styles.botaoTentarTexto}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <ScrollView contentContainerStyle={styles.conteudo}>
                            <View style={styles.card}>
                                <View style={styles.patrimonioRow}>
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
                                    <View style={styles.flex}>
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
                                                {requisicao.sala.bloco
                                                    ? ` • Bloco ${requisicao.sala.bloco}`
                                                    : ""}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.linhaBadges}>
                                    <BadgeStatusRequisicao status={status} />
                                    <BadgePrioridade prioridade={requisicao.prioridade} />
                                </View>

                                <Text style={styles.secao}>Descrição</Text>
                                <Text style={styles.texto}>{requisicao.descricao}</Text>

                                <Text style={styles.secao}>Solicitante</Text>
                                <Text style={styles.texto}>
                                    {requisicao.solicitante?.nome || "Usuário removido"}
                                </Text>

                                {!!requisicao.responsavel && (
                                    <>
                                        <Text style={styles.secao}>Responsável</Text>
                                        <Text style={styles.texto}>{requisicao.responsavel.nome}</Text>
                                    </>
                                )}

                                {status === "Concluído" && (
                                    <>
                                        <Text style={styles.secao}>Concluída em</Text>
                                        <Text style={styles.texto}>
                                            {formatarData(requisicao.data_conclusao)}
                                        </Text>
                                        {!!eventoFinal?.descricao && (
                                            <>
                                                <Text style={styles.secao}>Observação da conclusão</Text>
                                                <Text style={styles.texto}>{eventoFinal.descricao}</Text>
                                            </>
                                        )}
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

                        {status !== "Concluído" && (
                            <View style={styles.botoes}>
                                {status === "Pendente" && (
                                    <TouchableOpacity
                                        style={[styles.botaoSecundario, executando && styles.desabilitado]}
                                        activeOpacity={0.8}
                                        disabled={executando}
                                        onPress={confirmarAssumir}
                                    >
                                        {executando && !modalVisivel ? (
                                            <ActivityIndicator color={iconColor} />
                                        ) : (
                                            <Text style={styles.botaoSecundarioTexto}>Assumir</Text>
                                        )}
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    style={[styles.botaoPrimario, executando && styles.desabilitado]}
                                    activeOpacity={0.8}
                                    disabled={executando}
                                    onPress={abrirModalConcluir}
                                >
                                    <Text style={styles.botaoPrimarioTexto}>Concluir</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </View>

            <ModalConcluir
                visivel={modalVisivel}
                enviando={executando}
                erro={erroModal}
                onFechar={() => !executando && setModalVisivel(false)}
                onConfirmar={concluir}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: "#f4f7f7" },
    container: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
    headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
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
    conteudo: { paddingBottom: 24 },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#fce9e9",
    },
    patrimonioRow: { flexDirection: "row", alignItems: "center" },
    iconWrapper: {
        width: 56,
        height: 56,
        backgroundColor: "#ffd8d8",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    patrimonioImagem: {
        width: 56,
        height: 56,
        borderRadius: 10,
        marginRight: 14,
        backgroundColor: "#ffd8d8",
    },
    patrimonioNome: { color: "#270d0d", fontSize: 18, fontWeight: "700" },
    sub: { color: "#8a7373", fontSize: 13, marginTop: 2 },
    linhaBadges: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
    secao: {
        color: "#b01d2e",
        fontSize: 11,
        fontWeight: "600",
        textTransform: "uppercase",
        marginTop: 16,
    },
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
    botoes: { flexDirection: "row", gap: 12, paddingVertical: 16 },
    botaoPrimario: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        backgroundColor: "#c9131c",
        alignItems: "center",
        justifyContent: "center",
    },
    botaoPrimarioTexto: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
    botaoSecundario: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#c9131c",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    botaoSecundarioTexto: { color: "#c9131c", fontSize: 16, fontWeight: "600" },
    desabilitado: { opacity: 0.5 },
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
