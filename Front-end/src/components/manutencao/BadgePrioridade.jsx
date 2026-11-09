import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTema } from "../../theme/tema.jsx";

export default function BadgePrioridade({ prioridade }) {
    const { cores } = useTema();

    // chave = valor do banco (Media sem acento)
    const estilos = {
        Alta: { label: "Alta", bg: cores.marcaSuave, texto: cores.marcaTexto },
        Media: { label: "Média", bg: cores.prioridadeMedia.fundo, texto: cores.prioridadeMedia.cor },
        Baixa: { label: "Baixa", bg: cores.prioridadeBaixa.fundo, texto: cores.prioridadeBaixa.cor },
    };

    const e = estilos[prioridade] || { label: prioridade || "-", bg: cores.neutro.fundo, texto: cores.neutro.cor };

    return (
        <View style={[styles.badge, { backgroundColor: e.bg }]}>
            <Text style={[styles.texto, { color: e.texto }]}>{e.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start" },
    texto: { fontSize: 11, fontWeight: "700" },
});
