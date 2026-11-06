import React, { useMemo, useEffect, useState } from "react";
import { useTema } from "../../theme/tema.jsx";
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
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
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
                        placeholderTextColor={cores.textoDiscreto}multiline
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

const criarStyles = (c) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: c.overlay,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    card: { width: "100%", maxWidth: 420, backgroundColor: c.superficie, borderRadius: 16, padding: 20 },
    titulo: { color: c.texto, fontSize: 18, fontWeight: "700", marginBottom: 14 },
    label: { color: c.textoSecundario, fontSize: 13, fontWeight: "600", marginBottom: 8 },
    textArea: {
        borderWidth: 1,
        borderColor: c.bordaInput,
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        textAlignVertical: "top",
        color: c.texto,
        fontSize: 14,
    },
    contador: { color: c.textoMudo, fontSize: 12, textAlign: "right", marginTop: 6 },
    contadorErro: { color: c.marcaTexto },
    erro: {
        color: c.marcaTexto,
        backgroundColor: c.marcaMuitoSuave,
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
        borderColor: c.bordaInput,
    },
    btnCancelarTexto: { color: c.textoSecundario, fontSize: 14, fontWeight: "600" },
    btnConfirmar: {
        minWidth: 96,
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: c.marca,
    },
    btnConfirmarTexto: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
    desabilitado: { opacity: 0.5 },
});
