import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CheckCircle2, Clock, Bell, Send, AlertCircle } from "lucide-react-native";

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

const TIPOS = {
    Abertura: { titulo: "Requisição enviada", fundo: "#fff4d6", Icone: Send, cor: "#a5710a" },
    Andamento: { titulo: "Requisição em andamento", fundo: "#ffd8d8", Icone: Clock, cor: "#c9131c" },
    Finalizacao: { titulo: "Requisição concluída!", fundo: "#e3f7ea", Icone: CheckCircle2, cor: "#1f9254" },
};

function CardMensagem({ titulo, subtitulo, children }) {
    return (
        <View style={styles.card}>
            <View style={[styles.iconWrapper, styles.iconWrapperNeutro]}>{children}</View>
            <View style={styles.textWrapper}>
                <Text style={styles.titulo}>{titulo}</Text>
                {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
            </View>
        </View>
    );
}

export default function MuralAtualizacoes({ atualizacoes = [], carregando = false, erro = false }) {
    const navigation = useNavigation();

    if (carregando) {
        return (
            <View style={styles.wrapper}>
                <CardMensagem titulo="Carregando atualizações...">
                    <ActivityIndicator color="#c9131c" />
                </CardMensagem>
            </View>
        );
    }

    if (erro) {
        return (
            <View style={styles.wrapper}>
                <CardMensagem
                    titulo="Não foi possível carregar o mural"
                    subtitulo="Tente novamente mais tarde."
                >
                    <AlertCircle color="#c9131c" size={22} />
                </CardMensagem>
            </View>
        );
    }

    if (!atualizacoes.length) {
        return (
            <View style={styles.wrapper}>
                <CardMensagem
                    titulo="Sem atualizações"
                    subtitulo="Nenhuma atualização recente nas suas requisições."
                >
                    <Bell color="#8a8a8a" size={22} />
                </CardMensagem>
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            {atualizacoes.slice(0, 3).map((item) => {
                const tipo = TIPOS[item.acao] || TIPOS.Abertura;
                const Icone = tipo.Icone;
                const requisicao = item.requisicao || {};
                const descricao =
                    item.acao === "Finalizacao"
                        ? item.descricao || requisicao.descricao
                        : requisicao.descricao;

                return (
                    <TouchableOpacity
                        key={item.id_historico}
                        activeOpacity={0.8}
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("RequisicaoDetalheScreen", {
                                idRequisicao: requisicao.id_requisicao,
                            })
                        }
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: tipo.fundo }]}>
                            <Icone color={tipo.cor} size={22} />
                        </View>

                        <View style={styles.textWrapper}>
                            <Text style={styles.titulo}>{tipo.titulo}</Text>

                            <Text style={styles.subtitulo}>
                                {requisicao.patrimonio?.nome}
                                {requisicao.sala?.descricao ? ` • ${requisicao.sala.descricao}` : ""}
                            </Text>

                            {!!descricao && (
                                <Text style={styles.descricao} numberOfLines={2}>
                                    {descricao}
                                </Text>
                            )}

                            <Text style={styles.data}>{formatarData(item.horario)}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 24,
        gap: 10,
    },

    card: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#ffffff",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 18,
        borderWidth: 1,
        borderColor: "#fce9e9",

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
