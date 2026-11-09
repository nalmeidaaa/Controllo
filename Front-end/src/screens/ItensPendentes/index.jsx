import React, { useMemo, useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { CheckCircle2, Clock } from "lucide-react-native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    buscarMinhasRequisicoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoGeralService.js";
import BadgeStatusRequisicao from "../../components/geral/BadgeStatusRequisicao.jsx";
import CabecalhoTela from "../../components/shared/CabecalhoTela.jsx";
import EstadoVazio from "../../components/shared/EstadoVazio.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoLinha } from "../../animations/Esqueleto.jsx";
import { useTema } from "../../theme/tema.jsx";

function formatarData(isoString) {
    if (!isoString) return "";

    const data = new Date(isoString);

    return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ItensPendentesScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();

    const [requisicoes, setRequisicoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState(false);

    async function carregarRequisicoes(puxar = false) {
        try {
            if (puxar) setAtualizando(true);
            else setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await buscarMinhasRequisicoes(token);

            // a ordem já vem pronta do servidor: não reordenar
            setRequisicoes(resposta?.result ?? []);
        } catch (error) {
            console.error("Erro ao carregar itens pendentes", error);

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            setCarregando(false);
            setAtualizando(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregarRequisicoes();
        }, [])
    );

    function renderItem({ item, index }) {
        const concluida = item.status_requisicao === "Concluído";

        return (
            <EntradaAnimada atraso={Math.min(index, 8) * 70} distancia={14}>
                <PressionavelAnimado
                    style={styles.card}
                    onPress={() =>
                        navigation.navigate("RequisicaoDetalheScreen", {
                            idRequisicao: item.id_requisicao,
                        })
                    }
                >
                    <View
                        style={[
                            styles.iconWrapper,
                            concluida ? styles.iconWrapperOk : styles.iconWrapperPendente,
                        ]}
                    >
                        {concluida ? (
                            <CheckCircle2 color={cores.concluido.cor} size={22} />
                        ) : (
                            <Clock color={cores.marca} size={22} />
                        )}
                    </View>

                    <View style={styles.cardText}>
                        <EstadoTexto
                            titulo={item.patrimonio?.nome}
                            numero={item.patrimonio?.numero_patrimonio}
                            sala={item.sala?.descricao}
                            descricao={item.descricao}
                            data={
                                concluida
                                    ? `Concluída em ${formatarData(item.data_conclusao)}`
                                    : `Criada em ${formatarData(item.abertura)}`
                            }
                            styles={styles}
                        />
                    </View>

                    <BadgeStatusRequisicao status={item.status_requisicao} />
                </PressionavelAnimado>
            </EntradaAnimada>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CabecalhoTela titulo="Itens pendentes" onVoltar={() => navigation.goBack()} />

                {carregando ? (
                    <EntradaAnimada>
                        <EsqueletoCartaoLinha quantidade={4} />
                    </EntradaAnimada>
                ) : erro ? (
                    <EstadoVazio
                        erro
                        titulo="Não foi possível carregar as requisições"
                        acaoTexto="Tentar novamente"
                        onAcao={() => carregarRequisicoes()}
                    />
                ) : (
                    <FlatList
                        data={requisicoes}
                        keyExtractor={(item) => String(item.id_requisicao)}
                        contentContainerStyle={[
                            styles.lista,
                            requisicoes.length === 0 && styles.listaVazia,
                        ]}
                        refreshControl={
                            <RefreshControl
                                refreshing={atualizando}
                                onRefresh={() => carregarRequisicoes(true)}
                                colors={[cores.marca]}
                                tintColor={cores.marca}
                            />
                        }
                        ListEmptyComponent={
                            <EstadoVazio
                                compacto
                                titulo="Nenhuma requisição"
                                descricao="Nenhuma requisição foi feita até o momento."
                            />
                        }
                        renderItem={renderItem}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

/* Textos do cartão, em um componente próprio para manter o renderItem enxuto */
function EstadoTexto({ titulo, numero, sala, descricao, data, styles }) {
    return (
        <>
            <Text style={styles.cardTitle} numberOfLines={1}>
                {titulo}
                {numero ? ` • Nº ${numero}` : ""}
            </Text>
            {!!sala && <Text style={styles.cardSubtitle}>{sala}</Text>}
            {!!descricao && (
                <Text style={styles.cardDescricao} numberOfLines={2}>
                    {descricao}
                </Text>
            )}
            <Text style={styles.cardData}>{data}</Text>
        </>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: c.fundo },
        container: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
        lista: { gap: 14, paddingBottom: 40 },
        listaVazia: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
        card: {
            alignItems: "flex-start",
            flexDirection: "row",
            backgroundColor: c.superficie,
            borderRadius: 14,
            paddingHorizontal: 18,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: c.borda,
            shadowColor: c.sombra,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
        },
        iconWrapper: {
            width: 42,
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
        },
        iconWrapperOk: { backgroundColor: c.concluido.fundo },
        iconWrapperPendente: { backgroundColor: c.marcaSuave },
        cardText: { flex: 1, marginRight: 8 },
        cardTitle: { color: c.texto, fontSize: 15, fontWeight: "600" },
        cardSubtitle: { color: c.textoMudo, fontSize: 12, marginTop: 2 },
        cardDescricao: { color: c.textoSecundario, fontSize: 12, marginTop: 4 },
        cardData: { color: c.textoDiscreto, fontSize: 11, marginTop: 6 },
    });
