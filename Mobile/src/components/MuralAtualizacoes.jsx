import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { CheckCircle2, Clock, Bell } from "lucide-react-native";

function formatarData(isoString) {
    if (!isoString) return "";

    const data = new Date(isoString);

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function MuralAtualizacoes({ requisicao }) {
    if (!requisicao) {
        return (
            <View style={styles.card}>
                <View style={[styles.iconWrapper, styles.iconWrapperNeutro]}>
                    <Bell color="#8a8a8a" size={22} />
                </View>

                <View style={styles.textWrapper}>
                    <Text style={styles.titulo}>Sem atualizações</Text>
                    <Text style={styles.subtitulo}>
                        Nenhuma requisição foi feita até o momento.
                    </Text>
                </View>
            </View>
        );
    }

    const concluida = requisicao.concluida;

    return (
        <View style={styles.card}>
            <View
                style={[
                    styles.iconWrapper,
                    concluida ? styles.iconWrapperOk : styles.iconWrapperPendente,
                ]}
            >
                {concluida ? (
                    <CheckCircle2 color="#1f9254" size={22} />
                ) : (
                    <Clock color="#c9131c" size={22} />
                )}
            </View>

            <View style={styles.textWrapper}>
                <Text style={styles.titulo}>
                    {concluida ? "Requisição concluída!" : "Requisição em andamento"}
                </Text>

                <Text style={styles.subtitulo}>
                    {requisicao.nomePatrimonio}
                    {requisicao.nomeSala ? ` • ${requisicao.nomeSala}` : ""}
                </Text>

                {!!requisicao.descricao && (
                    <Text style={styles.descricao} numberOfLines={2}>
                        {requisicao.descricao}
                    </Text>
                )}

                <Text style={styles.data}>
                    {formatarData(
                        concluida ? requisicao.concluidoEm : requisicao.criadoEm
                    )}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#fce9e9",
        marginBottom: 24,

        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },

    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },

    iconWrapperOk: {
        backgroundColor: "#e3f7ea",
    },

    iconWrapperPendente: {
        backgroundColor: "#ffd8d8",
    },

    iconWrapperNeutro: {
        backgroundColor: "#eeeeee",
    },

    textWrapper: {
        flex: 1,
    },

    titulo: {
        color: "#270d0d",
        fontSize: 15,
        fontWeight: "700",
    },

    subtitulo: {
        color: "#5a4646",
        fontSize: 13,
        marginTop: 2,
    },

    descricao: {
        color: "#7a6a6a",
        fontSize: 12,
        marginTop: 4,
    },

    data: {
        color: "#a99",
        fontSize: 11,
        marginTop: 6,
    },
});