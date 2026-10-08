import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ArrowLeft, Box } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    criarRequisicao,
    ehErroDeSessao,
    encerrarSessaoExpirada,
    mensagemDeErro,
} from "../../services/requisicaoGeralService.js";
import { BASE_URL } from "../../services/api.js";

const iconColor = "#c9131c";
const MIN = 10;
const MAX = 200;

// valor = o que vai para a API (sem acento em "Media")
const PRIORIDADES = [
    { valor: "Alta", label: "Alta" },
    { valor: "Media", label: "Média" },
    { valor: "Baixa", label: "Baixa" },
];

export default function NovaRequisicaoScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { patrimonio, idSala, nomeSala } = route.params || {};

    const [descricao, setDescricao] = useState("");
    const [prioridade, setPrioridade] = useState("Media");
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState(null);
    const [idRequisicaoExistente, setIdRequisicaoExistente] = useState(null);

    const tamanho = descricao.trim().length;
    const valida = tamanho >= MIN && tamanho <= MAX;
    const desabilitado = !valida || enviando || !patrimonio;

    async function enviar() {
        if (desabilitado) return;

        try {
            setEnviando(true);
            setErro(null);
            setIdRequisicaoExistente(null);

            const token = await obterToken();
            await criarRequisicao(token, {
                idPatrimonio: patrimonio.id_patrimonio,
                descricao: descricao.trim(),
                prioridade,
            });

            Alert.alert("Requisição enviada", "A manutenção foi avisada.");
            navigation.goBack();
        } catch (error) {
            console.error("Erro ao criar requisição", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }

            if (error?.response?.status === 409) {
                setIdRequisicaoExistente(error.response.data?.id_requisicao ?? null);
            }

            // o texto digitado é mantido
            setErro(mensagemDeErro(error, "Não foi possível enviar a requisição."));
        } finally {
            setEnviando(false);
        }
    }

    function verRequisicao() {
        navigation.replace("RequisicaoDetalheScreen", {
            idRequisicao: idRequisicaoExistente,
        });
    }

    const urlImagem = patrimonio?.caminho_imagem;

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps="handled"
                >
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
                            <Text style={styles.title}>Nova requisição</Text>
                        </View>
                    </View>

                    <View style={styles.patrimonioCard}>
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
                            <Text style={styles.patrimonioNome} numberOfLines={1}>
                                {patrimonio?.nome}
                            </Text>
                            {!!patrimonio?.numero_patrimonio && (
                                <Text style={styles.patrimonioSub}>
                                    Nº {patrimonio.numero_patrimonio}
                                </Text>
                            )}
                            {!!nomeSala && <Text style={styles.patrimonioSub}>{nomeSala}</Text>}
                        </View>
                    </View>

                    <Text style={styles.label}>Descrição do problema</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Descreva o problema encontrado"
                        placeholderTextColor="#a99"
                        multiline
                        maxLength={MAX}
                        value={descricao}
                        onChangeText={setDescricao}
                        editable={!enviando}
                    />
                    <Text style={[styles.contador, tamanho > 0 && tamanho < MIN && styles.contadorErro]}>
                        {tamanho}/{MAX}
                        {tamanho < MIN ? ` (mínimo ${MIN})` : ""}
                    </Text>

                    <Text style={styles.label}>Prioridade</Text>
                    <View style={styles.chips}>
                        {PRIORIDADES.map((p) => {
                            const ativo = p.valor === prioridade;
                            return (
                                <TouchableOpacity
                                    key={p.valor}
                                    activeOpacity={0.8}
                                    disabled={enviando}
                                    style={[styles.chip, ativo && styles.chipAtivo]}
                                    onPress={() => setPrioridade(p.valor)}
                                >
                                    <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                                        {p.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {!!erro && (
                        <View style={styles.erroBox}>
                            <Text style={styles.erroTexto}>{erro}</Text>
                            {!!idRequisicaoExistente && (
                                <TouchableOpacity style={styles.erroBotao} onPress={verRequisicao}>
                                    <Text style={styles.erroBotaoTexto}>Ver requisição</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.botaoEnviar, desabilitado && styles.botaoDesabilitado]}
                        activeOpacity={0.8}
                        disabled={desabilitado}
                        onPress={enviar}
                    >
                        {enviando ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.botaoEnviarTexto}>Enviar requisição</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: "#f4f7f7" },
    container: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
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
    patrimonioCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: "#fce9e9",
        marginBottom: 24,
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
    patrimonioNome: { color: "#270d0d", fontSize: 16, fontWeight: "600" },
    patrimonioSub: { color: "#8a7373", fontSize: 13, marginTop: 2 },
    label: { color: "#5a4646", fontSize: 13, fontWeight: "600", marginBottom: 10 },
    textArea: {
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e6d3d3",
        borderRadius: 12,
        padding: 12,
        minHeight: 120,
        textAlignVertical: "top",
        color: "#270d0d",
        fontSize: 14,
    },
    contador: { color: "#8a7373", fontSize: 12, textAlign: "right", marginTop: 6, marginBottom: 20 },
    contadorErro: { color: "#c9131c" },
    chips: { flexDirection: "row", gap: 8, marginBottom: 24 },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e6d3d3",
        backgroundColor: "#fbf5f5",
    },
    chipAtivo: { backgroundColor: "#c9131c", borderColor: "#c9131c" },
    chipTexto: { color: "#5a4646", fontSize: 14, fontWeight: "600" },
    chipTextoAtivo: { color: "#ffffff" },
    erroBox: {
        backgroundColor: "#ffd8d8",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
    },
    erroTexto: { color: "#c9131c", fontSize: 14 },
    erroBotao: {
        alignSelf: "flex-start",
        marginTop: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#c9131c",
    },
    erroBotaoTexto: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
    botaoEnviar: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#c9131c",
        alignItems: "center",
        justifyContent: "center",
    },
    botaoDesabilitado: { opacity: 0.5 },
    botaoEnviarTexto: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
});
