import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTema } from "../../theme/tema.jsx";

export default function BadgeStatusRequisicao({ status }) {
    const { cores } = useTema();

    const estilos = {
        Pendente: { label: "Pendente", bg: cores.alerta.fundo, texto: cores.alerta.cor },
        "Em andamento": { label: "Em andamento", bg: cores.andamento.fundo, texto: cores.andamento.cor },
        "Concluído": { label: "Concluída", bg: cores.concluido.fundo, texto: cores.concluido.cor },
    };

    const estilo = estilos[status] || { label: status || "-", bg: cores.neutro.fundo, texto: cores.neutro.cor };

    return (
        <View style={[styles.badge, { backgroundColor: estilo.bg }]}>
            <Text style={[styles.texto, { color: estilo.texto }]}>{estilo.label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    texto: {
        fontSize: 11,
        fontWeight: "700",
    },
});
