import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BadgeStatusRequisicao from "./BadgeStatusRequisicao.jsx";
import BadgePrioridade from "./BadgePrioridade.jsx";
import { useTema } from "../../theme/tema.jsx";

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

export default function CardRequisicao({ requisicao, onPress }) {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const concluida = requisicao.status_requisicao === "Concluído";

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
            <View style={styles.topo}>
                <View style={styles.flex}>
                    <Text style={styles.titulo} numberOfLines={1}>
                        {requisicao.patrimonio?.nome}
                    </Text>
                    <Text style={styles.sub}>
                        {requisicao.patrimonio?.numero_patrimonio
                            ? `Nº ${requisicao.patrimonio.numero_patrimonio}`
                            : ""}
                        {requisicao.sala?.descricao ? ` • ${requisicao.sala.descricao}` : ""}
                    </Text>
                </View>
                <BadgeStatusRequisicao status={requisicao.status_requisicao} />
            </View>

            {!!requisicao.descricao && (
                <Text style={styles.descricao} numberOfLines={2}>
                    {requisicao.descricao}
                </Text>
            )}

            <View style={styles.rodape}>
                <BadgePrioridade prioridade={requisicao.prioridade} />
                <View style={styles.flex}>
                    <Text style={styles.meta} numberOfLines={1}>
                        {requisicao.solicitante?.nome
                            ? `Solicitante: ${requisicao.solicitante.nome}`
                            : "Solicitante removido"}
                    </Text>
                    <Text style={styles.meta}>
                        {concluida
                            ? `Concluída em ${formatarData(requisicao.data_conclusao)}`
                            : `Aberta em ${formatarData(requisicao.abertura)}`}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const criarStyles = (c) => StyleSheet.create({
    flex: { flex: 1 },
    card: {
        backgroundColor: c.superficie,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: c.borda,
        shadowColor: c.sombra,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    topo: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
    titulo: { color: c.texto, fontSize: 15, fontWeight: "700" },
    sub: { color: c.textoMudo, fontSize: 12, marginTop: 2 },
    descricao: { color: c.textoSecundario, fontSize: 13, marginTop: 10 },
    rodape: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
    meta: { color: c.textoDiscreto, fontSize: 11, textAlign: "right" },
});
