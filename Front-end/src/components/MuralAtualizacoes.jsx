import React, { useMemo } from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTema } from "../theme/tema.jsx";
import { CheckCircle2, Clock, Bell, Send, AlertCircle, ChevronRight } from "lucide-react-native";
import EntradaAnimada from "../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoLinha } from "../animations/Esqueleto.jsx";
import EstadoVazio from "./shared/EstadoVazio.jsx";

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

function criarTipos(c) {
    return {
        Abertura: { titulo: "Requisição enviada", fundo: c.alerta.fundo, Icone: Send, cor: c.alerta.cor },
        Andamento: { titulo: "Requisição em andamento", fundo: c.andamento.fundo, Icone: Clock, cor: c.andamento.cor },
        Finalizacao: { titulo: "Requisição concluída!", fundo: c.concluido.fundo, Icone: CheckCircle2, cor: c.concluido.cor },
    };
}

export default function MuralAtualizacoes({ atualizacoes = [], carregando = false, erro = false }) {
    const navigation = useNavigation();
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const TIPOS = useMemo(() => criarTipos(cores), [cores]);

    if (carregando) {
        return (
            <EntradaAnimada style={styles.muralContainer}>
                <Text style={styles.muralTitulo}>Mural de Atualizações</Text>
                <EsqueletoCartaoLinha quantidade={3} />
            </EntradaAnimada>
        );
    }

    if (erro) {
        return (
            <EntradaAnimada style={styles.muralContainer}>
                <Text style={styles.muralTitulo}>Mural de Atualizações</Text>
                <EstadoVazio
                    compacto
                    erro
                    titulo="Não foi possível carregar o mural"
                    descricao="Tente novamente mais tarde."
                />
            </EntradaAnimada>
        );
    }

    if (!atualizacoes.length) {
        return (
            <EntradaAnimada style={styles.muralContainer}>
                <Text style={styles.muralTitulo}>Mural de Atualizações</Text>
                <EstadoVazio
                    compacto
                    Icone={Bell}
                    titulo="Sem atualizações"
                    descricao="Nenhuma atualização recente nas suas requisições."
                />
            </EntradaAnimada>
        );
    }

    const renderItem = ({ item, index }) => {
        const tipo = TIPOS[item.acao] || TIPOS.Abertura;
        const Icone = tipo.Icone;
        const requisicao = item.requisicao || {};
        const descricao =
            item.acao === "Finalizacao"
                ? item.descricao || requisicao.descricao
                : requisicao.descricao;

        return (
            <EntradaAnimada atraso={index * 90} distancia={14}>
                <PressionavelAnimado
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
                </PressionavelAnimado>
            </EntradaAnimada>
        );
    };

    // Pega sempre até no máximo 3 itens para exibir no mural
    const atualizacoesExibidas = atualizacoes.slice(0, 3);

    return (
        <EntradaAnimada style={styles.muralContainer}>
            <Text style={styles.muralTitulo}>Mural de Atualizações</Text>

            <FlatList
                data={atualizacoesExibidas}
                keyExtractor={(item) => String(item.id_historico)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
            />

            <PressionavelAnimado
                style={styles.botaoExibirMais}
                escala={0.98}
                onPress={() => navigation.navigate("TodasAtualizacoesScreen")}
            >
                <Text style={styles.textoBotaoExibirMais}>Exibir mais</Text>
                <ChevronRight color={cores.marca} size={18} />
            </PressionavelAnimado>
        </EntradaAnimada>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        muralContainer: {
            backgroundColor: c.cardMural,
            borderRadius: 20,
            padding: 16,
            marginVertical: 12,
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
        },

        muralTitulo: {
            color: c.texto,
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 14,
            paddingLeft: 4,
        },

        listContent: {
            gap: 12,
        },

        card: {
            flexDirection: "row",
            alignItems: "flex-start",
            backgroundColor: c.superficie,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: c.bordaMural,
        },

        iconWrapper: {
            width: 42,
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
        },

        textWrapper: {
            flex: 1,
        },

        titulo: {
            color: c.texto,
            fontSize: 15,
            fontWeight: "700",
        },

        subtitulo: {
            color: c.textoSecundario,
            fontSize: 13,
            marginTop: 2,
        },

        descricao: {
            color: c.textoMural,
            fontSize: 12,
            marginTop: 4,
        },

        data: {
            color: c.textoDiscreto,
            fontSize: 11,
            marginTop: 6,
        },

        botaoExibirMais: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 12,
            marginTop: 12,
            borderTopWidth: 1,
            borderTopColor: c.divisor,
        },

        textoBotaoExibirMais: {
            color: c.marcaTexto,
            fontSize: 14,
            fontWeight: "600",
            marginRight: 4,
        },
    });
