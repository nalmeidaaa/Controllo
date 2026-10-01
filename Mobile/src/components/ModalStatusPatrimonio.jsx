import React, { useEffect, useState } from "react";
import {
    Modal,
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
} from "react-native";
import { X } from "lucide-react-native";

const STATUS_OPCOES = ["Ok", "Pendente", "Danificado", "Manutenção", "Descartado"];

export default function ModalStatusPatrimonio({
    visivel,
    patrimonio,
    salvando,
    onFechar,
    onSalvar,
}) {
    const [status, setStatus] = useState("Ok");
    const [descricao, setDescricao] = useState("");

    useEffect(() => {
        if (visivel && patrimonio) {
            setStatus(patrimonio.status || "Ok");
            setDescricao("");
        }
    }, [visivel, patrimonio]);

    if (!visivel || !patrimonio) return null;

    function handleSalvar() {
        onSalvar?.({
            status,
            descricao: descricao.trim(),
        });
    }

    return (
        <Modal visible={visivel} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitulo} numberOfLines={1}>
                            {patrimonio.nome}
                        </Text>

                        <TouchableOpacity onPress={onFechar} hitSlop={10}>
                            <X color="#5a4646" size={22} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body}>
                        <Text style={styles.label}>Status do patrimônio</Text>

                        <View style={styles.statusList}>
                            {STATUS_OPCOES.map((opcao) => {
                                const selecionado = opcao === status;

                                return (
                                    <TouchableOpacity
                                        key={opcao}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.statusOpcao,
                                            selecionado && styles.statusOpcaoSelecionada,
                                        ]}
                                        onPress={() => setStatus(opcao)}
                                    >
                                        <Text
                                            style={[
                                                styles.statusOpcaoTexto,
                                                selecionado && styles.statusOpcaoTextoSelecionado,
                                            ]}
                                        >
                                            {opcao}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.label}>Descrição do problema</Text>

                        <TextInput
                            style={styles.textArea}
                            placeholder="Descreva o problema encontrado (opcional)"
                            placeholderTextColor="#a99"
                            multiline
                            numberOfLines={4}
                            value={descricao}
                            onChangeText={setDescricao}
                        />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={onFechar}
                            disabled={salvando}
                        >
                            <Text style={styles.btnCancelarTexto}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.btnSalvar}
                            onPress={handleSalvar}
                            disabled={salvando}
                        >
                            <Text style={styles.btnSalvarTexto}>
                                {salvando ? "Salvando..." : "Salvar"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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

    card: {
        width: "100%",
        maxWidth: 420,
        maxHeight: "85%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0e4e4",
    },

    headerTitulo: {
        flex: 1,
        color: "#270d0d",
        fontSize: 17,
        fontWeight: "700",
        marginRight: 12,
    },

    body: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },

    label: {
        color: "#5a4646",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 10,
        marginTop: 6,
    },

    statusList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },

    statusOpcao: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e6d3d3",
        backgroundColor: "#fbf5f5",
    },

    statusOpcaoSelecionada: {
        backgroundColor: "#c9131c",
        borderColor: "#c9131c",
    },

    statusOpcaoTexto: {
        color: "#5a4646",
        fontSize: 13,
        fontWeight: "600",
    },

    statusOpcaoTextoSelecionado: {
        color: "#ffffff",
    },

    textArea: {
        borderWidth: 1,
        borderColor: "#e6d3d3",
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        textAlignVertical: "top",
        color: "#270d0d",
        fontSize: 14,
        marginBottom: 20,
    },

    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "#f0e4e4",
    },

    btnCancelar: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e6d3d3",
    },

    btnCancelarTexto: {
        color: "#5a4646",
        fontSize: 14,
        fontWeight: "600",
    },

    btnSalvar: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: "#c9131c",
    },

    btnSalvarTexto: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
});