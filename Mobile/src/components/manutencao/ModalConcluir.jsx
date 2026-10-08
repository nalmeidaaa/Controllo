import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from "react-native";

const MIN = 5;
const MAX = 200;

export default function ModalConcluir({ visivel, enviando, erro, onFechar, onConfirmar }) {
    const [observacao, setObservacao] = useState("");

    useEffect(() => {
        if (visivel) setObservacao("");
    }, [visivel]);

    const tamanho = observacao.trim().length;
    const valida = tamanho >= MIN && tamanho <= MAX;
    const desabilitado = !valida || enviando;

    return (
        <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.card}>
                    <Text style={styles.titulo}>Concluir requisição</Text>
                    <Text style={styles.label}>Observação da conclusão</Text>

                    <TextInput
                        style={styles.textArea}
                        placeholder="Descreva o que foi feito"
                        placeholderTextColor="#a99"
                        multiline
                        maxLength={MAX}
                        value={observacao}
                        onChangeText={setObservacao}
                        editable={!enviando}
                    />
                    <Text style={[styles.contador, tamanho > 0 && tamanho < MIN && styles.contadorErro]}>
                        {tamanho}/{MAX}
                        {tamanho < MIN ? ` (mínimo ${MIN})` : ""}
                    </Text>

                    {!!erro && <Text style={styles.erro}>{erro}</Text>}

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={onFechar}
                            disabled={enviando}
                        >
                            <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnConfirmar, desabilitado && styles.desabilitado]}
                            onPress={() => onConfirmar(observacao.trim())}
                            disabled={desabilitado}
                        >
                            {enviando ? (
                                <ActivityIndicator color="#ffffff" />
                            ) : (
                                <Text style={styles.btnConfirmarTexto}>Concluir</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(18, 18, 20, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: { width: "100%", maxWidth: 420, backgroundColor: "#ffffff", borderRadius: 16, padding: 20 },
    titulo: { color: "#270d0d", fontSize: 18, fontWeight: "700", marginBottom: 14 },
    label: { color: "#5a4646", fontSize: 13, fontWeight: "600", marginBottom: 8 },
    textArea: {
        borderWidth: 1,
        borderColor: "#e6d3d3",
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        textAlignVertical: "top",
        color: "#270d0d",
        fontSize: 14,
    },
    contador: { color: "#8a7373", fontSize: 12, textAlign: "right", marginTop: 6 },
    contadorErro: { color: "#c9131c" },
    erro: {
        color: "#c9131c",
        backgroundColor: "#fde8e9",
        borderRadius: 8,
        padding: 10,
        fontSize: 13,
        marginTop: 10,
    },
    footer: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
    btnCancelar: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e6d3d3",
    },
    btnCancelarTexto: { color: "#5a4646", fontSize: 14, fontWeight: "600" },
    btnConfirmar: {
        minWidth: 96,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: "#c9131c",
    },
    btnConfirmarTexto: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    desabilitado: { opacity: 0.5 },
});
