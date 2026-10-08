import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ESTILOS = {
    Pendente: { label: "Pendente", bg: "#fff4d6", texto: "#a5710a" },
    "Em andamento": { label: "Em andamento", bg: "#ffd8d8", texto: "#c9131c" },
    "Concluído": { label: "Concluída", bg: "#e3f7ea", texto: "#1f9254" },
};

export default function BadgeStatusRequisicao({ status }) {
    const e = ESTILOS[status] || { label: status || "-", bg: "#eeeeee", texto: "#555555" };

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
