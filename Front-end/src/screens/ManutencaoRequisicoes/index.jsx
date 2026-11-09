import React, { useMemo, useCallback, useRef, useState } from "react";
import { View, StyleSheet, Text, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { obterToken } from "../../storage/usuario/dados.storage.js";
import {
    listarRequisicoes,
    ehErroDeSessao,
    encerrarSessaoExpirada,
} from "../../services/requisicaoManutencaoService.js";
import CardRequisicao from "../../components/manutencao/CardRequisicao.jsx";
import CabecalhoTela from "../../components/shared/CabecalhoTela.jsx";
import EstadoVazio from "../../components/shared/EstadoVazio.jsx";
import EntradaAnimada from "../../animations/EntradaAnimada.jsx";
import PressionavelAnimado from "../../animations/PressionavelAnimado.jsx";
import { EsqueletoCartaoLinha } from "../../animations/Esqueleto.jsx";
import { useTema } from "../../theme/tema.jsx";

const LIMITE = 10;

// valor = parâmetro `status` enviado à API
const FILTROS = [
    { label: "Todas", valor: undefined },
    { label: "Pendentes", valor: "Pendente" },
    { label: "Em andamento", valor: "Em andamento" },
    { label: "Concluídas", valor: "Concluído" },
];

export default function ManutencaoRequisicoesScreen() {
    const { cores } = useTema();
    const styles = useMemo(() => criarStyles(cores), [cores]);
    const navigation = useNavigation();

    const [filtro, setFiltro] = useState(undefined);
    const [requisicoes, setRequisicoes] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagina, setPagina] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [carregandoMais, setCarregandoMais] = useState(false);
    const [erro, setErro] = useState(false);

    // descarta respostas de requisições antigas (troca rápida de filtro)
    const contador = useRef(0);

    async function carregar({ status, puxar = false } = {}) {
        const id = ++contador.current;

        try {
            if (puxar) setAtualizando(true);
            else setCarregando(true);
            setErro(false);

            const token = await obterToken();
            const resposta = await listarRequisicoes(token, { pagina: 1, limite: LIMITE, status });

            if (id !== contador.current) return;

            // a ordem já vem pronta do servidor: não reordenar
            setRequisicoes(resposta?.result ?? []);
            setTotal(resposta?.total ?? 0);
            setPagina(1);
        } catch (error) {
            console.error("Erro ao carregar requisições", error);
            if (id !== contador.current) return;

            if (ehErroDeSessao(error)) {
                encerrarSessaoExpirada(navigation);
                return;
            }
            setErro(true);
        } finally {
            if (id === contador.current) {
                setCarregando(false);
                setAtualizando(false);
            }
        }
    }

    async function carregarMais() {
        if (carregando || atualizando || carregandoMais || erro) return;
        if (requisicoes.length >= total) return;

        const id = contador.current;

        try {
            setCarregandoMais(true);
            const token = await obterToken();
            const proxima = pagina + 1;
            const resposta = await listarRequisicoes(token, {
                pagina: proxima,
                limite: LIMITE,
                status: filtro,
            });

            if (id !== contador.current) return;

            const novos = resposta?.result ?? [];
            setRequisicoes((atual) => {
                const ids = new Set(atual.map((r) => r.id_requisicao));
                return [...atual, ...novos.filter((r) => !ids.has(r.id_requisicao))];
            });
            setTotal(resposta?.total ?? total);
            setPagina(proxima);
        } catch (error) {
            console.error("Erro ao carregar mais requisições", error);
            if (ehErroDeSessao(error)) encerrarSessaoExpirada(navigation);
        } finally {
            setCarregandoMais(false);
        }
    }

    useFocusEffect(
        useCallback(() => {
            carregar({ status: filtro });
        }, [filtro])
    );

    function trocarFiltro(valor) {
        if (valor === filtro) return;
        setRequisicoes([]);
        setTotal(0);
        setFiltro(valor); // o useFocusEffect recarrega
    }

    function renderItem({ item, index }) {
        return (
            <EntradaAnimada atraso={Math.min(index, 8) * 70} distancia={14}>
                <CardRequisicao
                    requisicao={item}
                    onPress={() =>
                        navigation.navigate("ManutencaoRequisicaoDetalheScreen", {
                            idRequisicao: item.id_requisicao,
                        })
                    }
                />
            </EntradaAnimada>
        );
    }

    let conteudo;
    if (carregando) {
        conteudo = (
            <EntradaAnimada>
                <EsqueletoCartaoLinha quantidade={4} />
            </EntradaAnimada>
        );
    } else if (erro) {
        conteudo = (
            <EstadoVazio
                erro
                titulo="Não foi possível carregar as requisições"
                acaoTexto="Tentar novamente"
                onAcao={() => carregar({ status: filtro })}
            />
        );
    } else {
        conteudo = (
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
                        onRefresh={() => carregar({ status: filtro, puxar: true })}
                        colors={[cores.marca]}
                        tintColor={cores.marca}
                    />
                }
                onEndReached={carregarMais}
                onEndReachedThreshold={0.4}
                ListEmptyComponent={
                    <EstadoVazio
                        compacto
                        titulo="Nenhuma requisição encontrada"
                        descricao="Tente outro filtro para ver outras requisições."
                    />
                }
                ListFooterComponent={
                    carregandoMais ? (
                        <ActivityIndicator style={styles.rodape} color={cores.marca} />
                    ) : null
                }
                renderItem={renderItem}
            />
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <CabecalhoTela titulo="Itens pendentes" onVoltar={() => navigation.goBack()} marginBottom={20} />

                {/* Filtros em forma de chips: o ativo ganha a cor da marca */}
                <EntradaAnimada atraso={100} distancia={10} style={styles.chips}>
                    {FILTROS.map((f) => {
                        const ativo = f.valor === filtro;
                        return (
                            <PressionavelAnimado
                                key={f.label}
                                escala={0.94}
                                style={[styles.chip, ativo && styles.chipAtivo]}
                                onPress={() => trocarFiltro(f.valor)}
                                accessibilityLabel={`Filtrar por ${f.label}`}
                            >
                                <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                                    {f.label}
                                </Text>
                            </PressionavelAnimado>
                        );
                    })}
                </EntradaAnimada>

                {conteudo}
            </View>
        </SafeAreaView>
    );
}

const criarStyles = (c) =>
    StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: c.fundo },
        container: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
        chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
        chip: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: c.bordaInput,
            backgroundColor: c.fundoCampo,
        },
        chipAtivo: { backgroundColor: c.marca, borderColor: c.marca },
        chipTexto: { color: c.textoSecundario, fontSize: 13, fontWeight: "600" },
        chipTextoAtivo: { color: "#ffffff" },
        lista: { gap: 14, paddingBottom: 40 },
        listaVazia: { flexGrow: 1, justifyContent: "center", paddingBottom: 80 },
        rodape: { paddingVertical: 16 },
    });
