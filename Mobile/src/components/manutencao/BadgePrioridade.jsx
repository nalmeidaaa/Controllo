import React from "react";
import { View, Text, StyleSheet } from "react-native";

// chave = valor do banco (Media sem acento)
const ESTILOS = {
    Alta: { label: "Alta", bg: "#ffd8d8", texto: "#c9131c" },
    Media: { label: "Média", bg: "#ffe6cf", texto: "#b05a10" },
    Baixa: { label: "Baixa", bg: "#e6e6e6", texto: "#555555" },
};

export default function BadgePrioridade({ prioridade }) {
    const e = ESTILOS[prioridade] || { label: prioridade || "-", bg: "#eeeeee", texto: "#555555" };

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
